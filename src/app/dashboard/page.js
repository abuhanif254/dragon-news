"use client";
import { useState, useEffect } from "react";
import { Box, Typography, Grid, Card, CardContent, Stack, Divider, Chip, Avatar, LinearProgress, CircularProgress, Button, Alert, TextField } from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import CategoryIcon from "@mui/icons-material/Category";
import VisibilityIcon from "@mui/icons-material/Visibility";
import StarIcon from "@mui/icons-material/Star";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import BarChartIcon from "@mui/icons-material/BarChart";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import { getAllNews } from "@/utils/getAllNews";
import Link from "next/link";
import { requestWriterAccess, subscribeToAuth } from "@/lib/auth-service";

export default function DashboardOverview() {
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [applyStatus, setApplyStatus] = useState({ type: "", message: "" });
  const [applying, setApplying] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => setUser(u));
    const fetchNews = async () => {
      try {
        const response = await getAllNews();
        if (response.status) {
          setAllNews(response.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.role === "writer" && user?.writerApplicationStatus === "approved") {
      if (typeof window !== "undefined") {
        const dismissed = localStorage.getItem(`dismiss_welcome_${user.uid}`);
        if (!dismissed) {
          setShowWelcome(true);
        }
      }
    } else {
      setShowWelcome(false);
    }
  }, [user]);

  const handleDismissWelcome = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`dismiss_welcome_${user.uid}`, "true");
    }
    setShowWelcome(false);
  };

  const handleWriterApplication = async () => {
    setApplying(true);
    setApplyStatus({ type: "", message: "" });

    try {
      await requestWriterAccess(applicationMessage);
      setUser((prev) => ({ ...prev, writerApplicationStatus: "pending" }));
      setApplicationMessage("");
      setApplyStatus({
        type: "success",
        message: "Your writer application was sent to the admin for review.",
      });
    } catch (error) {
      setApplyStatus({
        type: "error",
        message: error.message || "Unable to send writer application.",
      });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress color="error" />
      </Box>
    );
  }

  const uniqueCategories = [...new Set(allNews.map((n) => n.category))];
  const totalViews = allNews.reduce((sum, n) => sum + (n.total_view || 0), 0);
  const avgRating = allNews.length > 0 
    ? (allNews.reduce((sum, n) => sum + (n.rating?.number || 0), 0) / allNews.length).toFixed(1)
    : "0.0";
  const topArticles = [...allNews].sort((a, b) => (b.total_view || 0) - (a.total_view || 0)).slice(0, 5);
  const recentNews = [...allNews].sort((a, b) => {
    const dA = a.author?.published_date || "";
    const dB = b.author?.published_date || "";
    return dB.localeCompare(dA);
  }).slice(0, 5);

  const maxCatCount = allNews.length > 0 ? Math.max(...Object.values(allNews.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {}))) : 1;

  const categoryCount = {};
  allNews.forEach((n) => {
    categoryCount[n.category] = (categoryCount[n.category] || 0) + 1;
  });
  const categoryEntries = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);

  const catColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

  const stats = [
    {
      label: "Total Articles",
      value: allNews.length,
      icon: <ArticleIcon />,
      gradient: "linear-gradient(135deg, #ef4444, #f97316)",
      change: "Live",
    },
    {
      label: "Categories",
      value: uniqueCategories.length,
      icon: <CategoryIcon />,
      gradient: "linear-gradient(135deg, #3b82f6, #6366f1)",
      change: "Active",
    },
    {
      label: "Total Views",
      value: totalViews >= 1000 ? (totalViews / 1000).toFixed(1) + "k" : totalViews,
      icon: <VisibilityIcon />,
      gradient: "linear-gradient(135deg, #10b981, #14b8a6)",
      change: "Real-time",
    },
    {
      label: "Avg Rating",
      value: avgRating,
      icon: <StarIcon />,
      gradient: "linear-gradient(135deg, #f59e0b, #f97316)",
      change: "Global",
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: "#0f172a", lineHeight: 1.2 }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
            Welcome back! Here&apos;s what&apos;s happening with your news portal.
          </Typography>
        </Box>
        <Stack direction="row" gap={1} sx={{ display: { xs: "none", md: "flex" } }}>
          <Link href="/dashboard/news/create" style={{ textDecoration: "none" }}>
            <Chip
              icon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />}
              label="Publish Article"
              clickable
              sx={{
                fontWeight: 700, bgcolor: "#ef4444", color: "white",
                "&:hover": { bgcolor: "#dc2626" },
              }}
            />
          </Link>
          <Link href="/dashboard/analytics" style={{ textDecoration: "none" }}>
            <Chip
              icon={<BarChartIcon sx={{ fontSize: 16 }} />}
              label="View Analytics"
              clickable
              variant="outlined"
              sx={{ fontWeight: 600, borderColor: "#e2e8f0", "&:hover": { borderColor: "#3b82f6", color: "#3b82f6" } }}
            />
          </Link>
        </Stack>
      </Stack>

      {showWelcome && (
        <Card sx={{ 
          mb: 4, 
          borderRadius: 3.5, 
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
          color: "white", 
          boxShadow: "0 12px 30px rgba(37,99,235,0.25)",
          position: "relative",
          overflow: "hidden"
        }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h5" fontWeight={900} sx={{ mb: 1, fontFamily: "'Playfair Display', serif" }}>
                  🎉 Welcome to the Editorial Team!
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.6, maxWidth: 650 }}>
                  Your writer application has been approved by the editorial administrators. You now have complete access to compose and submit news stories, investigate metrics on your performance, and customize your professional author profile.
                </Typography>
              </Box>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="contained"
                  component={Link}
                  href="/dashboard/news/create"
                  sx={{
                    bgcolor: "white",
                    color: "#2563eb",
                    fontWeight: 800,
                    borderRadius: 2,
                    textTransform: "none",
                    px: 3,
                    py: 1,
                    whiteSpace: "nowrap",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.9)" }
                  }}
                >
                  Write First Article
                </Button>
                <Button
                  variant="text"
                  onClick={handleDismissWelcome}
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": { color: "white" }
                  }}
                >
                  Dismiss
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {user?.role === "reader" && (
        <Card sx={{ mb: 4, borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ md: "center" }}>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <HowToRegIcon sx={{ color: "#ef4444" }} />
                  <Typography variant="h6" fontWeight={800} sx={{ color: "#0f172a" }}>
                    Apply to Write
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.7 }}>
                  Readers can request writer access. Once the admin approves your application, you can submit articles for editorial review.
                </Typography>
              </Box>

              {user.writerApplicationStatus === "pending" ? (
                <Alert severity="info" sx={{ minWidth: { md: 320 }, borderRadius: 2 }}>
                  Your application is pending admin review.
                </Alert>
              ) : (
                <Stack spacing={1.5} sx={{ width: { xs: "100%", md: 420 } }}>
                  {applyStatus.message && (
                    <Alert severity={applyStatus.type} sx={{ borderRadius: 2 }}>
                      {applyStatus.message}
                    </Alert>
                  )}
                  <TextField
                    size="small"
                    multiline
                    minRows={2}
                    value={applicationMessage}
                    onChange={(event) => setApplicationMessage(event.target.value)}
                    placeholder="Tell the admin what you want to write about"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleWriterApplication}
                    disabled={applying}
                    startIcon={<HowToRegIcon />}
                    sx={{ alignSelf: "flex-start", bgcolor: "#ef4444", fontWeight: 700, textTransform: "none", borderRadius: 2 }}
                  >
                    {applying ? "Sending..." : "Request Writer Access"}
                  </Button>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card
              sx={{
                borderRadius: 3, border: "1px solid #f1f5f9",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
                },
                overflow: "visible",
                position: "relative",
              }}
            >
              <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.65rem" }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: "#0f172a", mt: 0.5, lineHeight: 1 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 44, height: 44, borderRadius: 2.5,
                      background: stat.gradient,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white",
                      boxShadow: `0 4px 12px ${stat.gradient.includes("ef4444") ? "rgba(239,68,68,0.3)" :
                        stat.gradient.includes("3b82f6") ? "rgba(59,130,246,0.3)" :
                        stat.gradient.includes("10b981") ? "rgba(16,185,129,0.3)" :
                        "rgba(245,158,11,0.3)"}`,
                      "& svg": { fontSize: 22 },
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Stack>
                <Chip
                  label={stat.change}
                  size="small"
                  sx={{
                    mt: 1.5, height: 22, fontSize: "0.65rem", fontWeight: 700,
                    bgcolor: "rgba(100,116,139,0.08)",
                    color: "#64748b",
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#0f172a" }}>
                  Category Distribution
                </Typography>
                <Link href="/dashboard/categories" style={{ textDecoration: "none" }}>
                  <Chip label="Manage" size="small" clickable variant="outlined"
                    sx={{ fontSize: "0.65rem", fontWeight: 600, borderColor: "#e2e8f0" }}
                  />
                </Link>
              </Stack>
              <Stack spacing={2}>
                {categoryEntries.map(([cat, count], i) => (
                  <Box key={cat}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: catColors[i % catColors.length] }} />
                        <Typography variant="body2" fontWeight={600} sx={{ color: "#334155" }}>
                          {cat}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" fontWeight={700} sx={{ color: "#64748b" }}>
                        {count} articles
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(count / maxCatCount) * 100}
                      sx={{
                        height: 6, borderRadius: 3, bgcolor: "#f1f5f9",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 3,
                          background: `linear-gradient(90deg, ${catColors[i % catColors.length]}, ${catColors[i % catColors.length]}88)`,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <TrendingUpIcon sx={{ color: "#ef4444", fontSize: 20 }} />
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#0f172a" }}>
                    Top Performing Articles
                  </Typography>
                </Stack>
                <Link href="/dashboard/analytics" style={{ textDecoration: "none" }}>
                  <Chip label="Full Report" size="small" clickable variant="outlined"
                    sx={{ fontSize: "0.65rem", fontWeight: 600, borderColor: "#e2e8f0" }}
                  />
                </Link>
              </Stack>
              <Stack spacing={1.5}>
                {topArticles.map((news, i) => (
                  <Stack
                    key={news.id}
                    direction="row" alignItems="center" gap={2}
                    sx={{
                      p: 1.5, borderRadius: 2,
                      transition: "all 0.2s",
                      "&:hover": { bgcolor: "#f8fafc" },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32, height: 32, fontSize: 13, fontWeight: 800,
                        bgcolor: i < 3 ? ["#ef4444", "#f59e0b", "#3b82f6"][i] : "#e2e8f0",
                        color: i < 3 ? "white" : "#64748b",
                      }}
                    >
                      {i + 1}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ color: "#0f172a" }}>
                        {news.title}
                      </Typography>
                      <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 0.3 }}>
                        <Chip label={news.category} size="small"
                          sx={{ height: 18, fontSize: "0.6rem", fontWeight: 700, bgcolor: "rgba(239,68,68,0.08)", color: "#ef4444" }}
                        />
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          {news.author?.name}
                        </Typography>
                      </Stack>
                    </Box>
                    <Stack alignItems="flex-end">
                      <Typography variant="body2" fontWeight={700} sx={{ color: "#0f172a" }}>
                        {(news.total_view || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.6rem" }}>
                        views
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#0f172a" }}>
                  Recently Published
                </Typography>
                <Link href="/dashboard/news" style={{ textDecoration: "none" }}>
                  <Chip
                    label="View All Articles"
                    icon={<ArrowForwardIcon sx={{ fontSize: "14px !important" }} />}
                    clickable size="small"
                    sx={{ fontWeight: 600, bgcolor: "#f1f5f9", color: "#334155", "& .MuiChip-icon": { order: 1, ml: 0.5, mr: -0.5 } }}
                  />
                </Link>
              </Stack>

              {recentNews.map((news, index) => (
                <Box key={news.id}>
                  <Stack
                    direction="row" alignItems="center" gap={2}
                    sx={{
                      py: 2, transition: "all 0.2s",
                      "&:hover": { bgcolor: "#fafbfc", borderRadius: 2, px: 1.5, mx: -1.5 },
                    }}
                  >
                    <Box
                      sx={{
                        width: 4, height: 40, borderRadius: 4,
                        background: `linear-gradient(180deg, ${catColors[index % catColors.length]}, ${catColors[index % catColors.length]}44)`,
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Link href={`/news/${news.id}`} style={{ textDecoration: "none" }}>
                        <Typography variant="body2" fontWeight={600} noWrap
                          sx={{ color: "#0f172a", "&:hover": { color: "#ef4444" }, cursor: "pointer" }}
                        >
                          {news.title}
                        </Typography>
                      </Link>
                      <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                        {news.author?.published_date} · {news.author?.name} · {news.total_view || 0} views
                      </Typography>
                    </Box>
                    <Chip
                      label={news.category}
                      size="small"
                      sx={{
                        height: 24, fontWeight: 700, fontSize: "0.65rem",
                        textTransform: "uppercase", letterSpacing: "0.05em",
                        bgcolor: "rgba(239,68,68,0.06)", color: "#ef4444",
                        border: "1px solid rgba(239,68,68,0.12)",
                      }}
                    />
                  </Stack>
                  {index < recentNews.length - 1 && <Divider sx={{ borderColor: "#f1f5f9" }} />}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
