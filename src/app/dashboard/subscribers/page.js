"use client";
import { useState, useEffect, useMemo } from "react";
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
  Stack,
  CircularProgress,
  Alert,
  Avatar,
  Tooltip,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Divider,
} from "@mui/material";
import {
  getAllSubscribers,
  deleteSubscriber,
  getNewsletterCampaigns,
  getAllNews,
} from "@/lib/firestore";
import { useConfirm } from "@/context/ToastContext";
import PeopleIcon from "@mui/icons-material/People";
import EmailIcon from "@mui/icons-material/Email";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DownloadIcon from "@mui/icons-material/Download";
import SendIcon from "@mui/icons-material/Send";
import CampaignIcon from "@mui/icons-material/Campaign";
import PreviewIcon from "@mui/icons-material/Preview";
import PublicIcon from "@mui/icons-material/Public";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import ComputerIcon from "@mui/icons-material/Computer";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AdminRouteGuard from "@/components/auth/AdminRouteGuard";
import { generateNewsletterHtml } from "@/lib/email-templates";

export default function SubscribersPage() {
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState(0); // 0: Audience, 1: Campaigns, 2: Google Publisher
  const [subscribers, setSubscribers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Compose Studio State
  const [composeOpen, setComposeOpen] = useState(false);
  const [subject, setSubject] = useState("The Brain • Weekly Intelligence Digest");
  const [editorNote, setEditorNote] = useState(
    "In this edition of The Brain, we investigate digital freedom, scientific inquiry, and global policy shifts shaping our collective future."
  );
  const [selectedArticleIds, setSelectedArticleIds] = useState([]);
  const [previewDevice, setPreviewDevice] = useState("desktop"); // 'desktop' | 'mobile'
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [subsData, campaignsData, newsData] = await Promise.all([
        getAllSubscribers(),
        getNewsletterCampaigns(),
        getAllNews({ includeUnpublished: false }),
      ]);
      setSubscribers(subsData);
      setCampaigns(campaignsData);
      setArticles(newsData);

      // Pre-select top 3 articles for compose dialog
      if (newsData && newsData.length > 0) {
        setSelectedArticleIds(newsData.slice(0, 3).map((a) => a.id));
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load subscribers and campaign data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = await confirm(
      "Remove Subscriber",
      "Are you sure you want to remove this subscriber from the mailing list?"
    );
    if (confirmed) {
      try {
        await deleteSubscriber(id);
        setSubscribers((prev) => prev.filter((s) => s.id !== id));
        setSuccess("Subscriber removed successfully.");
      } catch (err) {
        console.error("Delete error:", err);
        setError("Failed to delete subscriber.");
      }
    }
  };

  const handleExport = () => {
    const csv = subscribers.map((s) => `${s.email},${s.subscribedAt}`).join("\n");
    const blob = new Blob([`Email,Date\n${csv}`], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const toggleArticleSelection = (id) => {
    setSelectedArticleIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 5) {
          alert("You can select up to 5 featured stories per digest.");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const selectedStories = useMemo(() => {
    return articles.filter((a) => selectedArticleIds.includes(a.id));
  }, [articles, selectedArticleIds]);

  const liveHtmlPreview = useMemo(() => {
    if (typeof window === "undefined") return "";
    return generateNewsletterHtml({
      subject,
      editorNote,
      stories: selectedStories,
      siteUrl: window.location.origin,
    });
  }, [subject, editorNote, selectedStories]);

  const handleDispatch = async (mode = "send-test") => {
    if (selectedStories.length === 0) {
      alert("Please select at least one article for the newsletter.");
      return;
    }

    if (mode === "broadcast-all") {
      const confirmed = await confirm(
        "Confirm Newsletter Broadcast",
        `Are you sure you want to dispatch this email digest to all ${subscribers.length} active subscribers?`
      );
      if (!confirmed) return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch("/api/admin/newsletter/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          subject,
          editorNote,
          stories: selectedStories,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSendResult({
          type: "success",
          message: data.message,
          simulated: data.simulated,
        });
        // Refresh campaign history
        const updatedCampaigns = await getNewsletterCampaigns();
        setCampaigns(updatedCampaigns);
      } else {
        setSendResult({
          type: "error",
          message: data.message || "Failed to dispatch newsletter.",
        });
      }
    } catch (err) {
      console.error("Dispatch error:", err);
      setSendResult({
        type: "error",
        message: "Network error occurred while connecting to the broadcast server.",
      });
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess(`Copied to clipboard: ${text}`);
    setTimeout(() => setSuccess(""), 3000);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress color="error" />
      </Box>
    );
  }

  return (
    <AdminRouteGuard fallbackTitle="Newsletter Broadcast Studio">
      <Box maxWidth="1400px" mx="auto">
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ sm: "center" }}
          gap={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="h4" fontWeight={900} sx={{ color: "#0f172a", mb: 0.5 }}>
              Newsletter Broadcast Studio
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Curate editorial digests, preview mobile-responsive layouts, and dispatch campaigns to your readers.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{ fontWeight: 700, borderRadius: 2, textTransform: "none" }}
            >
              Export CSV
            </Button>
            <Button
              variant="contained"
              startIcon={<CampaignIcon />}
              onClick={() => {
                setComposeOpen(true);
                setSendResult(null);
              }}
              sx={{
                fontWeight: 700,
                px: 3,
                borderRadius: 2,
                textTransform: "none",
                background: "linear-gradient(135deg, #ef4444, #f97316)",
                boxShadow: "0 4px 14px rgba(239, 68, 68, 0.35)",
              }}
            >
              Compose Digest
            </Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

        {/* Metrics Strip */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3, border: "1px solid #f1f5f9", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                      Total Audience
                    </Typography>
                    <Typography variant="h4" fontWeight={900} color="#0f172a" sx={{ mt: 0.5 }}>
                      {subscribers.length}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: "#ecfdf5", color: "#10b981", width: 48, height: 48 }}>
                    <PeopleIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3, border: "1px solid #f1f5f9", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                      Active Subscribers
                    </Typography>
                    <Typography variant="h4" fontWeight={900} color="#10b981" sx={{ mt: 0.5 }}>
                      {subscribers.length}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: "#eff6ff", color: "#3b82f6", width: 48, height: 48 }}>
                    <EmailIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3, border: "1px solid #f1f5f9", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                      Campaigns Dispatched
                    </Typography>
                    <Typography variant="h4" fontWeight={900} color="#0f172a" sx={{ mt: 0.5 }}>
                      {campaigns.length}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: "#fef2f2", color: "#ef4444", width: 48, height: 48 }}>
                    <CampaignIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            sx={{
              "& .MuiTab-root": { textTransform: "none", fontWeight: 700, fontSize: "0.95rem" },
              "& .Mui-selected": { color: "#ef4444 !important" },
              "& .MuiTabs-indicator": { bgcolor: "#ef4444" },
            }}
          >
            <Tab label={`Audience List (${subscribers.length})`} />
            <Tab label={`Campaign History (${campaigns.length})`} />
            <Tab label="Google Publisher Center Hub" />
          </Tabs>
        </Box>

        {/* ── Tab 0: Subscribers Table ── */}
        {activeTab === 0 && (
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}
          >
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Subscriber</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Date Subscribed</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Source</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: "#64748b" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">No subscribers recorded yet.</Typography>
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
                          {new Date(sub.subscribedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={sub.source || "web-portal"}
                          size="small"
                          sx={{ fontSize: "0.7rem", fontWeight: 600, bgcolor: "#f1f5f9" }}
                        />
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
                        <Tooltip title="Remove Subscriber">
                          <IconButton size="small" color="error" onClick={() => handleDelete(sub.id)}>
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
        )}

        {/* ── Tab 1: Campaign History ── */}
        {activeTab === 1 && (
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}
          >
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Campaign Subject</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Date Dispatched</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Stories</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Recipients</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">No campaigns dispatched yet.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((camp) => (
                    <TableRow key={camp.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {camp.subject}
                        </Typography>
                        {camp.editorNote && (
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", maxWidth: 380 }}>
                            "{camp.editorNote}"
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(camp.dispatchedAt).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${camp.storyCount || 0} Stories`}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: "0.7rem", bgcolor: "#f1f5f9" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {camp.recipientCount || 0} readers
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={camp.live ? "Live Sent" : "Simulated"}
                          size="small"
                          color={camp.live ? "success" : "warning"}
                          sx={{ fontWeight: 700, fontSize: "0.68rem" }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* ── Tab 2: Google Publisher Center Hub ── */}
        {activeTab === 2 && (
          <Box>
            <Card sx={{ borderRadius: 3, border: "1px solid #f1f5f9", mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: "#fee2e2", color: "#ef4444", width: 44, height: 44 }}>
                    <PublicIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={800} color="#0f172a">
                      Google Publisher Center Integration
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your technical feeds and schemas are live. Use the endpoints below to register your publication on Google News.
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ mb: 1 }}>
                        1. Google News Sitemap
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Provides Googlebot-News with real-time indexed articles matching Google News technical specifications.
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          size="small"
                          fullWidth
                          value={typeof window !== "undefined" ? `${window.location.origin}/news-sitemap.xml` : "/news-sitemap.xml"}
                          InputProps={{ readOnly: true }}
                          sx={{ bgcolor: "#f8fafc" }}
                        />
                        <Tooltip title="Copy URL">
                          <IconButton
                            color="primary"
                            onClick={() => copyToClipboard(typeof window !== "undefined" ? `${window.location.origin}/news-sitemap.xml` : "/news-sitemap.xml")}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ mb: 1 }}>
                        2. Content Syndication RSS Feed
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Full RSS 2.0 feed required by Google Publisher Center for section rendering in the Google News app.
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          size="small"
                          fullWidth
                          value={typeof window !== "undefined" ? `${window.location.origin}/rss.xml` : "/rss.xml"}
                          InputProps={{ readOnly: true }}
                          sx={{ bgcolor: "#f8fafc" }}
                        />
                        <Tooltip title="Copy URL">
                          <IconButton
                            color="primary"
                            onClick={() => copyToClipboard(typeof window !== "undefined" ? `${window.location.origin}/rss.xml` : "/rss.xml")}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, p: 2.5, bgcolor: "#f8fafc", borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#1e293b" sx={{ mb: 1 }}>
                    Submission Checklist:
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircleIcon sx={{ color: "#10b981", fontSize: 18 }} />
                      <Typography variant="body2" color="#334155">
                        Open <a href="https://publishercenter.google.com" target="_blank" rel="noreferrer" style={{ color: "#ef4444", fontWeight: 700 }}>Google Publisher Center</a> and sign in with your Google account.
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircleIcon sx={{ color: "#10b981", fontSize: 18 }} />
                      <Typography variant="body2" color="#334155">
                        Add a new publication: Name it <strong>The Brain</strong> and set primary language to English (or bilingual).
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircleIcon sx={{ color: "#10b981", fontSize: 18 }} />
                      <Typography variant="body2" color="#334155">
                        In the <strong>Content</strong> section, paste the RSS feed link above to populate sections automatically.
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* ── COMPOSE DIGEST STUDIO MODAL ── */}
        <Dialog
          open={composeOpen}
          onClose={() => setComposeOpen(false)}
          maxWidth="xl"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, height: "90vh" } }}
        >
          <DialogTitle sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CampaignIcon sx={{ color: "#ef4444" }} />
                <Typography variant="h6" fontWeight={800}>
                  Editorial Digest Studio
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant={previewDevice === "desktop" ? "contained" : "outlined"}
                  color="inherit"
                  startIcon={<ComputerIcon />}
                  onClick={() => setPreviewDevice("desktop")}
                  sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
                >
                  Desktop
                </Button>
                <Button
                  size="small"
                  variant={previewDevice === "mobile" ? "contained" : "outlined"}
                  color="inherit"
                  startIcon={<SmartphoneIcon />}
                  onClick={() => setPreviewDevice("mobile")}
                  sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
                >
                  Mobile
                </Button>
              </Stack>
            </Stack>
          </DialogTitle>

          <DialogContent sx={{ p: 0, overflow: "hidden" }}>
            <Grid container sx={{ height: "100%" }}>
              {/* Left Column: Form Controls */}
              <Grid
                item
                xs={12}
                md={5}
                sx={{
                  p: 3,
                  borderRight: "1px solid #f1f5f9",
                  height: "100%",
                  overflowY: "auto",
                }}
              >
                <Stack spacing={3}>
                  {sendResult && (
                    <Alert severity={sendResult.type} sx={{ borderRadius: 2 }}>
                      {sendResult.message}
                    </Alert>
                  )}

                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ mb: 1 }}>
                      Email Subject Line
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., The Brain • Weekly Intelligence Digest"
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ mb: 1 }}>
                      Chief Editor's Letter (Optional)
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      size="small"
                      value={editorNote}
                      onChange={(e) => setEditorNote(e.target.value)}
                      placeholder="Share a brief perspective or introduction with your subscribers..."
                    />
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                        Select Featured Stories ({selectedArticleIds.length}/5)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Pick up to 5 stories
                      </Typography>
                    </Stack>

                    <Stack spacing={1} sx={{ maxHeight: 320, overflowY: "auto", pr: 1 }}>
                      {articles.slice(0, 12).map((art) => {
                        const isSelected = selectedArticleIds.includes(art.id);
                        return (
                          <Paper
                            key={art.id}
                            variant="outlined"
                            onClick={() => toggleArticleSelection(art.id)}
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              cursor: "pointer",
                              borderColor: isSelected ? "#ef4444" : "#e2e8f0",
                              bgcolor: isSelected ? "#fff5f5" : "#ffffff",
                              transition: "all 0.15s",
                            }}
                          >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Checkbox
                                size="small"
                                checked={isSelected}
                                onChange={() => toggleArticleSelection(art.id)}
                                sx={{ p: 0.5, color: "#ef4444", "&.Mui-checked": { color: "#ef4444" } }}
                              />
                              {art.thumbnail_url && (
                                <img
                                  src={art.thumbnail_url}
                                  alt=""
                                  style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }}
                                />
                              )}
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="caption" fontWeight={800} color="#ef4444">
                                  {art.category}
                                </Typography>
                                <Typography variant="body2" fontWeight={700} noWrap color="#0f172a">
                                  {art.title}
                                </Typography>
                              </Box>
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </Box>
                </Stack>
              </Grid>

              {/* Right Column: Live Interactive Preview */}
              <Grid
                item
                xs={12}
                md={7}
                sx={{
                  bgcolor: "#f8fafc",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 3,
                  overflowY: "auto",
                }}
              >
                <Box
                  sx={{
                    width: previewDevice === "mobile" ? "380px" : "100%",
                    maxWidth: previewDevice === "mobile" ? "380px" : "640px",
                    height: "100%",
                    bgcolor: "#ffffff",
                    borderRadius: 3,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                  }}
                >
                  <iframe
                    title="Newsletter Preview"
                    srcDoc={liveHtmlPreview}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      display: "block",
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, borderTop: "1px solid #f1f5f9", justifyContent: "space-between" }}>
            <Button
              color="inherit"
              onClick={() => setComposeOpen(false)}
              sx={{ fontWeight: 600, textTransform: "none" }}
            >
              Cancel
            </Button>
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                color="inherit"
                disabled={sending}
                onClick={() => handleDispatch("send-test")}
                sx={{ fontWeight: 700, textTransform: "none", borderRadius: 2 }}
              >
                {sending ? "Sending..." : "Send Test to Me"}
              </Button>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                disabled={sending}
                onClick={() => handleDispatch("broadcast-all")}
                sx={{
                  fontWeight: 700,
                  px: 3,
                  borderRadius: 2,
                  textTransform: "none",
                  background: "linear-gradient(135deg, #ef4444, #f97316)",
                  boxShadow: "none",
                }}
              >
                {sending ? "Broadcasting..." : `Broadcast to ${subscribers.length} Subscribers`}
              </Button>
            </Stack>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminRouteGuard>
  );
}
