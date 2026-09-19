"use client";
import React, { useState, useMemo } from "react";
import AdsterraBanner from "@/components/shared/AdsterraBanner";
import SideBar from "@/components/ui/SideBar/SideBar";
import NewsTicker from "@/components/ui/NewsTicker/NewsTicker";
import FeaturedGrid from "@/components/ui/FeaturedGrid/FeaturedGrid";
import ArticleCard from "@/components/ui/ArticleCard/ArticleCard";
import CategorySpotlight from "@/components/ui/CategorySpotlight/CategorySpotlight";
import EditorialSpotlight from "@/components/ui/EditorialSpotlight/EditorialSpotlight";
import EditorialVoices from "@/components/ui/EditorialVoices/EditorialVoices";
import {
  Grid,
  Box,
  Alert,
  AlertTitle,
  Typography,
  Button,
  Stack,
  Chip,
} from "@mui/material";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import ScienceIcon from "@mui/icons-material/Science";
import PsychologyIcon from "@mui/icons-material/Psychology";
import FilterListIcon from "@mui/icons-material/FilterList";
import { isBengali } from "@/lib/content-utils";

export default function HomeClient({ allNews = [], error }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(8);

  // Distribute top 4 stories to the main magazine hero grid
  const topStories = useMemo(() => allNews.slice(0, 4), [allNews]);
  const poolStories = useMemo(() => allNews.slice(4), [allNews]);

  // Extract unique categories across published articles
  const categories = useMemo(() => {
    const set = new Set();
    allNews.forEach((n) => {
      if (n.category && typeof n.category === "string" && n.category.trim()) {
        set.add(n.category.trim());
      }
    });
    return Array.from(set);
  }, [allNews]);

  // Detect presence of Bengali articles
  const hasBanglaArticles = useMemo(() => {
    return allNews.some((n) => isBengali(n.title + (n.details || "")));
  }, [allNews]);

  // Category Spotlight 1: Science & Technology
  const techArticles = useMemo(() => {
    const matched = allNews.filter((n) => {
      const cat = (n.category || "").toLowerCase();
      return cat.includes("tech") || cat.includes("science") || cat.includes("digital");
    });
    // Fallback: If no explicit tech category, use first available category with >= 2 articles
    if (matched.length > 0) return matched;
    const fallbackCat = categories[0];
    return fallbackCat ? allNews.filter((n) => n.category === fallbackCat) : [];
  }, [allNews, categories]);

  // Category Spotlight 2: Philosophy, Ethics & Free Thought
  const philosophyArticles = useMemo(() => {
    const matched = allNews.filter((n) => {
      const cat = (n.category || "").toLowerCase();
      return (
        cat.includes("philosophy") ||
        cat.includes("ethics") ||
        cat.includes("activism") ||
        cat.includes("culture") ||
        cat.includes("opinion")
      );
    });
    // Fallback: If no explicit philosophy category, pick next available category
    if (matched.length > 0) return matched;
    const fallbackCat = categories[1] || categories[0];
    return fallbackCat ? allNews.filter((n) => n.category === fallbackCat) : [];
  }, [allNews, categories]);

  // Special Investigation story: deep dive article with richest content & image
  const spotlightArticle = useMemo(() => {
    if (allNews.length === 0) return null;
    const withImages = allNews.filter((a) => a.thumbnail_url || a.image_url);
    const pool = withImages.length > 0 ? withImages : allNews;
    return pool.reduce((longest, curr) => {
      return (curr.details || "").length > (longest.details || "").length ? curr : longest;
    }, pool[0]);
  }, [allNews]);

  // Filter pool stories based on active pill
  const filteredStories = useMemo(() => {
    if (selectedCategory === "all") return poolStories;
    if (selectedCategory === "bangla") {
      return poolStories.filter((n) => isBengali(n.title + (n.details || "")));
    }
    return poolStories.filter(
      (n) => (n.category || "").toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [poolStories, selectedCategory]);

  const displayedStories = filteredStories.slice(0, visibleCount);

  if (error) {
    return (
      <Box sx={{ my: 10, display: "flex", justifyContent: "center" }}>
        <Alert
          severity="error"
          icon={<WifiOffIcon fontSize="inherit" />}
          sx={{ maxWidth: 600, borderRadius: 3, p: 3, boxShadow: "0 4px 20px rgba(192,57,43,0.1)" }}
        >
          <AlertTitle sx={{ fontWeight: 800, fontSize: "1.2rem" }}>Database Connection Error</AlertTitle>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
            The Brain was unable to reach the Cloud Firestore backend. This is usually caused by a network block, VPN, or firewall on your local machine.
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: "block", mb: 2, fontFamily: "monospace", p: 1, bgcolor: "rgba(0,0,0,0.05)", borderRadius: 1 }}
          >
            Error: {error}
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={() => window.location.reload()}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Try Reconnecting
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* ── 1. Breaking News Ticker ── */}
      <Box className="fade-in-up" sx={{ animationDelay: "0.1s" }}>
        <NewsTicker allNews={allNews} />
      </Box>

      {/* ── 2. Top Leaderboard Banner ── */}
      <Box className="fade-in-up" sx={{ animationDelay: "0.3s", mt: 3, display: { xs: "none", md: "block" } }}>
        <AdsterraBanner placement="homeLeaderboard" />
      </Box>

      {/* ── 3. Magazine Top Stories Hero Grid ── */}
      <Box className="fade-in-up" sx={{ animationDelay: "0.5s", mt: 3 }}>
        <FeaturedGrid articles={topStories} title="Top Stories" />
      </Box>

      {/* ── 4. Showcase 1: Science & Digital Frontiers ── */}
      {techArticles.length > 0 && (
        <Box className="fade-in-up" sx={{ animationDelay: "0.55s", mt: 2 }}>
          <CategorySpotlight
            category={techArticles[0]?.category || "Technology"}
            title="Science & Digital Frontiers"
            icon={ScienceIcon}
            articles={techArticles}
          />
        </Box>
      )}

      {/* ── 5. Special Investigation Spotlight ── */}
      {spotlightArticle && (
        <Box className="fade-in-up" sx={{ animationDelay: "0.58s", mt: 2 }}>
          <EditorialSpotlight article={spotlightArticle} />
        </Box>
      )}

      {/* ── 6. Two Column Layout for Recent News & Sidebar ── */}
      <Grid
        container
        spacing={{ xs: 2, sm: 3, md: 4 }}
        sx={{ mt: 2, width: "100%", m: 0 }}
        className="fade-in-up"
        style={{ animationDelay: "0.6s" }}
      >
        {/* Left Column: Recent News Feed */}
        <Grid item xs={12} md={8} sx={{ pl: { xs: 0, sm: 2, md: 3 } }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
              mb: 3,
              pb: 2,
              borderBottom: "2px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" alignItems="center" gap={1.5}>
              <WhatshotIcon sx={{ color: "var(--brand-red, #c0392b)", fontSize: 32 }} />
              <Typography variant="h4" component="h2" fontWeight={900} sx={{ fontFamily: "'Playfair Display', serif" }}>
                Recent News
              </Typography>
            </Stack>

            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Updated regularly with verified reporting
            </Typography>
          </Box>

          {/* Interactive Category Filter Pills */}
          <Box
            sx={{
              mb: 4,
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Stack direction="row" alignItems="center" gap={0.6} sx={{ mr: 0.5, color: "text.secondary" }}>
              <FilterListIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" fontWeight={800} sx={{ textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.68rem" }}>
                Filter:
              </Typography>
            </Stack>

            {/* All Stories Pill */}
            <Chip
              label={`All (${poolStories.length})`}
              onClick={() => {
                setSelectedCategory("all");
                setVisibleCount(8);
              }}
              size="small"
              clickable
              sx={{
                fontWeight: 700,
                borderRadius: 2,
                bgcolor: selectedCategory === "all" ? "var(--brand-red, #c0392b)" : "rgba(0,0,0,0.05)",
                color: selectedCategory === "all" ? "white" : "text.primary",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: selectedCategory === "all" ? "var(--brand-red, #c0392b)" : "rgba(192, 57, 43, 0.1)",
                },
              }}
            />

            {/* Dynamic Category Pills */}
            {categories.map((cat) => {
              const count = poolStories.filter((n) => (n.category || "").toLowerCase() === cat.toLowerCase()).length;
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <Chip
                  key={cat}
                  label={`${cat} (${count})`}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setVisibleCount(8);
                  }}
                  size="small"
                  clickable
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    bgcolor: isSelected ? "var(--brand-red, #c0392b)" : "rgba(0,0,0,0.05)",
                    color: isSelected ? "white" : "text.primary",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: isSelected ? "var(--brand-red, #c0392b)" : "rgba(192, 57, 43, 0.1)",
                    },
                  }}
                />
              );
            })}

            {/* Bangla Filter Pill */}
            {hasBanglaArticles && (
              <Chip
                label="বাংলা (Bangla)"
                onClick={() => {
                  setSelectedCategory("bangla");
                  setVisibleCount(8);
                }}
                size="small"
                clickable
                sx={{
                  fontWeight: 700,
                  borderRadius: 2,
                  bgcolor: selectedCategory === "bangla" ? "#27ae60" : "rgba(39, 174, 96, 0.1)",
                  color: selectedCategory === "bangla" ? "white" : "#27ae60",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: selectedCategory === "bangla" ? "#219653" : "rgba(39, 174, 96, 0.2)",
                  },
                }}
              />
            )}
          </Box>

          {/* Stories List or Empty State */}
          {displayedStories.length === 0 ? (
            <Box
              sx={{
                py: 8,
                textAlign: "center",
                bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"),
                borderRadius: 3,
                p: 4,
                border: "1px dashed",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1, fontFamily: "'Playfair Display', serif" }}>
                No stories found in this section
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Switch to another category or explore our full news archive.
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setSelectedCategory("all");
                  setVisibleCount(8);
                }}
                sx={{
                  bgcolor: "var(--brand-red, #c0392b)",
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#96281b" },
                }}
              >
                Show All Stories
              </Button>
            </Box>
          ) : (
            <Stack spacing={4}>
              {displayedStories.map((article) => (
                <ArticleCard key={article.id || article._id} article={article} layout="horizontal" />
              ))}
            </Stack>
          )}

          {/* Interactive Load More Button */}
          {filteredStories.length > visibleCount && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 6, mb: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                sx={{
                  borderColor: "var(--brand-red, #c0392b)",
                  color: "var(--brand-red, #c0392b)",
                  fontWeight: 800,
                  px: 4.5,
                  py: 1.3,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  boxShadow: "0 2px 10px rgba(192,57,43,0.08)",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "rgba(192, 57, 43, 0.06)",
                    borderColor: "var(--brand-red, #c0392b)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 18px rgba(192,57,43,0.15)",
                  },
                }}
              >
                Load More Articles ({visibleCount} of {filteredStories.length})
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5 }}>
                Showing {displayedStories.length} of {filteredStories.length} published stories
              </Typography>
            </Box>
          )}
        </Grid>

        {/* Right Column: Sticky Sidebar */}
        <Grid item xs={12} md={4} sx={{ pl: { xs: 0, sm: 2, md: 3 }, mt: { xs: 4, md: 0 } }}>
          <SideBar allNews={allNews} />
        </Grid>
      </Grid>

      {/* ── 7. Editorial Voices & Columnists (E-E-A-T) ── */}
      <Box className="fade-in-up" sx={{ animationDelay: "0.64s", mt: 6 }}>
        <EditorialVoices allNews={allNews} />
      </Box>

      {/* ── 8. Showcase 2: Philosophy, Ethics & Free Expression ── */}
      {philosophyArticles.length > 0 && (
        <Box className="fade-in-up" sx={{ animationDelay: "0.68s", mt: 6 }}>
          <CategorySpotlight
            category={philosophyArticles[0]?.category || "Philosophy"}
            title="Philosophy, Ethics & Free Thought"
            icon={PsychologyIcon}
            articles={philosophyArticles}
          />
        </Box>
      )}
    </Box>
  );
}
