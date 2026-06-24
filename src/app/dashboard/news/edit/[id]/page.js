"use client";
import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper, Grid, MenuItem, Alert, CircularProgress } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { getNewsById, updateNews, getCategories } from "@/lib/firestore";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { subscribeToAuth } from "@/lib/auth-service";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const quillModules = {
  toolbar: [
    [{ header: [2, 3, 4, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

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
        name: formData.authorName,
        published_date: article.author?.published_date || new Date().toISOString().split("T")[0],
        img: article.author?.img || user.photoURL || user.photo || "",
      },
    };

    try {
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
    <Box maxWidth="800px" mx="auto">
      <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mb: 3, fontWeight: "bold" }}>
        Back to Articles
      </Button>
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
            <Grid item xs={12} sm={6}>
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
              <TextField 
                fullWidth required 
                label="Author Name" 
                value={formData.authorName} 
                onChange={e => setFormData({...formData, authorName: e.target.value})} 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Thumbnail Image URL" 
                value={formData.thumbnail_url} 
                onChange={e => setFormData({...formData, thumbnail_url: e.target.value})} 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Full Banner Image URL" 
                value={formData.imageUrl} 
                onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{
                "& .quill": { bgcolor: "white", borderRadius: 2 },
                "& .ql-toolbar": { borderTopLeftRadius: 8, borderTopRightRadius: 8, borderColor: "#e2e8f0" },
                "& .ql-container": { borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderColor: "#e2e8f0", minHeight: 300, fontSize: "1rem", fontFamily: "'Inter', sans-serif" }
              }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: "#475569" }}>Article Content *</Typography>
                <ReactQuill
                  theme="snow"
                  value={formData.details}
                  onChange={(val) => setFormData({ ...formData, details: val })}
                  modules={quillModules}
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
    </Box>
  );
}
