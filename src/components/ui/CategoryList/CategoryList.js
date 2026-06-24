"use client";
import { useState, useEffect } from "react";
import { getAllCategories } from "@/utils/getAllCategories";
import { getAllNews } from "@/utils/getAllNews";
import { Box, Button, Divider, Stack, Typography, CircularProgress } from "@mui/material";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const CategoryList = () => {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "";

  const [categories, setCategories] = useState([]);
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, newsRes] = await Promise.all([
          getAllCategories(),
          getAllNews()
        ]);
        
        if (catRes.status) setCategories(catRes.data);
        if (newsRes.status) setAllNews(newsRes.data);
      } catch (error) {
        console.error("Error loading category list:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Count articles per category
  const countMap = {};
  allNews.forEach((n) => {
    const key = n.category?.toLowerCase();
    if (key) countMap[key] = (countMap[key] || 0) + 1;
  });

  if (loading) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center', p: 3 }}>
        <CircularProgress size={24} color="error" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        mt: 4,
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        position: 'sticky',
        top: 24,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #c0392b 100%)",
          px: 2.5,
          py: 2,
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: "white", fontWeight: 800, letterSpacing: "0.12em" }}
        >
          Browse Topics
        </Typography>
      </Box>

      {/* List */}
      <Box sx={{ px: 1.5, pt: 1.5 }}>
        <Link href="/categories/news?category=all-news" style={{ display: "block" }}>
          <Button
            fullWidth
            variant={activeCategory === "all-news" ? "contained" : "outlined"}
            size="small"
            sx={{
              justifyContent: "space-between",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              mb: 0.5,
              fontFamily: "'Inter', sans-serif",
              ...(activeCategory === "all-news"
                ? {
                    background: "linear-gradient(135deg, #c0392b, #e74c3c)",
                    color: "white",
                    border: "none",
                  }
                : {
                    borderColor: "divider",
                    color: "text.primary",
                    "&:hover": { borderColor: "#c0392b", color: "#c0392b", backgroundColor: "rgba(192,57,43,0.04)" },
                  }),
            }}
          >
            <span>All News</span>
            <Box
              component="span"
              sx={{
                fontSize: "0.7rem",
                fontWeight: 800,
                px: 1,
                py: 0.2,
                borderRadius: 1,
                backgroundColor: activeCategory === "all-news" ? "rgba(255,255,255,0.2)" : "rgba(192,57,43,0.08)",
                color: activeCategory === "all-news" ? "white" : "#c0392b",
              }}
            >
              {allNews.length}
            </Box>
          </Button>
        </Link>

        <Divider sx={{ my: 1 }} />

        <Stack spacing={0.5} sx={{ pb: 1.5 }}>
          {categories.map((category) => {
            const slug = category.title.toLowerCase();
            const count = countMap[slug] || 0;
            const isActive = activeCategory === slug;
            return (
              <Link
                key={category.id}
                href={`/categories/news?category=${slug}`}
                style={{ display: "block" }}
              >
                <Button
                  fullWidth
                  variant={isActive ? "contained" : "text"}
                  size="small"
                  sx={{
                    justifyContent: "space-between",
                    textTransform: "none",
                    fontWeight: isActive ? 700 : 500,
                    borderRadius: 2,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.85rem",
                    ...(isActive
                      ? {
                          background: "linear-gradient(135deg, #c0392b, #e74c3c)",
                          color: "white",
                        }
                      : {
                          color: "text.primary",
                          "&:hover": { backgroundColor: "rgba(192,57,43,0.06)", color: "#c0392b" },
                        }),
                  }}
                >
                  <span>{category.title}</span>
                  {count > 0 && (
                    <Box
                      component="span"
                      sx={{
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        px: 0.8,
                        py: 0.2,
                        borderRadius: 1,
                        backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "rgba(192,57,43,0.08)",
                        color: isActive ? "white" : "#c0392b",
                        minWidth: 20,
                        textAlign: "center",
                      }}
                    >
                      {count}
                    </Box>
                  )}
                </Button>
              </Link>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
};

export default CategoryList;
