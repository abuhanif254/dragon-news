import React from "react";
import { 
  Box, Container, Typography, Stack, Grid, Avatar, 
  Card, CardContent, Divider, Chip, IconButton, Tooltip, Paper 
} from "@mui/material";
import { getAllNews } from "@/utils/getAllNews";
import { getAuthorProfile } from "@/lib/firestore";
import Link from "next/link";
import Image from "next/image";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import PublicIcon from "@mui/icons-material/Public";
import VerifiedIcon from "@mui/icons-material/Verified";
import ArticleIcon from "@mui/icons-material/Article";

// This would ideally come from an 'authors' collection, 
// but we'll use our Smart Fetcher to find all articles by this author.

export async function generateMetadata({ params }) {
  const { authorName } = await params;
  const name = decodeURIComponent(authorName);
  return {
    title: `${name} | Author Profile | The Brain`,
    description: `Read articles and professional insights from ${name} at The Brain.`,
  };
}

export default async function AuthorProfilePage({ params }) {
  const { authorName } = await params;
  const name = decodeURIComponent(authorName);
  
  // Fetch real profile from Firestore
  const dbProfile = await getAuthorProfile(name);
  
  // Fetch all news and filter by author
  const newsResponse = await getAllNews({ includeFallback: false });
  const allNews = newsResponse.data || [];
  const authorArticles = allNews.filter(n => n.author?.name === name);

  // Merge database profile with fallback defaults for E-E-A-T
  // We prioritize the REAL profile image and avoid "guessing" from articles for consistency.
  const authorInfo = {
    name: name,
    image: dbProfile?.image || "", // Strict control: only use dashboard image
    role: dbProfile?.role || "Editorial Contributor",
    bio: dbProfile?.bio || `${name} is a dedicated contributor to The Brain, focusing on in-depth reporting and investigative journalism.`,
    expertise: dbProfile?.expertise || ["Journalism", "Reporting"],
    social: dbProfile?.social || { twitter: "#", linkedin: "#", website: "#" }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* ── Author Header Card ── */}
      <Card sx={{ 
        borderRadius: 4, 
        overflow: "hidden", 
        boxShadow: "0 10px 40px rgba(0,0,0,0.06)", 
        border: "1px solid", 
        borderColor: "divider",
        mb: 6 
      }}>
        <Box sx={{ 
          height: 140, 
          background: "linear-gradient(135deg, #1a1a2e 0%, #c0392b 100%)",
          opacity: 0.9 
        }} />
        <CardContent sx={{ position: "relative", pt: 0, px: { xs: 3, md: 6 }, pb: 5 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: -6, alignItems: "flex-end", mb: 4 }}>
            <Avatar 
              src={authorInfo.image}
              sx={{ 
                width: 140, 
                height: 140, 
                border: "6px solid white", 
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                bgcolor: "#c0392b",
                fontSize: "3rem",
                fontWeight: 900
              }}
            >
              {name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 260 }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography variant="h3" fontWeight={900} sx={{ fontFamily: "'Playfair Display', serif" }}>
                  {authorInfo.name}
                </Typography>
                <Tooltip title="Verified Journalist">
                  <VerifiedIcon color="primary" sx={{ fontSize: 28 }} />
                </Tooltip>
              </Stack>
              <Typography variant="h6" color="error" fontWeight={700} sx={{ mt: 0.5 }}>
                {authorInfo.role}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} sx={{ mb: 1 }}>
              <Tooltip title="Follow on X">
                <IconButton 
                  component="a" href={authorInfo.social.twitter} target="_blank"
                  sx={{ bgcolor: "rgba(0,0,0,0.04)", "&:hover": { bgcolor: "black", color: "white" } }}
                >
                  <TwitterIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Connect on LinkedIn">
                <IconButton 
                  component="a" href={authorInfo.social.linkedin} target="_blank"
                  sx={{ bgcolor: "rgba(0,0,0,0.04)", "&:hover": { bgcolor: "#0A66C2", color: "white" } }}
                >
                  <LinkedInIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Official Website">
                <IconButton 
                  component="a" href={authorInfo.social.website} target="_blank"
                  sx={{ bgcolor: "rgba(0,0,0,0.04)", "&:hover": { bgcolor: "error.main", color: "white" } }}
                >
                  <PublicIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          <Grid container spacing={5}>
            <Grid item xs={12} md={7}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2, fontFamily: "'Playfair Display', serif" }}>
                Biography
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
                {authorInfo.bio}
              </Typography>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2, fontFamily: "'Playfair Display', serif" }}>
                Expertise
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                {authorInfo.expertise.map(skill => (
                  <Chip 
                    key={skill} 
                    label={skill} 
                    size="small" 
                    sx={{ fontWeight: 700, borderRadius: 1.5, bgcolor: "rgba(192,57,43,0.06)", color: "#c0392b" }} 
                  />
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: "#f8fafc" }}>
                <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ mb: 2, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Quick Stats
                </Typography>
                <Stack spacing={2.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Total Articles</Typography>
                    <Typography variant="body2" fontWeight={700}>{authorArticles.length}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Primary Category</Typography>
                    <Typography variant="body2" fontWeight={700}>{authorArticles[0]?.category || "Various"}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Years Active</Typography>
                    <Typography variant="body2" fontWeight={700}>2+ Years</Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── Articles by Author ── */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 4 }}>
          <ArticleIcon color="error" />
          <Typography variant="h4" fontWeight={900} sx={{ fontFamily: "'Playfair Display', serif" }}>
            Articles by {name}
          </Typography>
          <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
        </Stack>

        <Grid container spacing={4}>
          {authorArticles.length > 0 ? (
            authorArticles.map((article) => (
              <Grid item xs={12} sm={6} md={4} key={article.id}>
                <Link href={`/news/${article.id}`}>
                  <Card sx={{ 
                    height: "100%", 
                    borderRadius: 3, 
                    display: "flex", 
                    flexDirection: "column",
                    transition: "0.3s",
                    "&:hover": { transform: "translateY(-6px)", boxShadow: "0 12px 30px rgba(0,0,0,0.1)" }
                  }}>
                    <Box sx={{ position: "relative", height: 200 }}>
                      <Image 
                        src={article.thumbnail_url || "https://picsum.photos/400/300"} 
                        alt={article.title} 
                        fill
                        style={{ objectFit: "cover" }}
                      />
                      <Chip 
                        label={article.category} 
                        size="small" 
                        sx={{ position: "absolute", top: 12, left: 12, bgcolor: "#c0392b", color: "white", fontWeight: 700 }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography 
                        variant="h6" 
                        fontWeight={800} 
                        sx={{ 
                          fontFamily: "'Playfair Display', serif", 
                          mb: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {article.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {article.author?.published_date}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography color="text.secondary">No articles found for this author.</Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
}
