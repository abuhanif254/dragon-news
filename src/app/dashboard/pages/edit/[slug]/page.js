"use client";
import { useState, useEffect, use } from "react";
import {
  Box, Typography, TextField, Button, Paper, CircularProgress, Alert
} from "@mui/material";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { getPage, savePage } from "@/lib/firestore";
import CustomEditor from "@/components/ui/CustomEditor/CustomEditor";
import DOMPurify from "dompurify";

export default function EditPage({ params }) {
  const router = useRouter();
  // Next.js 15 requires awaiting params
  const { slug } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    fetchPageData();
  }, [slug]);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      const data = await getPage(slug);
      if (data) {
        setFormData({
          title: data.title || "",
          content: data.content || "",
        });
      } else {
        // Default titles based on slug if it's new
        const titles = {
          "about": "About Us",
          "contact": "Contact Us",
          "privacy-policy": "Privacy Policy",
          "terms": "Terms of Service"
        };
        setFormData(prev => ({ ...prev, title: titles[slug] || "" }));
      }
    } catch (err) {
      console.error("Error fetching page:", err);
      setStatus({ type: "error", message: "Failed to load page content." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setStatus({ type: "error", message: "Title and content are required." });
      return;
    }

    try {
      setSaving(true);
      setStatus({ type: "", message: "" });
      
      // Sanitize before saving to be safe
      const sanitizedContent = DOMPurify.sanitize(formData.content, { ADD_ATTR: ['target'] });

      await savePage(slug, {
        title: formData.title,
        content: sanitizedContent
      });

      setStatus({ type: "success", message: "Page saved successfully!" });
      setTimeout(() => {
        router.push("/dashboard/pages");
      }, 1500);
    } catch (error) {
      console.error("Error saving page:", error);
      setStatus({ type: "error", message: "Failed to save page." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress color="error" />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.push("/dashboard/pages")}
          color="inherit"
        >
          Back
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            Edit Page
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Editing content for /{slug}
          </Typography>
        </Box>
      </Box>

      {status.message && (
        <Alert severity={status.type} sx={{ mb: 3 }}>
          {status.message}
        </Alert>
      )}

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        <TextField
          fullWidth
          label="Page Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          sx={{ mb: 4 }}
        />

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "text.secondary" }}>
            Page Content
          </Typography>
          <Box sx={{ 
            "& .quill": { height: 400, display: "flex", flexDirection: "column" },
            "& .ql-container": { flex: 1, overflowY: "auto", fontSize: "1rem" },
            "& .ql-editor": { minHeight: "100%" }
          }}>
            <CustomEditor
              value={formData.content}
              onChange={(val) => setFormData({ ...formData, content: val })}
              placeholder="Write your page content here..."
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            color="error"
            size="large"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{ px: 4 }}
          >
            {saving ? "Saving..." : "Save Page"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
