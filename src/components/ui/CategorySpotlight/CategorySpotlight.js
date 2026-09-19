"use client";
import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Stack,
  Avatar,
  Chip,
  Button,
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CategoryBadge from "../CategoryBadge/CategoryBadge";
import { articlePath } from "@/lib/site";
import { createExcerpt } from "@/lib/content-utils";

const readingTime = (text = "") => {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

export default function CategorySpotlight({
  category = "News",
  title,
  icon: IconComponent,
  articles = [],
}) {
  if (!articles || articles.length === 0) return null;

  const displayTitle = title || `${category} Highlights`;
  const leadArticle = articles[0];
  const stackedArticles = articles.slice(1, 4);
  const categoryLink = `/categories/news/${encodeURIComponent(category.toLowerCase())}`;

  return (
    <Box sx={{ mb: 7 }}>
      {/* ── Section Header Ribbon ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
          pb: 1.5,
          borderBottom: "2px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5}>
          {IconComponent && (
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
              <IconComponent sx={{ fontSize: 22 }} />
            </Box>
          )}
          <Typography
            variant="h4"
            component="h2"
            fontWeight={900}
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontSize: { xs: "1.4rem", sm: "1.8rem" },
            }}
          >
            {displayTitle}
          </Typography>
          <Chip
            label={`${articles.length} Stories`}
            size="small"
            sx={{
              bgcolor: "rgba(192, 57, 43, 0.08)",
              color: "var(--brand-red, #c0392b)",
              fontWeight: 700,
              fontSize: "0.72rem",
              display: { xs: "none", sm: "inline-flex" },
            }}
          />
        </Stack>

        <Button
          component={Link}
          href={categoryLink}
          endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
          sx={{
            color: "var(--brand-red, #c0392b)",
            fontWeight: 700,
            textTransform: "none",
            fontSize: "0.9rem",
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "rgba(192, 57, 43, 0.06)",
              transform: "translateX(2px)",
            },
          }}
        >
          Explore All {category}
        </Button>
      </Box>

      {/* ── Magazine Split Grid ── */}
      <Grid container spacing={{ xs: 2.5, md: 3 }}>
        {/* ── Left: Lead Feature Card ── */}
        <Grid item xs={12} md={stackedArticles.length > 0 ? 7 : 12}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 3.5,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 28px rgba(0,0,0,0.08)",
                borderColor: "rgba(192, 57, 43, 0.25)",
                "& .lead-title": { color: "var(--brand-red, #c0392b)" },
                "& .lead-img": { transform: "scale(1.03)" },
              },
            }}
          >
            <CardActionArea
              component={Link}
              href={articlePath(leadArticle)}
              sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: { xs: 220, sm: 280, md: 320 },
                  overflow: "hidden",
                  bgcolor: "#111",
                }}
              >
                <Image
                  src={leadArticle.thumbnail_url || leadArticle.image_url || "https://picsum.photos/800/500"}
                  alt={leadArticle.title}
                  fill
                  sizes="(max-width: 900px) 100vw, 60vw"
                  style={{ objectFit: "cover", transition: "transform 0.6s ease" }}
                  className="lead-img"
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 14,
                    left: 14,
                    zIndex: 2,
                  }}
                >
                  <CategoryBadge category={leadArticle.category} />
                </Box>
              </Box>

              <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <Typography
                  variant="h5"
                  component="h3"
                  fontWeight={900}
                  className="lead-title"
                  sx={{
                    fontFamily: "'Playfair Display', serif",
                    lineHeight: 1.3,
                    mb: 1.5,
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    transition: "color 0.2s ease",
                  }}
                >
                  {leadArticle.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.7,
                    mb: 2.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {createExcerpt(leadArticle.details, 160)}
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  gap={2}
                  sx={{ mt: "auto", pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}
                >
                  {leadArticle.author?.img ? (
                    <Avatar
                      src={leadArticle.author.img}
                      alt={leadArticle.author?.name || "Author"}
                      sx={{ width: 28, height: 28 }}
                    />
                  ) : (
                    <Avatar sx={{ width: 28, height: 28, bgcolor: "var(--brand-red, #c0392b)", fontSize: "0.75rem" }}>
                      {(leadArticle.author?.name || "B").charAt(0)}
                    </Avatar>
                  )}
                  <Typography variant="caption" fontWeight={700} color="text.primary">
                    {leadArticle.author?.name || "Editorial Team"}
                  </Typography>

                  <Stack direction="row" alignItems="center" gap={0.5} sx={{ ml: "auto" }}>
                    <AccessTimeIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary">
                      {readingTime(leadArticle.details)} min read
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        {/* ── Right: Stacked Compact Stories ── */}
        {stackedArticles.length > 0 && (
          <Grid item xs={12} md={5}>
            <Stack spacing={2} sx={{ height: "100%" }}>
              {stackedArticles.map((article) => (
                <Card
                  key={article.id || article._id}
                  sx={{
                    flex: 1,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.02)",
                    transition: "all 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                      borderColor: "rgba(192, 57, 43, 0.2)",
                      "& .stacked-title": { color: "var(--brand-red, #c0392b)" },
                      "& .stacked-img": { transform: "scale(1.05)" },
                    },
                  }}
                >
                  <CardActionArea
                    component={Link}
                    href={articlePath(article)}
                    sx={{ p: 2, height: "100%", display: "flex", alignItems: "center", gap: 2 }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: { xs: 90, sm: 110 },
                        height: { xs: 75, sm: 85 },
                        borderRadius: 2,
                        overflow: "hidden",
                        flexShrink: 0,
                        bgcolor: "#eee",
                      }}
                    >
                      <Image
                        src={article.thumbnail_url || article.image_url || "https://picsum.photos/300/200"}
                        alt={article.title}
                        fill
                        sizes="120px"
                        style={{ objectFit: "cover", transition: "transform 0.4s ease" }}
                        className="stacked-img"
                      />
                    </Box>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={800}
                        className="stacked-title"
                        sx={{
                          fontFamily: "'Playfair Display', serif",
                          lineHeight: 1.35,
                          fontSize: { xs: "0.92rem", sm: "1rem" },
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          mb: 0.8,
                          transition: "color 0.2s",
                        }}
                      >
                        {article.title}
                      </Typography>

                      <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                        <Stack direction="row" alignItems="center" gap={0.4}>
                          <CalendarTodayIcon sx={{ fontSize: 11, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent"}
                          </Typography>
                        </Stack>

                        <Stack direction="row" alignItems="center" gap={0.4}>
                          <AccessTimeIcon sx={{ fontSize: 11, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                            {readingTime(article.details)} min
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  </CardActionArea>
                </Card>
              ))}
            </Stack>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
