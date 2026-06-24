"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, Tooltip, TextField,
  MenuItem, Stack, Checkbox, InputAdornment, Pagination, Card, Avatar, Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import VerifiedIcon from "@mui/icons-material/Verified";
import { getNewsForUser, deleteNews, updateNewsStatus } from "@/lib/firestore";
import { useRouter } from "next/navigation";
import { subscribeToAuth } from "@/lib/auth-service";

const ITEMS_PER_PAGE = 10;
const CAT_COLORS = {
  Technology: "#3b82f6",
  Sports: "#10b981",
  Culture: "#8b5cf6",
  Entertainment: "#f59e0b",
};

export default function ManageNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [successMsg, setSuccessMsg] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();

  const fetchNews = async (activeUser) => {
    if (!activeUser) return;
    try {
      setLoading(true);
      setError("");
      const data = await getNewsForUser(activeUser);
      setNews(data);
    } catch (err) {
      console.error("Error loading articles:", err);
      setError("Failed to load articles from Firestore.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (user?.role !== "admin") {
      setError("Only admins can approve articles.");
      return;
    }
    try {
      await updateNewsStatus(id, "approved");
      setNews(prev => prev.map(n => (n.id || n._id) === id ? { ...n, status: "approved" } : n));
      setSuccessMsg("Article approved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError("Failed to approve article.");
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => {
      setUser(u);
      if (u) fetchNews(u);
      if (!u) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const visibleNews = useMemo(() => {
    if (!user) return [];
    if (user.role === "admin") return news;
    if (user.role === "writer") {
      return news.filter((item) =>
        item.createdBy === user.uid ||
        item.author?.uid === user.uid ||
        item.author?.email === user.email
      );
    }
    return [];
  }, [news, user]);

  const categories = useMemo(() => [...new Set(visibleNews.map((n) => n.category))].filter(Boolean), [visibleNews]);

  const filteredNews = useMemo(() => {
    let result = [...visibleNews];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((n) =>
        n.title.toLowerCase().includes(q) ||
        n.author?.name?.toLowerCase().includes(q) ||
        n.category?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((n) => n.category === categoryFilter);
    }

    // Sort
    switch (sortBy) {
      case "views":
        result.sort((a, b) => (b.total_view || 0) - (a.total_view || 0));
        break;
      case "title":
        result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "date":
      default:
        result.sort((a, b) => {
          const dA = a.author?.published_date || "";
          const dB = b.author?.published_date || "";
          return dB.localeCompare(dA);
        });
    }

    return result;
  }, [visibleNews, search, categoryFilter, sortBy]);

  const pageCount = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const paginatedNews = filteredNews.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleDelete = async (id) => {
    if (user?.role !== "admin") {
      setError("Only admins can delete articles.");
      return;
    }
    if (!confirm("Permanently delete this article? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteNews(id);
      setNews((prev) => prev.filter((n) => (n.id || n._id) !== id));
      setSelected((prev) => prev.filter((s) => s !== id));
      setSuccessMsg("Article deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Error deleting article:", err);
      alert("Error deleting article from Firestore.");
    } finally {
      setDeletingId("");
    }
  };

  const handleBulkDelete = async () => {
    if (user?.role !== "admin") {
      setError("Only admins can delete articles.");
      return;
    }
    if (!confirm(`Delete ${selected.length} selected articles? This cannot be undone.`)) return;
    for (const id of selected) {
      try {
        await deleteNews(id);
      } catch (err) { /* continue */ }
    }
    setNews((prev) => prev.filter((n) => !selected.includes(n.id || n._id)));
    setSuccessMsg(`${selected.length} articles deleted!`);
    setSelected([]);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const allIds = paginatedNews.map((n) => n._id || n.id);
    const allSelected = allIds.every((id) => selected.includes(id));
    setSelected(allSelected ? selected.filter((s) => !allIds.includes(s)) : [...new Set([...selected, ...allIds])]);
  };

  const canEdit = (item) =>
    user?.role === "admin" ||
    (user?.role === "writer" &&
      (item.createdBy === user.uid || item.author?.uid === user.uid || item.author?.email === user.email) &&
      item.status !== "approved");

  return (
    <Box>
      {/* Header */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: "#0f172a" }}>
            Manage Articles
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
            {filteredNews.length} articles found
          </Typography>
        </Box>
        {["admin", "writer"].includes(user?.role) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/dashboard/news/create")}
            sx={{
              fontWeight: 700, px: 3, borderRadius: 2, textTransform: "none",
              background: "linear-gradient(135deg, #ef4444, #f97316)",
              boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
              "&:hover": { background: "linear-gradient(135deg, #dc2626, #ef4444)", boxShadow: "0 6px 16px rgba(239,68,68,0.4)" },
            }}
          >
            {user?.role === "admin" ? "Publish Article" : "Submit Article"}
          </Button>
        )}
      </Stack>

      {user?.role === "reader" && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          Your account is currently a reader account. Apply for writer access from the dashboard overview.
        </Alert>
      )}
      {successMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{successMsg}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      {/* Filters Bar */}
      <Card sx={{ p: 2, mb: 3, borderRadius: 3, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <Stack direction={{ xs: "column", md: "row" }} gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search articles, authors..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            sx={{
              flex: 1, minWidth: 200,
              "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f8fafc" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select size="small" value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            sx={{ minWidth: 160, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f8fafc" } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><FilterListIcon sx={{ color: "#94a3b8", fontSize: 18 }} /></InputAdornment>,
            }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
          <TextField
            select size="small" value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ minWidth: 140, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f8fafc" } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SortIcon sx={{ color: "#94a3b8", fontSize: 18 }} /></InputAdornment>,
            }}
          >
            <MenuItem value="date">Latest First</MenuItem>
            <MenuItem value="views">Most Views</MenuItem>
            <MenuItem value="title">Alphabetical</MenuItem>
          </TextField>
          {user?.role === "admin" && selected.length > 0 && (
            <Button
              variant="outlined" color="error" size="small"
              startIcon={<DeleteSweepIcon />}
              onClick={handleBulkDelete}
              sx={{ fontWeight: 700, borderRadius: 2, textTransform: "none" }}
            >
              Delete ({selected.length})
            </Button>
          )}
        </Stack>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: 3, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    disabled={user?.role !== "admin"}
                    checked={paginatedNews.length > 0 && paginatedNews.every((n) => selected.includes(n._id || n.id))}
                    indeterminate={paginatedNews.some((n) => selected.includes(n._id || n.id)) && !paginatedNews.every((n) => selected.includes(n._id || n.id))}
                    onChange={toggleSelectAll}
                    sx={{ color: "#cbd5e1", "&.Mui-checked": { color: "#ef4444" } }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Article</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Published</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Views</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">Loading articles...</Typography>
                </TableCell></TableRow>
              ) : paginatedNews.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <ArticleIcon sx={{ fontSize: 48, color: "#e2e8f0", mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No articles found</Typography>
                </TableCell></TableRow>
              ) : (
                paginatedNews.map((item) => {
                  const id = item._id || item.id;
                  const isSelected = selected.includes(id);
                  return (
                    <TableRow
                      key={id}
                      selected={isSelected}
                      sx={{
                        transition: "all 0.15s",
                        "&:hover": { bgcolor: "#fafbfc" },
                        "&.Mui-selected": { bgcolor: "rgba(239,68,68,0.03)" },
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small" checked={isSelected} onChange={() => toggleSelect(id)}
                          disabled={user?.role !== "admin"}
                          sx={{ color: "#cbd5e1", "&.Mui-checked": { color: "#ef4444" } }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ color: "#0f172a", mb: 0.3, maxWidth: 320, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                            by {item.author?.name || "Unknown"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.category} size="small"
                          sx={{
                            fontWeight: 700, fontSize: "0.65rem", height: 24,
                            bgcolor: `${CAT_COLORS[item.category] || "#64748b"}14`,
                            color: CAT_COLORS[item.category] || "#64748b",
                            border: `1px solid ${CAT_COLORS[item.category] || "#64748b"}22`,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.status || "approved"} size="small"
                          sx={{
                            fontWeight: 800, fontSize: "0.65rem", height: 24, textTransform: "uppercase",
                            bgcolor: item.status === "pending" ? "#fff7ed" : "#f0fdf4",
                            color: item.status === "pending" ? "#ea580c" : "#16a34a",
                            border: `1px solid ${item.status === "pending" ? "#ffedd5" : "#dcfce7"}`,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                          {item.author?.published_date || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={0.5}>
                          <VisibilityIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                          <Typography variant="body2" fontWeight={600} sx={{ color: "#334155" }}>
                            {(item.total_view || 0).toLocaleString()}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" justifyContent="center" gap={0.5}>
                          {user?.role === "admin" && item.status === "pending" && (
                            <Tooltip title="Approve">
                              <IconButton size="small" onClick={() => handleApprove(id)}
                                sx={{ color: "#16a34a", "&:hover": { bgcolor: "rgba(22,163,74,0.08)" } }}
                              >
                                <VerifiedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {canEdit(item) && (
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => router.push(`/dashboard/news/edit/${id}`)}
                                sx={{ color: "#3b82f6", "&:hover": { bgcolor: "rgba(59,130,246,0.08)" } }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {user?.role === "admin" && (
                            <Tooltip title="Delete">
                              <IconButton size="small" disabled={deletingId === id} onClick={() => handleDelete(id)}
                                sx={{ color: "#ef4444", "&:hover": { bgcolor: "rgba(239,68,68,0.08)" } }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {pageCount > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2, borderTop: "1px solid #f1f5f9" }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(e, v) => setPage(v)}
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": { fontWeight: 600 },
                "& .Mui-selected": { bgcolor: "#ef4444 !important", color: "white !important" },
              }}
            />
          </Box>
        )}
      </Card>
    </Box>
  );
}
