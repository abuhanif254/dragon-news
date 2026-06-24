"use client";
import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Stack,
  CircularProgress, Alert, Avatar, Tooltip
} from "@mui/material";
import { getAllSubscribers, deleteSubscriber } from "@/lib/firestore";
import PeopleIcon from "@mui/icons-material/People";
import EmailIcon from "@mui/icons-material/Email";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DownloadIcon from "@mui/icons-material/Download";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const data = await getAllSubscribers();
      setSubscribers(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load subscribers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this subscriber?")) {
      try {
        await deleteSubscriber(id);
        setSubscribers(prev => prev.filter(s => s.id !== id));
      } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete subscriber.");
      }
    }
  };

  const handleExport = () => {
    const csv = subscribers.map(s => `${s.email},${s.subscribedAt}`).join("\n");
    const blob = new Blob([`Email,Date\n${csv}`], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
            Newsletter Subscribers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage your mailing list audience.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <IconButton 
            onClick={handleExport}
            sx={{ bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
          <Chip 
            icon={<PeopleIcon sx={{ fontSize: 16 }} />}
            label={`${subscribers.length} Active Subscribers`} 
            color="success" 
            sx={{ fontWeight: 700, borderRadius: 1.5 }}
          />
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Subscriber</TableCell>
              <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Date Subscribed</TableCell>
              <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, color: "#64748b" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">No subscribers yet.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              subscribers.map((sub) => (
                <TableRow key={sub.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: "#10b981", fontSize: "0.8rem", fontWeight: 700 }}>
                        {sub.email.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {sub.email}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(sub.subscribedAt).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label="Active" 
                      size="small" 
                      color="success" 
                      variant="outlined"
                      sx={{ fontWeight: 700, fontSize: "0.65rem", height: 20 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDelete(sub.id)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
