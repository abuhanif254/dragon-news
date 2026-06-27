"use client";
import { useState, useEffect } from "react";
import { Box, Typography, Grid, CircularProgress, Stack, Button, Alert, Paper } from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import { subscribeToAuth } from "@/lib/auth-service";
import { getUserBookmarks } from "@/lib/firestore";
import { getAllNews } from "@/utils/getAllNews";
import ArticleCard from "@/components/ui/ArticleCard/ArticleCard";
import Link from "next/link";

export default function BookmarksPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (u) => {
      setUser(u);
      if (u) {
        try {
          // Fetch user bookmarks
          const bookmarkedIds = await getUserBookmarks(u.uid);
          if (bookmarkedIds.length === 0) {
            setArticles([]);
            setLoading(false);
            return;
          }

          // Fetch news
          const newsResponse = await getAllNews();
          if (newsResponse.status) {
            const bookmarkedArticles = newsResponse.data.filter(article => 
              bookmarkedIds.includes(article.id || article._id)
            );
            setArticles(bookmarkedArticles);
          } else {
            setError(newsResponse.message || "Failed to load articles.");
          }
        } catch (err) {
          console.error("Error loading bookmarks:", err);
          setError("An error occurred while loading your bookmarks.");
        } finally {
          setLoading(false);
        }
      } else {
        setArticles([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress color="error" />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={900} sx={{ color: "#0f172a", fontFamily: "'Playfair Display', serif" }}>
          Saved Bookmarks
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
          Your personal library of bookmarked articles and reports.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {articles.length === 0 ? (
        <Paper
          sx={{
            py: 8,
            px: 4,
            textAlign: "center",
            borderRadius: 3,
            border: "1px dashed #cbd5e1",
            boxShadow: "none",
            bgcolor: "transparent",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <BookmarkBorderIcon sx={{ fontSize: 64, color: "#94a3b8" }} />
          <Typography variant="h6" fontWeight={700} color="text.primary">
            No bookmarks saved yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 1 }}>
            Explore articles and click the bookmark button at the top-right of cards or within article headers to save them here.
          </Typography>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              color="error"
              sx={{
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 2,
                px: 3,
                bgcolor: "#c0392b",
                "&:hover": { bgcolor: "#96281b" }
              }}
            >
              Browse News
            </Button>
          </Link>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {articles.map((article) => (
            <Grid item xs={12} sm={6} md={4} key={article.id || article._id}>
              <ArticleCard article={article} layout="vertical" showExcerpt={true} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
