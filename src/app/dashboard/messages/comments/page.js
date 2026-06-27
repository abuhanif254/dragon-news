"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  Avatar,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FlagIcon from "@mui/icons-material/Flag";
import ChatIcon from "@mui/icons-material/Chat";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EmailIcon from "@mui/icons-material/Email";
import { useRouter } from "next/navigation";
import {
  getFlaggedComments,
  getAllComments,
  clearCommentFlags,
  deleteComment,
} from "@/lib/firestore";

export default function CommentModerationPage() {
  const router = useRouter();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewTab, setViewTab] = useState(0); // 0 = Flagged Only, 1 = All Comments

  const fetchComments = async () => {
    setLoading(true);
    setError("");
    try {
      let data = [];
      if (viewTab === 0) {
        data = await getFlaggedComments();
      } else {
        data = await getAllComments();
      }
      setComments(data);
    } catch (err) {
      console.error("Error loading comments:", err);
      setError("Failed to fetch comments database records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [viewTab]);

  const handleApprove = async (id) => {
    try {
      await clearCommentFlags(id);
      setSuccess("Flags cleared. Comment approved.");
      setTimeout(() => setSuccess(""), 3000);
      if (viewTab === 0) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      } else {
        setComments((prev) => prev.map((c) => (c.id === id ? { ...c, flaggedCount: 0 } : c)));
      }
    } catch (err) {
      setError("Failed to approve comment.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this comment?")) return;
    try {
      await deleteComment(id);
      setSuccess("Comment deleted successfully.");
      setTimeout(() => setSuccess(""), 3000);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError("Failed to delete comment.");
    }
  };

  const formatCommentDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      return "";
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={900} sx={{ color: "#0f172a", fontFamily: "'Playfair Display', serif" }}>
          Inboxes & Moderation
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage contact inquiries and reader discussion feeds.
        </Typography>
      </Box>

      {/* Navigation Tabs (Inboxes / Comments) */}
      <Tabs
        value={1}
        onChange={(e, val) => {
          if (val === 0) router.push("/dashboard/messages");
        }}
        sx={{
          mb: 4,
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": { textTransform: "none", fontWeight: 700, fontSize: "1rem" },
          "& .Mui-selected": { color: "#c0392b" },
          "& .MuiTabs-indicator": { backgroundColor: "#c0392b" },
        }}
      >
        <Tab icon={<EmailIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Contact Messages" />
        <Tab icon={<ChatIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Comment Moderation" />
      </Tabs>

      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Filters (Flagged Only / All Comments) */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: "none", border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction="row" spacing={1}>
            <Button
              variant={viewTab === 0 ? "contained" : "text"}
              color="error"
              size="small"
              onClick={() => setViewTab(0)}
              startIcon={<FlagIcon />}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
            >
              Flagged Only
            </Button>
            <Button
              variant={viewTab === 1 ? "contained" : "text"}
              color="error"
              size="small"
              onClick={() => setViewTab(1)}
              startIcon={<ChatIcon />}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
            >
              All Comments
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress color="error" />
        </Box>
      ) : comments.length === 0 ? (
        <Paper
          sx={{
            py: 8,
            px: 4,
            textAlign: "center",
            borderRadius: 3,
            border: "1px dashed #cbd5e1",
            boxShadow: "none",
            bgcolor: "transparent",
          }}
        >
          <ChatIcon sx={{ fontSize: 48, color: "#94a3b8", mb: 2 }} />
          <Typography variant="h6" fontWeight={700} color="text.primary">
            No comments found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {viewTab === 0
              ? "Hooray! No pending reports or flagged reader comments."
              : "No reader comments exist in the database yet."}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Commenter</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Comment Content</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Article</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Flags</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: "#64748b" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comments.map((comment) => {
                const flags = comment.flaggedCount || 0;
                return (
                  <TableRow key={comment.id} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                    <TableCell sx={{ width: 180 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar src={comment.photo} sx={{ width: 32, height: 32 }}>
                          {(comment.authorName || "?").charAt(0)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={700}>
                          {comment.authorName}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300, wordBreak: "break-word" }}>
                      <Typography variant="body2" sx={{ color: "text.primary" }}>
                        {comment.content}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ width: 120 }}>
                      <Tooltip title="View Article in New Tab">
                        <IconButton
                          size="small"
                          component="a"
                          href={`/news/${comment.articleId}`}
                          target="_blank"
                          sx={{ color: "var(--brand-red)" }}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ width: 100 }}>
                      <Chip
                        label={flags}
                        size="small"
                        color={flags >= 3 ? "error" : flags >= 1 ? "warning" : "default"}
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell sx={{ width: 150 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatCommentDate(comment.timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ width: 140 }}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {flags > 0 && (
                          <Tooltip title="Approve & Clear Flags">
                            <IconButton size="small" color="success" onClick={() => handleApprove(comment.id)}>
                              <CheckCircleOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete Permanently">
                          <IconButton size="small" color="error" onClick={() => handleDelete(comment.id)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
