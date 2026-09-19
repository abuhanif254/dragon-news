import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@mui/material";

import topNews from "@/assets/top-news.png";
import topNews2 from "@/assets/top-news2.png";
import Image from "next/image";
import { getAllNews } from "@/utils/getAllNews";
import { createExcerpt } from "@/lib/content-utils";
import CategoryBadge from "../CategoryBadge/CategoryBadge";
import Link from "next/link";
import { articlePath } from "@/lib/site";

const LatestNews = ({ allNews: data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <Box className="my-5" textAlign="center" py={5}>
        <Typography variant="body1" color="text.secondary">
          No articles published yet. Check back soon!
        </Typography>
      </Box>
    );
  }

  const mainNews = data[0];

  return (
    <Box className="my-5">
      <Link href={articlePath(mainNews)} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Card sx={{ borderRadius: 3, overflow: 'hidden', transition: '0.3s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
          <CardActionArea>
            <CardMedia sx={{ position: 'relative', height: 450, overflow: 'hidden' }}>
              <Image
                src={mainNews.thumbnail_url}
                fill
                alt={mainNews.title}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                style={{ objectFit: 'cover' }}
              />
            </CardMedia>
            <CardContent sx={{ p: 3 }}>
              <CategoryBadge category={mainNews.category} />
              <Typography gutterBottom variant="h4" fontWeight={800} sx={{ mt: 1, fontFamily: "'Playfair Display', serif" }}>
                {mainNews.title}
              </Typography>
              <Typography gutterBottom variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                By {mainNews.author?.name} - {mainNews.author?.published_date}
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {createExcerpt(mainNews.details, 250)}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Link>

      <Grid
        className="mt-5"
        container
        spacing={3}
      >
        {data.slice(1, 5).map((news) => (
          <Grid key={news.id || news._id} item xs={12} md={6}>
            <Link href={articlePath(news)} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Card sx={{ borderRadius: 2.5, transition: '0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardActionArea>
                  <CardMedia sx={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                    <Image
                      src={news.thumbnail_url}
                      fill
                      alt={news.title}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 400px"
                      style={{ objectFit: 'cover' }}
                    />
                  </CardMedia>
                  <CardContent>
                    <CategoryBadge category={news.category} />
                    <Typography gutterBottom variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                      {news.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      By {news.author?.name} - {news.author?.published_date}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {createExcerpt(news.details, 120)}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LatestNews;
