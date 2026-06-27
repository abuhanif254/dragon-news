"use client";
import React from "react";
import { Box, Typography, Grid, Card, CardContent, Chip, Stack } from "@mui/material";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage/SafeImage";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VisibilityIcon from "@mui/icons-material/Visibility";

export default function RelatedArticles({ related }) {
  if (!related || related.length === 0) return null;

  const getReadingTime = (text = "") => {
    return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="overline"
        fontWeight={900}
        sx={{
          letterSpacing: "0.15em",
          display: "block",
          mb: 3,
          color: "var(--brand-red)",
          fontSize: "0.75rem",
        }}
      >
        Related Reads
      </Typography>

      <Grid container spacing={3}>
        {related.map((rel) => {
          const rTime = getReadingTime(rel.details || "");
          return (
            <Grid item xs={12} sm={6} md={4} key={rel.id || rel._id}>
              <Link href={`/news/${rel.id || rel._id}`} style={{ textDecoration: "none" }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
                      borderColor: "rgba(192, 57, 43, 0.2)",
                      "& .rel-title": { color: "#c0392b" },
                      "& .rel-img": { transform: "scale(1.05)" }
                    }
                  }}
                >
                  {/* Thumbnail Image */}
                  <Box sx={{ width: "100%", height: 160, overflow: "hidden", position: "relative" }}>
                    <SafeImage
                      className="rel-img"
                      src={rel.thumbnail_url || rel.image_url}
                      fallback="https://picsum.photos/400/300"
                      fill
                      unoptimized
                      alt={rel.title}
                      sizes="(max-width: 600px) 100vw, 30vw"
                      style={{ objectFit: "cover", transition: "transform 0.4s ease" }}
                    />
                    <Chip
                      label={rel.category}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        fontWeight: 800,
                        fontSize: "0.65rem",
                        bgcolor: "rgba(255, 255, 255, 0.9)",
                        color: "#c0392b",
                        backdropFilter: "blur(4px)",
                        border: "1px solid rgba(0,0,0,0.05)"
                      }}
                    />
                  </Box>

                  {/* Card Content */}
                  <CardContent sx={{ p: 2.5, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Typography
                      className="rel-title"
                      variant="subtitle1"
                      fontWeight={800}
                      sx={{
                        fontFamily: "'Playfair Display', serif",
                        lineHeight: 1.4,
                        color: "text.primary",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        transition: "color 0.2s",
                        mb: 2,
                        flexGrow: 1
                      }}
                    >
                      {rel.title}
                    </Typography>

                    {/* Metadata stack */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        By {rel.author?.name || "Editorial"}
                      </Typography>
                      <Stack direction="row" spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <AccessTimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            {rTime}m
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <VisibilityIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            {rel.total_view || 0}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
