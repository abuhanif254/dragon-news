"use client";
import React from "react";
import { Card, CardContent, Box, Typography, Avatar, Button, Stack, IconButton } from "@mui/material";
import Link from "next/link";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import ArticleIcon from "@mui/icons-material/Article";

export default function AuthorCard({ author, category }) {
  if (!author) return null;

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 4, overflow: "visible" }}>
      <Box sx={{ height: 60, bgcolor: "rgba(192,57,43,0.05)", borderBottom: "1px solid", borderColor: "divider", p: 2 }}>
        <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.1em" }}>
          Written By
        </Typography>
      </Box>
      <CardContent sx={{ pt: 4, px: 3, pb: 3, position: "relative" }}>
        <Link href={`/authors/${encodeURIComponent(author.name)}`}>
          <Avatar
            src={author.img}
            alt={author.name}
            sx={{ 
              width: 72, height: 72, 
              border: "4px solid", borderColor: "background.paper", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              position: "absolute", top: -36, left: 24,
              cursor: "pointer", transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.05)" }
            }}
          />
        </Link>
        <Link href={`/authors/${encodeURIComponent(author.name)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h6" fontWeight={800} sx={{ mt: 2, mb: 1, fontFamily: "'Playfair Display', serif", "&:hover": { color: "#c0392b" } }}>
            {author.name}
          </Typography>
        </Link>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
          {author.bio || `Contributor at The Brain. Covering topics in ${category} and bringing insightful analysis to our readers.`}
        </Typography>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Stack direction="row" gap={1}>
            {author.social?.twitter && (
              <IconButton size="small" component="a" href={author.social.twitter} target="_blank" sx={{ color: "#1DA1F2", bgcolor: "rgba(29,161,242,0.1)" }}>
                <TwitterIcon fontSize="small" />
              </IconButton>
            )}
            {author.social?.linkedin && (
              <IconButton size="small" component="a" href={author.social.linkedin} target="_blank" sx={{ color: "#0A66C2", bgcolor: "rgba(10,102,194,0.1)" }}>
                <LinkedInIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
          
          <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: "text.secondary" }}>
            <ArticleIcon fontSize="small" />
            <Typography variant="caption" fontWeight={700}>
              {author.articleCount || "15+"} Articles
            </Typography>
          </Stack>
        </Stack>

        <Link href={`/authors/${encodeURIComponent(author.name)}`} style={{ textDecoration: 'none' }}>
          <Button variant="outlined" color="error" fullWidth sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}>
            View Profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
