"use client";
import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper, Grid, MenuItem, Alert, CircularProgress, Stack, Card, CardContent } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { getNewsById, updateNews, getCategories, getNewsRevisions, createNewsRevision } from "@/lib/firestore";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';
import { subscribeToAuth } from "@/lib/auth-service";
import CustomEditor from "@/components/ui/CustomEditor/CustomEditor";
import ImageUpload from "@/components/ui/ImageUpload/ImageUpload";

export default function EditNews() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [categories, setCategories] = useState([]);
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
  const [fetching, setFetching] = useState(true);
  const [user, setUser] = useState(null);
  const [article, setArticle] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [activeRevisionId, setActiveRevisionId] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchArticleAndCats = async () => {
      if (!user) return;
      try {
        setFetching(true);
        // Fetch categories
        const cats = await getCategories();
        setCategories(cats);

        // Fetch article
        const article = await getNewsById(id);

        // Fetch revisions
        const revs = await getNewsRevisions(id);
        setRevisions(revs);
        
        if (article) {
          const ownsArticle =
            article.createdBy === user.uid ||
            article.author?.uid === user.uid ||
            article.author?.email === user.email;

          if (user.role !== "admin" && (!ownsArticle || article.status === "approved")) {
            setStatus({ type: "error", message: "You can only edit your own unpublished submissions." });
            return;
          }

          setArticle(article);
          setFormData({
            title: article.title || "",
            category: article.category || "",
            thumbnail_url: article.thumbnail_url || "",
            details: article.details || "",
            authorName: article.author?.name || "",
            imageUrl: article.image_url || article.thumbnail_url || "",
          });
        } else {
          setStatus({ type: "error", message: "Article not found in Firestore" });
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setStatus({ type: "error", message: "Failed to load data from Firestore" });
      } finally {
        setFetching(false);
      }
    };

    if (id && user) {
      fetchArticleAndCats();
    }
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !article) return;
    setLoading(true);
    setStatus({ type: "", message: "" });

    if (user.role !== "admin" && article.status === "approved") {
      setStatus({ type: "error", message: "Published articles can only be edited by an admin." });
      setLoading(false);
      return;
    }

    const updatedArticle = {
      title: formData.title,
      category: formData.category,
      details: formData.details,
      thumbnail_url: formData.thumbnail_url,
      image_url: formData.imageUrl || formData.thumbnail_url,
      status: user.role === "admin" ? article.status : "pending",
      author: {
        uid: article.author?.uid || user.uid,
        email: article.author?.email || user.email || "",
        name: article.author?.name || user.displayName || user.name || "The Brain Editorial Team",
        published_date: article.author?.published_date || new Date().toISOString().split("T")[0],
        img: article.author?.img || user.photoURL || user.photo || "",
      },
    };

    try {
      const rev = {
        title: article.title || "",
        category: article.category || "",
        details: article.details || "",
        thumbnail_url: article.thumbnail_url || "",
        imageUrl: article.image_url || article.thumbnail_url || "",
        authorName: article.author?.name || "",
        savedBy: user.email || user.uid,
        savedAt: new Date().toISOString(),
      };
      await createNewsRevision(id, rev);

      await updateNews(id, updatedArticle);
      setStatus({ type: "success", message: "Article updated successfully!" });
      setTimeout(() => router.push("/dashboard/news"), 1500);
    } catch (err) {
      console.error("Error updating article:", err);
      setStatus({ type: "error", message: "Error updating article in Firestore." });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="error" />
      </Box>
    );
  }

  return (
    <Box maxWidth="1200px" mx="auto">
      <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mb: 3, fontWeight: "bold" }}>
        Back to Articles
      </Button>

      {activeRevisionId && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3, borderRadius: 2.5 }} 
          onClose={() => {
            setFormData({
              title: article.title || "",
              category: article.category || "",
              thumbnail_url: article.thumbnail_url || "",
              details: article.details || "",
              authorName: article.author?.name || "",
              imageUrl: article.image_url || article.thumbnail_url || "",
            });
            setActiveRevisionId(null);
          }}
        >
          You are viewing a revision snapshot. Click <strong>UPDATE ARTICLE</strong> to save and restore this version.
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Editor Form */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight="900" mb={3} color="#0f172a">
              Edit Article
            </Typography>

            {status.message && (
              <Alert severity={status.type} sx={{ mb: 3 }}>
                {status.message}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth required 
                    label="Article Title" 
                    variant="outlined"
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    select fullWidth required 
                    label="Category" 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.map(cat => (
                      <MenuItem key={cat.id || cat.name} value={cat.name}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
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
                <Grid item xs={12}>
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
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="error" 
                    size="large" 
                    fullWidth 
                    disabled={loading} 
                    sx={{ py: 2, fontWeight: "900", letterSpacing: 0.5, borderRadius: 2 }}
                  >
                    {loading ? "Updating Article..." : "UPDATE ARTICLE"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Revision Timeline Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, position: "sticky", top: 80 }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 3 }}>
              <HistoryIcon sx={{ color: "var(--brand-red)", fontSize: 22 }} />
              <Typography variant="subtitle1" fontWeight={900}>
                Revision History
              </Typography>
            </Stack>

            {revisions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No older revisions saved yet. Revisions are created automatically when you update this article.
              </Typography>
            ) : (
              <Stack spacing={2} sx={{ maxHeight: "65vh", overflowY: "auto", pr: 0.5 }}>
                {revisions.map((rev) => (
                  <Card 
                    key={rev.id} 
                    variant="outlined" 
                    sx={{ 
                      borderRadius: 2, 
                      cursor: "pointer",
                      borderColor: activeRevisionId === rev.id ? "var(--brand-red)" : "divider",
                      bgcolor: activeRevisionId === rev.id ? "rgba(192, 57, 43, 0.02)" : "transparent",
                      transition: "all 0.2s",
                      "&:hover": { borderColor: "var(--brand-red)" }
                    }}
                    onClick={() => {
                      setFormData({
                        title: rev.title || "",
                        category: rev.category || "",
                        thumbnail_url: rev.thumbnail_url || "",
                        details: rev.details || "",
                        authorName: rev.authorName || "",
                        imageUrl: rev.imageUrl || "",
                      });
                      setActiveRevisionId(rev.id);
                    }}
                  >
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Typography variant="subtitle2" fontWeight={800} noWrap>
                        {rev.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                        Saved: {new Date(rev.createdAt).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        By: {rev.savedBy}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
