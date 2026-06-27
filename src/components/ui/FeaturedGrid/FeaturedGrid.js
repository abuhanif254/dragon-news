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
        {/* Large featured article on the left */}
        <Grid item xs={12} md={7} lg={8}>
          <ArticleCard article={articles[0]} />
        </Grid>
        
        {/* Two smaller articles stacked on the right */}
        <Grid item xs={12} md={5} lg={4}>
          <Grid container spacing={4} sx={{ height: '100%' }}>
            {articles.slice(1, 3).map((article) => (
              <Grid item xs={12} sm={6} md={12} key={article.id || article._id} sx={{ height: { md: '50%' } }}>
                <Box sx={{ height: '100%', pb: { md: 2 } }}>
                  <ArticleCard article={article} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Bottom row of 3 or 4 cards */}
        {articles.length > 3 && (
          <Grid item xs={12}>
            <Grid container spacing={4} sx={{ mt: 0 }}>
              {articles.slice(3, 7).map((article) => (
                <Grid item xs={12} sm={6} md={3} key={article.id || article._id}>
                  <ArticleCard article={article} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
