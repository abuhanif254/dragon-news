"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DownloadIcon from "@mui/icons-material/Download";
import { getAllUsers, reviewWriterApplication, updateUserRole } from "@/lib/auth-service";
import { ADMIN_EMAIL, isAdminEmail } from "@/lib/site";

const ROLE_COLORS = {
  admin: "#c0392b",
  writer: "#2563eb",
  moderator: "#10b981",
  reader: "#64748b",
};

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const handleExport = () => {
    const csv = filteredUsers.map(u => `"${u.name || ''}","${u.email}","${u.role}","${u.writerApplicationStatus || 'none'}"`).join("\n");
    const blob = new Blob([`Name,Email,Role,Writer Status\n${csv}`], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAllUsers();
      setUsers(
        data.sort((a, b) => {
          if (isAdminEmail(a.email)) return -1;
          if (isAdminEmail(b.email)) return 1;
          if (a.writerApplicationStatus === "pending") return -1;
          if (b.writerApplicationStatus === "pending") return 1;
          return (a.name || "").localeCompare(b.name || "");
        })
      );
    } catch (err) {
      setError("Failed to fetch users. Check Firebase permissions and Firestore rules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.role?.toLowerCase().includes(term)
    );
  }, [users, search]);

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleRoleChange = async (user, nextRole) => {
    try {
      const savedRole = await updateUserRole(user, nextRole);
      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id
            ? {
                ...item,
                role: savedRole,
                writerApplicationStatus: savedRole === "writer" ? "approved" : item.writerApplicationStatus,
              }
            : item
        )
      );
      showSuccess(`${user.email} is now ${savedRole}.`);
    } catch (err) {
      setError(err.message || "Failed to update user role.");
    }
  };

  const handleWriterDecision = async (user, decision) => {
    try {
      const result = await reviewWriterApplication(user, decision);
      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id
            ? {
                ...item,
                role: result.role,
                writerApplicationStatus: result.writerApplicationStatus,
              }
            : item
        )
      );
      showSuccess(`Writer application ${decision}.`);
    } catch (err) {
      setError("Failed to review writer application.");
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ color: "#0f172a", fontFamily: "'Playfair Display', serif" }}>
            User Management
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Approve writer requests and keep {ADMIN_EMAIL} as the only admin account.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{ fontWeight: 700, textTransform: "none", borderRadius: 2 }}
          >
            Export CSV
          </Button>
          <IconButton onClick={fetchUsers} sx={{ bgcolor: "white", border: "1px solid #e2e8f0" }}>
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Stack>

      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", overflow: "hidden" }}>
        <Box sx={{ p: 3, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search users by name, email, or role"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
              sx: { bgcolor: "white", borderRadius: 2 },
            }}
          />
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 860 }}>
            <TableHead sx={{ bgcolor: "#f1f5f9" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>User</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Writer Request</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const adminLocked = isAdminEmail(user.email);
                  const pending = user.writerApplicationStatus === "pending";

                  return (
                    <TableRow key={user.id} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar src={user.photo} sx={{ width: 38, height: 38 }}>
                            {(user.name || user.email || "?").charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={700}>
                              {user.name || "Unknown"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {adminLocked ? "Primary admin" : "Registered reader"}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={adminLocked ? "admin" : user.role || "reader"}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            textTransform: "uppercase",
                            fontSize: "0.65rem",
                            bgcolor: ROLE_COLORS[adminLocked ? "admin" : user.role || "reader"],
                            color: "white",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.writerApplicationStatus || "none"}
                          size="small"
                          variant={pending ? "filled" : "outlined"}
                          color={pending ? "warning" : user.writerApplicationStatus === "approved" ? "success" : "default"}
                          sx={{ fontWeight: 700, textTransform: "uppercase", fontSize: "0.65rem" }}
                        />
                        {user.writerApplicationMessage && (
                          <Typography variant="caption" sx={{ display: "block", mt: 0.8, color: "#64748b", maxWidth: 280 }}>
                            {user.writerApplicationMessage}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {pending && !adminLocked && (
                            <>
                              <Tooltip title="Approve writer">
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  startIcon={<CheckCircleIcon />}
                                  onClick={() => handleWriterDecision(user, "approved")}
                                  sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
                                >
                                  Approve
                                </Button>
                              </Tooltip>
                              <Tooltip title="Reject writer">
                                <IconButton size="small" color="error" onClick={() => handleWriterDecision(user, "rejected")}>
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <Select
                            size="small"
                            value={adminLocked ? "admin" : user.role || "reader"}
                            disabled={adminLocked}
                            onChange={(event) => handleRoleChange(user, event.target.value)}
                            sx={{ minWidth: 120, borderRadius: 2, fontSize: "0.85rem", "& .MuiSelect-select": { py: 0.8 } }}
                          >
                            <MenuItem value="reader">Reader</MenuItem>
                            <MenuItem value="writer">Writer</MenuItem>
                            <MenuItem value="moderator">Moderator</MenuItem>
                            {adminLocked && <MenuItem value="admin">Admin</MenuItem>}
                          </Select>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
