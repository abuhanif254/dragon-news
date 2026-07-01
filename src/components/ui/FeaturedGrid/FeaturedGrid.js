import React from "react";
import { Grid, Box, Typography } from "@mui/material";
import ArticleCard from "../ArticleCard/ArticleCard";
import WhatshotIcon from '@mui/icons-material/Whatshot';

export default function FeaturedGrid({ articles = [], title = "Featured Stories" }) {
  if (!articles || articles.length === 0) return null;

  return (
    <Box sx={{ mb: 8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, pb: 2, borderBottom: '2px solid', borderColor: 'divider' }}>
        <WhatshotIcon sx={{ color: 'var(--brand-red)', mr: 1.5, fontSize: 32 }} />
        <Typography variant="h4" component="h2" fontWeight={900} sx={{ fontFamily: "'Playfair Display', serif" }}>
          {title}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {articles.map((article, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={article.id || article._id}>
            <ArticleCard article={article} priority={index < 4} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
