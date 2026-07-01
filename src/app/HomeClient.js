"use client";
import React from "react";
import SideBar from "@/components/ui/SideBar/SideBar";
import NewsTicker from "@/components/ui/NewsTicker/NewsTicker";
import SearchBox from "@/components/ui/SearchBox/SearchBox";
import TrendingTopics from "@/components/ui/TrendingTopics/TrendingTopics";
import HeroSection from "@/components/ui/HeroSection/HeroSection";
import FeaturedGrid from "@/components/ui/FeaturedGrid/FeaturedGrid";
import ArticleCard from "@/components/ui/ArticleCard/ArticleCard";
import { Grid, Box, Alert, AlertTitle, Typography, Button, Container, Stack } from "@mui/material";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import WhatshotIcon from '@mui/icons-material/Whatshot';

export default function HomeClient({ allNews, error }) {
  if (error) {
    return (
      <Box sx={{ my: 10, display: 'flex', justifyContent: 'center' }}>
        <Alert 
          severity="error" 
          icon={<WifiOffIcon fontSize="inherit" />}
          sx={{ maxWidth: 600, borderRadius: 3, p: 3, boxShadow: '0 4px 20px rgba(192,57,43,0.1)' }}
        >
          <AlertTitle sx={{ fontWeight: 800, fontSize: '1.2rem' }}>Database Connection Error</AlertTitle>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
            The Brain was unable to reach the Cloud Firestore backend. This is usually caused by a network block, VPN, or firewall on your local machine.
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mb: 2, fontFamily: 'monospace', p: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
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

  // Distribute articles: Top 4 go to the featured grid, the rest flow into the recent feed.
  // This prevents the recent feed from being empty when there are fewer than 9 articles.
  const topStories = allNews.slice(0, 4); 
  const recentStories = allNews.slice(4, 20);

  return (
    <Box>
      <Box className="fade-in-up" sx={{ animationDelay: '0.1s' }}>
        <NewsTicker allNews={allNews} />
      </Box>

      {/* Magazine Grid */}
      <Box className="fade-in-up" sx={{ animationDelay: '0.5s', mt: 6 }}>
        <FeaturedGrid articles={topStories} title="Top Stories" />
      </Box>

      {/* Two Column Layout for Recent News & Sidebar */}
      <Grid container spacing={5} sx={{ mt: 4 }} className="fade-in-up" style={{ animationDelay: '0.6s' }}>
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, pb: 2, borderBottom: '2px solid', borderColor: 'divider' }}>
            <WhatshotIcon sx={{ color: 'var(--brand-red)', mr: 1.5, fontSize: 32 }} />
            <Typography variant="h4" component="h2" fontWeight={900} sx={{ fontFamily: "'Playfair Display', serif" }}>
              Recent News
            </Typography>
          </Box>
          <Stack spacing={4}>
            {recentStories.map((article) => (
              <ArticleCard key={article.id || article._id} article={article} layout="horizontal" />
            ))}
          </Stack>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <SideBar allNews={allNews} />
        </Grid>
      </Grid>
    </Box>
  );
}
