"use client";
import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Tooltip, Avatar, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  CircularProgress, Alert, Badge, Tabs, Tab
} from "@mui/material";
import { getAllMessages, updateMessageStatus, deleteMessage } from "@/lib/firestore";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmailIcon from "@mui/icons-material/Email";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ChatIcon from "@mui/icons-material/Chat";
import { useRouter } from "next/navigation";

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [error, setError] = useState("");

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getAllMessages();
      setMessages(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load messages from Firestore.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleRead = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "read" ? "unread" : "read";
      await updateMessageStatus(id, newStatus);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    } catch (err) {
      alert("Error updating status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this message?")) return;
    try {
      await deleteMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedMsg?.id === id) setSelectedMsg(null);
    } catch (err) {
      alert("Error deleting message");
    }
  };

  const handleOpenMsg = async (msg) => {
    setSelectedMsg(msg);
    if (msg.status === "unread") {
      handleToggleRead(msg.id, "unread");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress color="error" />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ color: "#0f172a", mb: 0.5 }}>
            Inboxes & Moderation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage contact inquiries and reader discussion feeds.
          </Typography>
        </Box>
        <Chip 
          icon={<EmailIcon sx={{ fontSize: 16 }} />}
          label={`${messages.filter(m => m.status === "unread").length} New Messages`} 
          color="error" 
          sx={{ fontWeight: 700, borderRadius: 1.5 }}
        />
      </Stack>

      {/* Navigation Tabs (Inboxes / Comments) */}
      <Tabs
        value={0}
        onChange={(e, val) => {
          if (val === 1) router.push("/dashboard/messages/comments");
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

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Sender</TableCell>
              <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, color: "#64748b" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">Your inbox is empty.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              messages.map((msg) => (
                <TableRow 
                  key={msg.id} 
                  hover 
                  sx={{ 
                    cursor: "pointer",
                    bgcolor: msg.status === "unread" ? "rgba(239, 68, 68, 0.02)" : "inherit"
                  }}
                  onClick={() => handleOpenMsg(msg)}
                >
                  <TableCell>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: "#ef4444", fontSize: "0.8rem", fontWeight: 700 }}>
                        {msg.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={msg.status === "unread" ? 800 : 600}>
                          {msg.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {msg.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: msg.status === "unread" ? 700 : 400 }}>
                      {msg.subject}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(msg.timestamp).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={msg.status === "unread" ? "New" : "Read"} 
                      size="small" 
                      variant={msg.status === "unread" ? "filled" : "outlined"}
                      color={msg.status === "unread" ? "error" : "default"}
                      sx={{ fontWeight: 700, fontSize: "0.65rem", height: 20 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={1} onClick={(e) => e.stopPropagation()}>
                      <Tooltip title={msg.status === "read" ? "Mark as Unread" : "Mark as Read"}>
                        <IconButton size="small" onClick={() => handleToggleRead(msg.id, msg.status)}>
                          {msg.status === "read" ? <EmailIcon fontSize="small" /> : <MarkEmailReadIcon fontSize="small" color="success" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(msg.id)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Message View Dialog */}
      <Dialog 
        open={!!selectedMsg} 
        onClose={() => setSelectedMsg(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        {selectedMsg && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h6" component="span" fontWeight={800}>{selectedMsg.subject}</Typography>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: "0.7rem" }}>{selectedMsg.name?.charAt(0)}</Avatar>
                <Typography variant="caption" color="text.secondary">
                  From: <strong>{selectedMsg.name}</strong> ({selectedMsg.email})
                </Typography>
              </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{ py: 3 }}>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8, color: "#334155" }}>
                {selectedMsg.message}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 4 }}>
                Received on: {new Date(selectedMsg.timestamp).toLocaleString()}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button 
                startIcon={<DeleteOutlineIcon />} 
                color="error" 
                onClick={() => handleDelete(selectedMsg.id)}
              >
                Delete
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button variant="contained" onClick={() => setSelectedMsg(null)} sx={{ borderRadius: 2, px: 3 }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
