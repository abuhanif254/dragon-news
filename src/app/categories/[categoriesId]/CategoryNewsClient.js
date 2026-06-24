"use client";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import CategoryBadge from "@/components/ui/CategoryBadge/CategoryBadge";

export default function CategoryNewsClient({ data, category }) {
  return (
    <Box className="my-5">
      <Typography variant="h4" fontWeight={800} sx={{ mb: 4, textTransform: 'capitalize' }}>
        Total <span style={{ color: '#c0392b' }}>{category.replace('-', ' ')}</span> news: {data.length}
      </Typography>

      <Grid container spacing={3}>
        {data.map((news, index) => (
          <Grid key={news.id || news._id} item xs={12} md={6}>
            <Link href={`/news/${news.id || news._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Card sx={{ height: '100%', borderRadius: 3, transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                <CardActionArea>
                  <CardMedia sx={{ position: 'relative', height: 240, overflow: 'hidden' }}>
                    <Image
                      src={news.thumbnail_url}
                      fill
                      alt={news.title}
                      sizes="(max-width: 768px) 100vw, 400px"
                      style={{ objectFit: 'cover' }}
                      priority={index < 2}
                    />
                  </CardMedia>
                  <CardContent sx={{ p: 2.5 }}>
                    <CategoryBadge category={news.category} />
                    <Typography gutterBottom variant="h6" fontWeight={700} sx={{ mt: 1, lineHeight: 1.3 }}>
                      {news.title.length > 60
                        ? news.title.slice(0, 60) + "..."
                        : news.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      By {news.author?.name} - {news.author?.published_date}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {news.details}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Link>
          </Grid>
        ))}
        {data.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ p: 5, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 4 }}>
              <Typography variant="h6" color="text.secondary">No news found in this category.</Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
