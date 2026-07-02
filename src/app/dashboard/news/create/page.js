"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, TextField, Button, Paper, Grid, MenuItem, Alert,
  Stack, Card, CardContent, Chip, Avatar, Divider, LinearProgress,
  FormControlLabel, Switch, Dialog, DialogTitle, DialogContent,
  DialogActions, DialogContentText,
} from "@mui/material";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageIcon from "@mui/icons-material/Image";
import PreviewIcon from "@mui/icons-material/Preview";
import PublishIcon from "@mui/icons-material/Publish";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { createNews, getAllSubscribers, getCategories } from "@/lib/firestore";
import { subscribeToAuth } from "@/lib/auth-service";
import CustomEditor from "@/components/ui/CustomEditor/CustomEditor";
import ImageUpload from "@/components/ui/ImageUpload/ImageUpload";
import SeoMetaFields from "@/components/ui/SeoMetaFields/SeoMetaFields";
import SeoAnalyzerPanel from "@/components/ui/SeoAnalyzerPanel/SeoAnalyzerPanel";
import { createExcerpt, stripHtml } from "@/lib/content-utils";

export default function CreateNews() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    thumbnail_url: "",
    details: "",
    authorName: "",
    imageUrl: "",
  });
  const [seoMeta, setSeoMeta] = useState({
    focusKeyword: "",
    metaDescription: "",
    slug: "",
    tags: [],
    altText: { thumbnail: "", banner: "" },
    sources: [],
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [shareTab, setShareTab] = useState("google");
  const [hasPoll, setHasPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [lastSaved, setLastSaved] = useState("");
  const [historyStack, setHistoryStack] = useState([]);
  const [hasDraft, setHasDraft] = useState(false);
  const [publishWarningOpen, setPublishWarningOpen] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  // Check for saved draft on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("article_draft");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.title || parsed.details || parsed.category) {
            setHasDraft(true);
          }
        } catch (err) {
          console.error("Error parsing saved draft:", err);
        }
      }
    }
  }, []);

  // Autosave draft to local storage with debouncing & history stack
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!formData.title && !formData.details && !formData.category) return;
      const timer = setTimeout(() => {
        localStorage.setItem("article_draft", JSON.stringify({ formData, seoMeta }));
        setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        setHistoryStack((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.title === formData.title && last.details === formData.details) return prev;
          return [...prev, formData].slice(-10);
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData, seoMeta]);

  const handleUndo = () => {
    if (historyStack.length > 1) {
      const nextStack = [...historyStack];
      nextStack.pop();
      const prevState = nextStack[nextStack.length - 1];
      if (prevState) { setFormData(prevState); setHistoryStack(nextStack); }
    }
  };

  const handleRestoreDraft = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("article_draft");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.formData) setFormData(parsed.formData);
          if (parsed.seoMeta) setSeoMeta(parsed.seoMeta);
          setHasDraft(false);
        } catch (err) {
          console.error("Error restoring draft:", err);
        }
      }
    }
  };

  const handleDiscardDraft = () => {
    if (typeof window !== "undefined") localStorage.removeItem("article_draft");
    setHasDraft(false);
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => setUser(u));
    const fetchCats = async () => {
      try { const cats = await getCategories(); setCategories(cats); }
      catch (err) { console.error("Error fetching categories:", err); }
    };
    fetchCats();
    return () => unsubscribe();
  }, []);

  // Compute stats — use stripHtml to decode &nbsp; and other HTML entities
  const plainText = stripHtml(formData.details);
  const charCount = plainText.length;
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).filter(Boolean).length : 0;

  // Compute SEO score from the analyzer panel logic inline for the gate
  const computeQuickScore = () => {
    const checks = [
      !!seoMeta.focusKeyword.trim(),
      formData.title.toLowerCase().includes(seoMeta.focusKeyword.toLowerCase().trim()),
      seoMeta.metaDescription.trim().length >= 120 && seoMeta.metaDescription.trim().length <= 160,
      seoMeta.slug.trim().length > 3,
      wordCount >= 600,
      (formData.details.match(/<(h2|h3)[^>]*>[\s\S]*?<\/\1>/gi) || []).length >= 2,
      !!formData.thumbnail_url,
      !!formData.imageUrl,
      (seoMeta.altText?.thumbnail || "").trim().length > 3,
      (seoMeta.altText?.banner || "").trim().length > 3,
      !!formData.category,
      seoMeta.sources.filter((s) => s.url?.trim()).length >= 1,
      seoMeta.tags.filter((t) => t.trim()).length >= 2,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const doSubmit = async () => {
    if (!user || !["admin", "writer"].includes(user.role)) {
      setStatus({ type: "error", message: "Only approved writers and admins can submit articles." });
      return;
    }
    if (loading) return;
    setLoading(true);
    setStatus({ type: "", message: "" });

    const isAdmin = user.role === "admin";
    const authorName = user.displayName || user.name || "The Brain Editorial Team";

    const newArticle = {
      title: formData.title,
      category: formData.category,
      details: formData.details,
      thumbnail_url: formData.thumbnail_url || `https://picsum.photos/seed/${Math.random()}/400/300`,
      image_url: formData.imageUrl || `https://picsum.photos/seed/${Math.random()}/800/400`,
      status: isAdmin ? "approved" : "pending",
      createdBy: user.uid,
      seoMeta: {
        focusKeyword: seoMeta.focusKeyword || "",
        metaDescription: seoMeta.metaDescription || createExcerpt(formData.details, 155),
        slug: seoMeta.slug || "",
        tags: seoMeta.tags || [],
        altText: seoMeta.altText || { thumbnail: "", banner: "" },
        sources: seoMeta.sources || [],
      },
      author: {
        uid: user.uid,
        email: user.email || "",
        name: authorName,
        published_date: new Date().toISOString().split("T")[0],
        img: user.photoURL || user.photo || "https://xsgames.co/randomusers/avatar.php?g=pixel",
      },
      total_view: 0,
      rating: { number: 4.5, badge: "Excellent" },
    };

    if (hasPoll && pollQuestion.trim()) {
      const pollOptionsMap = {};
      pollOptions.forEach((opt, idx) => {
        if (opt.trim()) pollOptionsMap[`opt${idx + 1}`] = { text: opt.trim(), votes: 0 };
      });
      newArticle.poll = { question: pollQuestion.trim(), options: pollOptionsMap };
    }

    try {
      await createNews(newArticle);
      let subCount = 0;
      if (isAdmin) { const subs = await getAllSubscribers(); subCount = subs.length; }
      setStatus({
        type: "success",
        message: isAdmin
          ? `Article published! Sent notifications to ${subCount} subscribers. Redirecting...`
          : "Article submitted for admin approval. Redirecting...",
      });
      setFormData({ title: "", category: "", thumbnail_url: "", details: "", authorName: "", imageUrl: "" });
      setSeoMeta({ focusKeyword: "", metaDescription: "", slug: "", tags: [], altText: { thumbnail: "", banner: "" }, sources: [] });
      setPollQuestion(""); setPollOptions(["", ""]); setHasPoll(false);
      if (typeof window !== "undefined") localStorage.removeItem("article_draft");
      setTimeout(() => router.push("/dashboard/news"), 2000);
    } catch (err) {
      console.error("Firestore Error:", err);
      setStatus({ type: "error", message: "Failed to publish: " + err.message });
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const score = computeQuickScore();
    if (score < 70) {
      setPendingSubmit(true);
      setPublishWarningOpen(true);
      return;
    }
    await doSubmit();
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2, bgcolor: "#fafbfc",
      "&:hover fieldset": { borderColor: "#94a3b8" },
      "&.Mui-focused fieldset": { borderColor: "#ef4444" },
    },
    "& label.Mui-focused": { color: "#ef4444" },
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{ mb: 3, fontWeight: 600, color: "#64748b", textTransform: "none", "&:hover": { color: "#ef4444" } }}
      >
        Back to Articles
      </Button>

      {hasDraft && (
        <Alert
          severity="info"
          action={
            <Stack direction="row" spacing={1}>
              <Button color="inherit" size="small" onClick={handleRestoreDraft} sx={{ fontWeight: 800 }}>Restore</Button>
              <Button color="inherit" size="small" onClick={handleDiscardDraft}>Discard</Button>
            </Stack>
          }
          sx={{ mb: 3, borderRadius: 2.5 }}
        >
          You have an unfinished article draft saved. Would you like to restore it?
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* ── Left: Editor Form ── */}
        <Grid item xs={12} lg={7}>
          <Stack spacing={3}>
            {/* Main Article Card */}
            <Card sx={{ borderRadius: 3, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 3 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, background: "linear-gradient(135deg, #ef4444, #f97316)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <PublishIcon sx={{ color: "white", fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ color: "#0f172a" }}>Publish New Article</Typography>
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                      {user?.role === "admin" ? "Publish approved content immediately." : "Submit an article for admin review."}
                    </Typography>
                  </Box>
                </Stack>

                {status.message && (
                  <Alert severity={status.type} sx={{ mb: 3, borderRadius: 2 }}>{status.message}</Alert>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <Stack spacing={3}>
                    {/* Title */}
                    <TextField
                      fullWidth required label="Article Title" variant="outlined"
                      value={formData.title} onChange={handleChange("title")} sx={fieldSx}
                      placeholder="Enter a compelling, keyword-rich headline..."
                      id="article-title"
                      helperText={`${formData.title.length}/70 chars — ideal 35–70`}
                    />

                    {/* Category */}
                    <TextField select fullWidth required label="Category" value={formData.category} onChange={handleChange("category")} sx={fieldSx}>
                      {categories.map((cat) => (
                        <MenuItem key={cat.id || cat.name} value={cat.name}>
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: cat.color || "#64748b" }} />
                            {cat.name}
                          </Stack>
                        </MenuItem>
                      ))}
                    </TextField>

                    {/* Images */}
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <ImageUpload label="Thumbnail Image (Square)" folder="articles/thumbnails" value={formData.thumbnail_url} onChange={(url) => setFormData({ ...formData, thumbnail_url: url })} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ImageUpload label="Banner Image (16:9)" folder="articles/banners" value={formData.imageUrl} onChange={(url) => setFormData({ ...formData, imageUrl: url })} />
                      </Grid>
                    </Grid>

                    {/* Editor */}
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ color: "#475569" }}>Article Content *</Typography>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          {lastSaved && (
                            <Typography variant="caption" sx={{ color: "success.main", fontWeight: 700 }}>
                              Draft saved at {lastSaved}
                            </Typography>
                          )}
                          {historyStack.length > 1 && (
                            <Button size="small" onClick={handleUndo} sx={{ textTransform: "none", fontSize: "0.65rem", fontWeight: 800, color: "error.main", py: 0.1, px: 1, border: "1px solid", borderColor: "error.main", borderRadius: 1.5 }}>
                              Undo
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                      <CustomEditor
                        value={formData.details}
                        onChange={(val) => setFormData({ ...formData, details: val })}
                      />
                    </Box>

                    {/* SEO Meta Fields */}
                    <SeoMetaFields seoMeta={seoMeta} onChange={setSeoMeta} formData={formData} />

                    {/* Poll Builder */}
                    <Box sx={{ p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 2 }}>
                      <FormControlLabel
                        control={<Switch checked={hasPoll} onChange={(e) => setHasPoll(e.target.checked)} color="error" />}
                        label={<Typography variant="body2" fontWeight={700}>Embed a Reader Opinion Poll</Typography>}
                      />
                      {hasPoll && (
                        <Stack spacing={2} sx={{ mt: 2 }}>
                          <TextField fullWidth label="Poll Question" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} sx={fieldSx} placeholder="e.g. Do you agree with this policy?" />
                          {pollOptions.map((opt, idx) => (
                            <TextField key={idx} fullWidth label={`Option ${idx + 1}`} value={opt} onChange={(e) => { const next = [...pollOptions]; next[idx] = e.target.value; setPollOptions(next); }} sx={fieldSx} />
                          ))}
                          <Stack direction="row" spacing={2}>
                            {pollOptions.length < 4 && <Button size="small" onClick={() => setPollOptions([...pollOptions, ""])} sx={{ textTransform: "none", fontWeight: 700 }}>+ Add Option</Button>}
                            {pollOptions.length > 2 && <Button size="small" color="error" onClick={() => setPollOptions(pollOptions.slice(0, -1))} sx={{ textTransform: "none", fontWeight: 700 }}>- Remove Option</Button>}
                          </Stack>
                        </Stack>
                      )}
                    </Box>

                    {/* Publish Button */}
                    <Button
                      type="submit" variant="contained" size="large" fullWidth
                      disabled={loading}
                      startIcon={<PublishIcon />}
                      sx={{
                        py: 1.5, fontWeight: 800, borderRadius: 2, textTransform: "none", fontSize: "1rem",
                        background: loading ? undefined : "linear-gradient(135deg, #ef4444, #f97316)",
                        boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
                        "&:hover": { background: "linear-gradient(135deg, #dc2626, #ef4444)" },
                      }}
                    >
                      {loading ? "Saving..." : user?.role === "admin" ? "Publish Article" : "Submit for Review"}
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* ── Right: Preview + SEO Panel ── */}
        <Grid item xs={12} lg={5}>
          <Stack spacing={3} sx={{ position: "sticky", top: 80 }}>
            {/* Live Preview Card */}
            <Card sx={{ borderRadius: 3, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 3 }}>
                  <PreviewIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#0f172a" }}>Live Preview</Typography>
                </Stack>

                {/* Tab Switcher */}
                <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
                  {["google", "facebook", "twitter"].map((tab) => (
                    <Button key={tab} size="small"
                      variant={shareTab === tab ? "contained" : "outlined"}
                      color={shareTab === tab ? "error" : "inherit"}
                      onClick={() => setShareTab(tab)}
                      sx={{ textTransform: "capitalize", borderRadius: 1.5, fontSize: "0.65rem", py: 0.2, px: 1.2, fontWeight: 700, boxShadow: "none", "&:hover": { boxShadow: "none" } }}
                    >
                      {tab}
                    </Button>
                  ))}
                </Stack>

                {shareTab === "google" && (
                  <Box sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 2.5, bgcolor: "white", mb: 3 }}>
                    <Typography variant="caption" sx={{ color: "#202124", display: "block", fontSize: "0.7rem" }}>
                      {seoMeta.slug ? `dragonnews.com/news/${seoMeta.slug}` : "dragonnews.com › news › article"}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: "#1a0dab", fontWeight: 500, mt: 0.5, lineHeight: 1.3 }}>
                      {formData.title || "Headline title goes here..."}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#4d5156", display: "block", mt: 0.5, fontSize: "0.75rem", lineHeight: 1.4 }}>
                      {seoMeta.metaDescription || (formData.details ? createExcerpt(formData.details, 150) : "Article content preview snippet will render here.")}
                    </Typography>
                  </Box>
                )}

                {shareTab === "facebook" && (
                  <Box sx={{ border: "1px solid #e2e8f0", borderRadius: 2.5, bgcolor: "white", overflow: "hidden", mb: 3 }}>
                    <Stack direction="row" spacing={1.5} sx={{ p: 1.5, alignItems: "center" }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: "#1877f2", fontWeight: 800, fontSize: "0.85rem" }}>D</Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800} color="#050505" sx={{ fontSize: "0.75rem", lineHeight: 1.1 }}>Dragon News</Typography>
                        <Typography variant="caption" color="#65676b" sx={{ fontSize: "0.6rem" }}>Just now · 🌐</Typography>
                      </Box>
                    </Stack>
                    {formData.imageUrl || formData.thumbnail_url ? (
                      <Box sx={{ height: 160, bgcolor: "#f1f5f9", overflow: "hidden" }}>
                        <img src={formData.imageUrl || formData.thumbnail_url} alt={seoMeta.altText?.banner || formData.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </Box>
                    ) : (
                      <Box sx={{ height: 160, bgcolor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ImageIcon sx={{ fontSize: 40, color: "#cbd5e1" }} />
                      </Box>
                    )}
                    <Box sx={{ p: 1.5, bgcolor: "#f0f2f5", borderTop: "1px solid #e2e8f0" }}>
                      <Typography variant="caption" color="#65676b" sx={{ textTransform: "uppercase", fontWeight: 600, fontSize: "0.6rem" }}>dragonnews.com</Typography>
                      <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#050505", mt: 0.2, lineHeight: 1.2, fontSize: "0.75rem" }}>
                        {formData.title || "Headline title goes here..."}
                      </Typography>
                      <Typography variant="caption" color="#65676b" sx={{ display: "block", mt: 0.2, fontSize: "0.7rem", lineHeight: 1.2 }}>
                        {seoMeta.metaDescription || (formData.details ? createExcerpt(formData.details, 80) : "Article summary...")}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {shareTab === "twitter" && (
                  <Box sx={{ border: "1px solid #e2e8f0", borderRadius: 3, bgcolor: "white", overflow: "hidden", mb: 3 }}>
                    {formData.imageUrl || formData.thumbnail_url ? (
                      <Box sx={{ height: 160, bgcolor: "#f1f5f9", overflow: "hidden" }}>
                        <img src={formData.imageUrl || formData.thumbnail_url} alt={seoMeta.altText?.banner || formData.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </Box>
                    ) : (
                      <Box sx={{ height: 160, bgcolor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ImageIcon sx={{ fontSize: 40, color: "#cbd5e1" }} />
                      </Box>
                    )}
                    <Box sx={{ p: 1.5, borderTop: "1px solid #e2e8f0" }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>dragonnews.com</Typography>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: "text.primary", mt: 0.2, lineHeight: 1.2, fontSize: "0.75rem" }}>
                        {formData.title || "Headline title goes here..."}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.2, fontSize: "0.7rem", lineHeight: 1.2 }}>
                        {seoMeta.metaDescription || (formData.details ? createExcerpt(formData.details, 80) : "Article summary...")}
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Divider sx={{ my: 2, borderColor: "#f1f5f9" }} />
                <Typography variant="caption" fontWeight={700} sx={{ color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.6rem" }}>Article Details</Typography>
                <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>Category</Typography>
                    {formData.category ? (
                      <Chip label={formData.category} size="small" sx={{ height: 20, fontSize: "0.6rem", fontWeight: 700, bgcolor: `${categories.find((c) => c.name === formData.category)?.color || "#64748b"}18`, color: categories.find((c) => c.name === formData.category)?.color || "#64748b" }} />
                    ) : <Typography variant="caption" sx={{ color: "#cbd5e1" }}>Not set</Typography>}
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>Focus Keyword</Typography>
                    {seoMeta.focusKeyword ? (
                      <Chip label={seoMeta.focusKeyword} size="small" sx={{ height: 20, fontSize: "0.6rem", fontWeight: 700, bgcolor: "#f3e8ff", color: "#7c3aed" }} />
                    ) : <Typography variant="caption" sx={{ color: "#cbd5e1" }}>Not set</Typography>}
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>Word Count</Typography>
                    <Chip label={`${wordCount} words`} size="small" sx={{ height: 20, fontSize: "0.6rem", fontWeight: 700, bgcolor: wordCount >= 600 ? "rgba(16,185,129,0.1)" : wordCount >= 300 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)", color: wordCount >= 600 ? "#10b981" : wordCount >= 300 ? "#f59e0b" : "#ef4444" }} />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>Date</Typography>
                    <Typography variant="caption" fontWeight={600} sx={{ color: "#334155" }}>{new Date().toLocaleDateString()}</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* SEO Analyzer Panel */}
            <Card sx={{ borderRadius: 3, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <CardContent sx={{ p: 3 }}>
                <SeoAnalyzerPanel formData={formData} seoMeta={seoMeta} />
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Low SEO Score Warning Dialog */}
      <Dialog open={publishWarningOpen} onClose={() => setPublishWarningOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <WarningAmberIcon sx={{ color: "#f97316", fontSize: 20 }} />
            </Box>
            <Typography fontWeight={800}>SEO Score Below Recommended</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#475569", lineHeight: 1.7 }}>
            Your article's SEO score is below <strong>70%</strong>, which may reduce its chances of being approved for <strong>Google News / Google Publisher Center</strong>.
            <br /><br />
            The SEO Analyzer panel on the right shows exactly what to fix. You can still publish now, or go back and improve the article first.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setPublishWarningOpen(false)} variant="outlined" sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
            Improve Article First
          </Button>
          <Button
            onClick={async () => { setPublishWarningOpen(false); await doSubmit(); }}
            variant="contained"
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, background: "linear-gradient(135deg, #f97316, #ef4444)", boxShadow: "none" }}
          >
            Publish Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
