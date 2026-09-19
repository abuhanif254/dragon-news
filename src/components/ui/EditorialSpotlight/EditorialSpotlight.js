"use client";
import React from "react";
import {
  Box,
  Typography,
  Grid,
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
import VerifiedIcon from "@mui/icons-material/Verified";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CategoryBadge from "../CategoryBadge/CategoryBadge";
import { articlePath } from "@/lib/site";
import { createExcerpt } from "@/lib/content-utils";

const readingTime = (text = "") => {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

export default function EditorialSpotlight({ article }) {
  if (!article) return null;

  const rTime = readingTime(article.details || "");
  const targetUrl = articlePath(article);

  // Extract up to 2 key sentences or structured takeaways from details
  const cleanDetails = (article.details || "").replace(/<[^>]+>/g, " ").trim();
  const sentences = cleanDetails.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 25);
  const takeaways = sentences.slice(1, 3);

  return (
    <Box
      sx={{
        my: 6,
        borderRadius: { xs: 3, md: 4 },
        overflow: "hidden",
        position: "relative",
        background: "linear-gradient(135deg, #0a0a14 0%, #131325 50%, #1a0f1d 100%)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 16px 48px rgba(0, 0, 0, 0.35)",
        p: { xs: 3, sm: 4, md: 5 },
      }}
    >
      {/* ── Top Header Ribbon ── */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1.5}
        sx={{ mb: 3.5, pb: 2, borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}
      >
        <Stack direction="row" alignItems="center" gap={1.2}>
          <Chip
            label="★ SPECIAL INVESTIGATION"
            size="small"
            sx={{
              background: "linear-gradient(135deg, #c0392b, #e74c3c)",
              color: "white",
              fontWeight: 800,
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              borderRadius: 1.5,
              px: 0.5,
            }}
          />
          <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.6)", fontWeight: 600 }}>
            Curated Deep Dive
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" gap={1}>
          <AccessTimeIcon sx={{ fontSize: 13, color: "rgba(255, 255, 255, 0.5)" }} />
          <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)", fontWeight: 700 }}>
            {rTime} min in-depth read
          </Typography>
        </Stack>
      </Stack>

      {/* ── 2-Column Split Feature ── */}
      <Grid container spacing={{ xs: 3, md: 5 }} alignItems="center">
        {/* Left Column: Visual Cover */}
        <Grid item xs={12} md={6}>
          <Link href={targetUrl} style={{ textDecoration: "none", display: "block" }}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: { xs: 240, sm: 320, md: 380 },
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                cursor: "pointer",
                "&:hover .spotlight-img": { transform: "scale(1.04)" },
              }}
            >
              <Image
                src={article.image_url || article.thumbnail_url || "https://picsum.photos/1000/650"}
                alt={article.title}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 50vw"
                style={{ objectFit: "cover", transition: "transform 0.6s ease" }}
                className="spotlight-img"
              />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
                }}
              />
              <Box sx={{ position: "absolute", top: 16, left: 16 }}>
                <CategoryBadge category={article.category} />
              </Box>
            </Box>
          </Link>
        </Grid>

        {/* Right Column: Editorial Takeaways & Action */}
        <Grid item xs={12} md={6}>
          <Stack spacing={2.5}>
            <Link href={targetUrl} style={{ textDecoration: "none", color: "inherit" }}>
              <Typography
                variant="h3"
                component="h2"
                fontWeight={900}
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  color: "white",
                  fontSize: { xs: "1.5rem", sm: "1.85rem", md: "2.15rem" },
                  lineHeight: 1.25,
                  transition: "color 0.2s ease",
                  "&:hover": { color: "#ff7675" },
                }}
              >
                {article.title}
              </Typography>
            </Link>

            <Typography
              variant="body1"
              sx={{
                color: "rgba(255, 255, 255, 0.72)",
                lineHeight: 1.7,
                fontSize: "0.98rem",
              }}
            >
              {createExcerpt(article.details, 180)}
            </Typography>

            {/* Structured Key Takeaways */}
            {takeaways.length > 0 && (
              <Stack spacing={1} sx={{ pt: 0.5 }}>
                {takeaways.map((takeaway, idx) => (
                  <Stack key={idx} direction="row" alignItems="flex-start" gap={1.2}>
                    <CheckCircleOutlineIcon sx={{ color: "#e74c3c", fontSize: 18, mt: 0.3, flexShrink: 0 }} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255, 255, 255, 0.8)",
                        lineHeight: 1.5,
                        fontSize: "0.82rem",
                        fontWeight: 500,
                      }}
                    >
                      {takeaway}.
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}

            {/* Author Credential & Call to Action Button */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
                pt: 2,
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <Stack direction="row" alignItems="center" gap={1.5}>
                {article.author?.img ? (
                  <Avatar src={article.author.img} sx={{ width: 38, height: 38, border: "2px solid rgba(255,255,255,0.2)" }} />
                ) : (
                  <Avatar sx={{ width: 38, height: 38, bgcolor: "#c0392b", fontWeight: 800 }}>
                    {(article.author?.name || "B").charAt(0)}
                  </Avatar>
                )}
                <Box>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: "white" }}>
                      {article.author?.name || "The Brain Editorial Team"}
                    </Typography>
                    <VerifiedIcon sx={{ color: "#3498db", fontSize: 16 }} />
                  </Stack>
                  <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.5)", display: "block" }}>
                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent Publication"}
                  </Typography>
                </Box>
              </Stack>

              <Button
                component={Link}
                href={targetUrl}
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  background: "linear-gradient(135deg, #c0392b, #e74c3c)",
                  color: "white",
                  fontWeight: 800,
                  px: 3,
                  py: 1.1,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontSize: "0.92rem",
                  boxShadow: "0 4px 18px rgba(192, 57, 43, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #96281b, #c0392b)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 24px rgba(192, 57, 43, 0.5)",
                  },
                }}
              >
                Read Full Investigation
              </Button>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
