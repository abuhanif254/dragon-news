"use client";
import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import Link from "next/link";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import VerifiedIcon from "@mui/icons-material/Verified";
import ArticleIcon from "@mui/icons-material/Article";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { authorPath, articlePath } from "@/lib/site";

const readingTime = (text = "") => {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

export default function EditorialVoices({ allNews = [] }) {
  // Aggregate authors and their latest columns dynamically from the corpus
  const authors = useMemo(() => {
    const map = new Map();

    allNews.forEach((article) => {
      const name = article.author?.name;
      if (!name || name.toLowerCase().includes("anonymous")) return;

      if (!map.has(name)) {
        map.set(name, {
          name,
          img: article.author.img || "",
          role: article.author.role || "Contributing Fellow",
          articleCount: 1,
          latestArticle: article,
        });
      } else {
        const item = map.get(name);
        item.articleCount += 1;
        if (!item.img && article.author.img) item.img = article.author.img;

        const prevDate = new Date(item.latestArticle.publishedAt || 0).getTime();
        const currDate = new Date(article.publishedAt || 0).getTime();
        if (currDate > prevDate) {
          item.latestArticle = article;
        }
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.articleCount - a.articleCount)
      .slice(0, 4);
  }, [allNews]);

  if (!authors || authors.length === 0) return null;

  return (
    <Box sx={{ my: 7 }}>
      {/* ── Section Header ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          mb: 3.5,
          pb: 1.5,
          borderBottom: "2px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: "rgba(192, 57, 43, 0.08)",
              color: "var(--brand-red, #c0392b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FormatQuoteIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              component="h2"
              fontWeight={900}
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontSize: { xs: "1.4rem", sm: "1.8rem" },
              }}
            >
              Editorial Voices & Columnists
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              Critical inquiry, philosophical discourse, and independent analysis from our contributing fellows
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* ── Author Cards 4-Column Grid ── */}
      <Grid container spacing={{ xs: 2.5, sm: 3 }}>
        {authors.map((author) => {
          const authorUrl = authorPath(author.name);
          const articleUrl = articlePath(author.latestArticle);
          const rTime = readingTime(author.latestArticle.details || "");

          return (
            <Grid item xs={12} sm={6} md={3} key={author.name}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3.5,
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                    borderColor: "rgba(192, 57, 43, 0.3)",
                    "& .voice-title": { color: "var(--brand-red, #c0392b)" },
                    "& .author-avatar": { transform: "scale(1.06)" },
                  },
                }}
              >
                <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
                  {/* Author Header Profile */}
                  <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 2 }}>
                    <Link href={authorUrl} style={{ textDecoration: "none" }}>
                      {author.img ? (
                        <Avatar
                          src={author.img}
                          alt={author.name}
                          className="author-avatar"
                          sx={{
                            width: 56,
                            height: 56,
                            border: "2px solid",
                            borderColor: "var(--brand-red, #c0392b)",
                            boxShadow: "0 2px 8px rgba(192,57,43,0.15)",
                            transition: "transform 0.3s ease",
                          }}
                        />
                      ) : (
                        <Avatar
                          className="author-avatar"
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: "var(--brand-red, #c0392b)",
                            fontSize: "1.2rem",
                            fontWeight: 800,
                            transition: "transform 0.3s ease",
                          }}
                        >
                          {author.name.charAt(0)}
                        </Avatar>
                      )}
                    </Link>

                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Link href={authorUrl} style={{ textDecoration: "none", color: "inherit" }}>
                        <Stack direction="row" alignItems="center" gap={0.5}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={800}
                            noWrap
                            sx={{
                              fontFamily: "'Playfair Display', serif",
                              "&:hover": { color: "var(--brand-red, #c0392b)" },
                            }}
                          >
                            {author.name}
                          </Typography>
                          <VerifiedIcon sx={{ fontSize: 16, color: "#3498db" }} />
                        </Stack>
                      </Link>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", fontSize: "0.74rem" }}
                      >
                        {author.role}
                      </Typography>
                      <Chip
                        icon={<ArticleIcon sx={{ fontSize: "12px !important" }} />}
                        label={`${author.articleCount} ${author.articleCount === 1 ? "Essay" : "Essays"}`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          mt: 0.5,
                          bgcolor: "rgba(192, 57, 43, 0.06)",
                          color: "var(--brand-red, #c0392b)",
                        }}
                      />
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Latest Opinion Pull-Quote */}
                  <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={700}
                      sx={{ textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.65rem", mb: 0.8 }}
                    >
                      Latest Perspective
                    </Typography>

                    <Link href={articleUrl} style={{ textDecoration: "none", color: "inherit" }}>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        className="voice-title"
                        sx={{
                          fontFamily: "'Playfair Display', serif",
                          fontStyle: "italic",
                          lineHeight: 1.45,
                          fontSize: "0.92rem",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          mb: 1.5,
                          transition: "color 0.2s ease",
                        }}
                      >
                        &ldquo;{author.latestArticle.title}&rdquo;
                      </Typography>
                    </Link>

                    <Stack direction="row" alignItems="center" gap={1} sx={{ mt: "auto", pt: 1 }}>
                      <AccessTimeIcon sx={{ fontSize: 12, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                        {rTime} min read
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem", ml: "auto" }}>
                        {author.latestArticle.publishedAt
                          ? new Date(author.latestArticle.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "Recent"}
                      </Typography>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
