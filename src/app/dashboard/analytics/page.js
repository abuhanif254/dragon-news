"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid2,
  Stack,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  CircularProgress,
  Divider,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ArticleIcon from "@mui/icons-material/Article";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import { getNewsForUser } from "@/lib/firestore";
import { subscribeToAuth } from "@/lib/auth-service";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => {
      if (u) fetchAnalytics(u);
      if (!u) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchAnalytics = async (activeUser) => {
    try {
      const articles = await getNewsForUser(activeUser);

      if (!articles || articles.length === 0) {
        setAnalytics({
          totalArticles: 0,
          totalViews: 0,
          avgRating: "0.00",
          topArticles: [],
          categoryPerformance: [],
          topAuthors: [],
        });
        setLoading(false);
        return;
      }

      // Calculate analytics
      const totalViews = articles.reduce((sum, a) => sum + (a.total_view || 0), 0);
      const avgRating = (articles.reduce((sum, a) => sum + (a.rating?.number || 0), 0) / articles.length).toFixed(2);
      
      // Top articles by views
      const topArticles = [...articles]
        .sort((a, b) => (b.total_view || 0) - (a.total_view || 0))
        .slice(0, 10);

      // Category performance
      const categoryStats = {};
      articles.forEach((a) => {
        if (!categoryStats[a.category]) {
          categoryStats[a.category] = { count: 0, views: 0, ratings: [] };
        }
        categoryStats[a.category].count++;
        categoryStats[a.category].views += a.total_view || 0;
        categoryStats[a.category].ratings.push(a.rating?.number || 0);
      });

      const categoryPerformance = Object.entries(categoryStats).map(([name, stats]) => ({
        name,
        articles: stats.count,
        views: stats.views,
        avgRating: (stats.ratings.reduce((a, b) => a + b, 0) / (stats.ratings.length || 1)).toFixed(2),
      })).sort((a, b) => b.views - a.views);

      // Author performance
      const authorStats = {};
      articles.forEach((a) => {
        const author = a.author?.name || "Unknown";
        if (!authorStats[author]) {
          authorStats[author] = { count: 0, views: 0 };
        }
        authorStats[author].count++;
        authorStats[author].views += a.total_view || 0;
      });

      const topAuthors = Object.entries(authorStats)
        .map(([name, stats]) => ({
          name,
          articles: stats.count,
          views: stats.views,
          avgViews: Math.round(stats.views / (stats.count || 1)),
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      setAnalytics({
        totalArticles: articles.length,
        totalViews,
        avgRating,
        topArticles,
        categoryPerformance,
        topAuthors,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress color="error" />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No analytics data available
        </Typography>
      </Box>
    );
  }

  const catColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#1e293b", mb: 0.5 }}>
          Analytics Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Comprehensive insights into your content performance
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid2 container spacing={3} sx={{ mb: 4 }}>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
                    Total Articles
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: "#0f172a", mt: 1 }}>
                    {analytics.totalArticles}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #ef4444, #f97316)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <ArticleIcon />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
                    Total Views
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: "#0f172a", mt: 1 }}>
                    {analytics.totalViews >= 1000 ? (analytics.totalViews / 1000).toFixed(1) + "k" : analytics.totalViews}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #10b981, #14b8a6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <VisibilityIcon />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
                    Avg Rating
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: "#0f172a", mt: 1 }}>
                    {analytics.avgRating}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #f59e0b, #f97316)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <ThumbUpIcon />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
                    Avg Views
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: "#0f172a", mt: 1 }}>
                    {analytics.totalArticles > 0 ? Math.round(analytics.totalViews / analytics.totalArticles) : 0}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <TrendingUpIcon />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      <Grid2 container spacing={3}>
        {/* Category Performance */}
        <Grid2 size={{ xs: 12, lg: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Category Performance
              </Typography>
              <Stack spacing={2.5}>
                {analytics.categoryPerformance.map((cat, i) => (
                  <Box key={cat.name}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Stack direction="row" alignItems="center" gap={1.5}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: catColors[i % catColors.length],
                          }}
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {cat.name}
                        </Typography>
                      </Stack>
                      <Stack direction="row" gap={2} alignItems="center">
                        <Chip
                          label={`${cat.articles} articles`}
                          size="small"
                          sx={{ bgcolor: "#f1f5f9", fontWeight: 600, fontSize: "0.7rem" }}
                        />
                        <Typography variant="body2" fontWeight={700} sx={{ minWidth: 60, textAlign: "right" }}>
                          {cat.views.toLocaleString()} views
                        </Typography>
                      </Stack>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={analytics.categoryPerformance[0]?.views > 0 ? (cat.views / analytics.categoryPerformance[0].views) * 100 : 0}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "#f1f5f9",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 4,
                          bgcolor: catColors[i % catColors.length],
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid2>

        {/* Top Authors */}
        <Grid2 size={{ xs: 12, lg: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Top Authors
              </Typography>
              <Stack spacing={2}>
                {analytics.topAuthors.map((author, i) => (
                  <Stack
                    key={author.name}
                    direction="row"
                    alignItems="center"
                    gap={2}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: i === 0 ? "rgba(239,68,68,0.05)" : "#f8fafc",
                      border: i === 0 ? "1px solid rgba(239,68,68,0.1)" : "none",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: i < 3 ? ["#ef4444", "#f59e0b", "#3b82f6"][i] : "#94a3b8",
                        fontWeight: 700,
                      }}
                    >
                      {author.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {author.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {author.articles} articles · {author.avgViews} avg views
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: "#0f172a" }}>
                      {author.views.toLocaleString()}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid2>

        {/* Top Performing Articles */}
        <Grid2 size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 3 }}>
                <TrendingUpIcon sx={{ color: "#ef4444" }} />
                <Typography variant="h6" fontWeight="bold">
                  Top 10 Performing Articles
                </Typography>
              </Stack>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold", color: "#64748b" }}>Rank</TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "#64748b" }}>Article</TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "#64748b" }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "#64748b" }}>Author</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", color: "#64748b" }}>Views</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", color: "#64748b" }}>Rating</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.topArticles.map((article, i) => (
                      <TableRow key={article._id || article.id} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                        <TableCell>
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: 12,
                              fontWeight: 800,
                              bgcolor: i < 3 ? ["#ef4444", "#f59e0b", "#3b82f6"][i] : "#e2e8f0",
                              color: i < 3 ? "white" : "#64748b",
                            }}
                          >
                            {i + 1}
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} sx={{ maxWidth: 400 }} noWrap>
                            {article.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={article.category}
                            size="small"
                            sx={{ bgcolor: "rgba(239,68,68,0.08)", color: "#ef4444", fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {article.author?.name || "Unknown"}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={700}>
                            {(article.total_view || 0).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`⭐ ${article.rating?.number || 0}`}
                            size="small"
                            sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 600 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  );
}
