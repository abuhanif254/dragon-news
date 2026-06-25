"use client";
import { useState } from "react";
import {
  Box, Typography, TextField, Button, Paper, Grid, MenuItem, Alert,
  Stack, Card, CardContent, Chip, Avatar, Divider,
} from "@mui/material";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageIcon from "@mui/icons-material/Image";
import PreviewIcon from "@mui/icons-material/Preview";
import PublishIcon from "@mui/icons-material/Publish";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import Image from "next/image";
import { createNews, getAllSubscribers, getCategories } from "@/lib/firestore";
import { useEffect } from "react";
import { subscribeToAuth } from "@/lib/auth-service";
import CustomEditor from "@/components/ui/CustomEditor/CustomEditor";
import ImageUpload from "@/components/ui/ImageUpload/ImageUpload";
import { createExcerpt } from "@/lib/content-utils";

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
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => setUser(u));
    const fetchCats = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCats();
    return () => unsubscribe();
  }, []);

  const charCount = formData.details.replace(/(<([^>]+)>)/gi, "").length;
  const wordCount = formData.details.replace(/(<([^>]+)>)/gi, "").trim() ? formData.details.replace(/(<([^>]+)>)/gi, "").trim().split(/\s+/).length : 0;

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🎯 Form submitted!");
    
    // Prevent any re-renders during submission
    if (loading) {
      console.log("⚠️ Already submitting, ignoring duplicate submit");
      return;
    }
    
    if (!user || !["admin", "writer"].includes(user.role)) {
      setStatus({ type: "error", message: "Only approved writers and admins can submit articles." });
      return;
    }

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

    try {
      // 1. Publish Article
      await createNews(newArticle);
      
      // 2. Fetch and Notify Subscribers (Simulation)
      let subCount = 0;
      if (isAdmin) {
        const subs = await getAllSubscribers();
        subCount = subs.length;
      }
      
      setStatus({ 
        type: "success", 
        message: isAdmin
          ? `Article published! Sent notifications to ${subCount} subscribers. Redirecting...`
          : "Article submitted for admin approval. Redirecting..."
      });
      
      // Clear form
      setFormData({
        title: "",
        category: "",
        thumbnail_url: "",
        details: "",
        authorName: "",
        imageUrl: "",
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/dashboard/news");
      }, 2000);
    } catch (err) {
      console.error("💥 Firestore Error:", err);
      setStatus({ 
        type: "error", 
        message: "Failed to publish: " + err.message 
      });
      setLoading(false);
    }
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

      <Grid container spacing={3}>
        {/* Form */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ borderRadius: 3, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 3 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: 2,
                  background: "linear-gradient(135deg, #ef4444, #f97316)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <PublishIcon sx={{ color: "white", fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800} sx={{ color: "#0f172a" }}>
                    Publish New Article
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                    {user?.role === "admin" ? "Publish approved content immediately." : "Submit an article for admin review."}
                  </Typography>
                </Box>
              </Stack>

              {status.message && (
                <Alert severity={status.type} sx={{ mb: 3, borderRadius: 2 }}>
                  {status.message}
                </Alert>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <Stack spacing={3}>
                  <TextField
                    fullWidth required label="Article Title" variant="outlined"
                    value={formData.title} onChange={handleChange("title")} sx={fieldSx}
                    placeholder="Enter a compelling headline..."
                    name="title"
                    id="article-title"
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        select fullWidth required label="Category"
                        value={formData.category} onChange={handleChange("category")} sx={fieldSx}
                      >
                        {categories.map((cat) => (
                          <MenuItem key={cat.id || cat.name} value={cat.name}>
                            <Stack direction="row" alignItems="center" gap={1}>
                              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: cat.color || "#64748b" }} />
                              {cat.name}
                            </Stack>
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <ImageUpload
                        label="Thumbnail Image (Square)"
                        folder="articles/thumbnails"
                        value={formData.thumbnail_url}
                        onChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <ImageUpload
                        label="Banner Image (16:9)"
                        folder="articles/banners"
                        value={formData.imageUrl}
                        onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{
                    "& .quill": { bgcolor: "white", borderRadius: 2 },
                    "& .ql-toolbar": { borderTopLeftRadius: 8, borderTopRightRadius: 8, borderColor: "#e2e8f0" },
                    "& .ql-container": { borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderColor: "#e2e8f0", minHeight: 300, fontSize: "1rem", fontFamily: "'Inter', sans-serif" }
                  }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: "#475569" }}>Article Content *</Typography>
                    <CustomEditor
                      value={formData.details}
                      onChange={(val) => setFormData({ ...formData, details: val })}
                      placeholder="Write your article content here..."
                    />
                    <Stack direction="row" justifyContent="flex-end" gap={2} sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                        {charCount} characters
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                        {wordCount} words
                      </Typography>
                    </Stack>
                  </Box>

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
        </Grid>

        {/* Preview */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ borderRadius: 3, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", position: "sticky", top: 80 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 3 }}>
                <PreviewIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#0f172a" }}>
                  Live Preview
                </Typography>
              </Stack>

              {/* SEO Card Preview */}
              <Box sx={{
                border: "1px solid #e2e8f0", borderRadius: 2, overflow: "hidden", mb: 3,
              }}>
                {formData.thumbnail_url ? (
                  <Box sx={{ height: 160, bgcolor: "#f1f5f9", position: "relative", overflow: "hidden" }}>
                    <img
                      src={formData.thumbnail_url}
                      alt="Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ height: 160, bgcolor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ImageIcon sx={{ fontSize: 40, color: "#cbd5e1" }} />
                  </Box>
                )}
                <Box sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ color: "#10b981", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.6rem" }}>
                    dragonnews.com
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#0f172a", mt: 0.5, lineHeight: 1.3 }}>
                    {formData.title || "Article Title Preview"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mt: 0.5 }}>
                    {formData.details
                      ? createExcerpt(formData.details, 120)
                      : "Article description will appear here..."
                    }
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2, borderColor: "#f1f5f9" }} />

              {/* Article Meta */}
              <Typography variant="caption" fontWeight={700} sx={{ color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.6rem" }}>
                Article Details
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>Category</Typography>
                  {formData.category ? (
                    <Chip label={formData.category} size="small"
                      sx={{
                        height: 20, fontSize: "0.6rem", fontWeight: 700,
                        bgcolor: `${categories.find((c) => c.name === formData.category)?.color || "#64748b"}18`,
                        color: categories.find((c) => c.name === formData.category)?.color || "#64748b",
                      }}
                    />
                  ) : (
                    <Typography variant="caption" sx={{ color: "#cbd5e1" }}>Not set</Typography>
                  )}
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>Author</Typography>
                  <Typography variant="caption" fontWeight={600} sx={{ color: "#334155" }}>
                    {formData.authorName || "—"}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>Date</Typography>
                  <Typography variant="caption" fontWeight={600} sx={{ color: "#334155" }}>
                    {new Date().toLocaleDateString()}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>Word Count</Typography>
                  <Chip
                    label={`${wordCount} words`} size="small"
                    sx={{
                      height: 20, fontSize: "0.6rem", fontWeight: 700,
                      bgcolor: wordCount > 100 ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                      color: wordCount > 100 ? "#10b981" : "#f59e0b",
                    }}
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
