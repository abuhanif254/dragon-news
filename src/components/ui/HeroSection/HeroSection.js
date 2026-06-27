import React from "react";
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Stack,
  CardActionArea,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { createExcerpt } from "@/lib/content-utils";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

/**
 * Premium Hero Section for the most important featured article
 */
export default function HeroSection({ article }) {
  if (!article) return null;

  return (
    <Box sx={{ position: "relative", mb: 6, borderRadius: 4, overflow: "hidden", height: { xs: 450, md: 600 } }}>
      <Link href={`/news/${article.id || article._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
        <CardActionArea sx={{ height: "100%", width: "100%" }}>
          <Image
            src={article.image_url || article.thumbnail_url || "https://picsum.photos/1200/800"}
            alt={article.title}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", transition: "transform 0.7s ease" }}
            className="hero-image"
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              p: { xs: 3, md: 6 },
            }}
          >
            <Box sx={{ maxWidth: 900 }}>
              <Chip
                label={article.category}
                sx={{
                  bgcolor: "var(--brand-red)",
                  color: "white",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  borderRadius: 1,
                  mb: 2,
                }}
              />
              
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  color: "white",
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 900,
                  fontSize: { xs: "2rem", md: "3.5rem" },
                  lineHeight: 1.1,
                  mb: 2,
                  textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                }}
              >
                {article.title}
              </Typography>
              
              <Typography
                variant="h6"
                sx={{
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 400,
                  mb: 3,
                  display: { xs: "none", md: "-webkit-box" },
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {createExcerpt(article.details, 200)}
              </Typography>

              <Stack direction="row" alignItems="center" spacing={2} sx={{ color: "rgba(255,255,255,0.9)" }}>
                <Avatar 
                  src={article.author?.image} 
                  sx={{ width: 40, height: 40, border: "2px solid rgba(255,255,255,0.2)" }} 
                />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {article.author?.name || "Editorial Team"}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ opacity: 0.8 }}>
                    <Typography variant="caption">
                      {article.author?.published_date || article.publishedAt}
                    </Typography>
                    <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "currentColor" }} />
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <AccessTimeIcon sx={{ fontSize: 14 }} />
                      <Typography variant="caption">
                        {Math.max(1, Math.ceil(((article.details || "").length) / 1000))} min read
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Box>
        </CardActionArea>
      </Link>
    </Box>
  );
}
