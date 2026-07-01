import React, { useState, useEffect } from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Stack,
  Avatar,
  IconButton,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { createExcerpt } from "@/lib/content-utils";
import CategoryBadge from "../CategoryBadge/CategoryBadge";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import { subscribeToAuth } from "@/lib/auth-service";

export default function ArticleCard({ article, layout = "vertical", showExcerpt = true, searchQuery = "", priority = false }) {
  const [user, setUser] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (u) => {
      setUser(u);
      if (u) {
        try {
          const { getUserBookmarks } = await import("@/lib/firestore");
          const bookmarks = await getUserBookmarks(u.uid);
          setIsBookmarked(bookmarks.includes(article.id || article._id));
        } catch (err) {
          console.error("Error reading bookmarks in card:", err);
        }
      } else {
        setIsBookmarked(false);
      }
    });
    return () => unsubscribe();
  }, [article.id, article._id]);

  const handleBookmarkToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setBookmarkLoading(true);
    try {
      const { toggleBookmark } = await import("@/lib/firestore");
      const bookmarked = await toggleBookmark(user.uid, article.id || article._id);
      setIsBookmarked(bookmarked);
    } catch (err) {
      console.error("Error toggling bookmark on card:", err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (!article) return null;

  const highlightText = (text = "", query = "") => {
    if (!query.trim()) return text;
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, index) => 
          regex.test(part) ? (
            <mark key={index} style={{ backgroundColor: "rgba(241, 196, 15, 0.35)", color: "inherit", fontWeight: 800, borderRadius: "2px", padding: "0 1px" }}>
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const readTime = Math.max(1, Math.ceil(((article.details || "").length) / 1000));
  const isHorizontal = layout === "horizontal";

  return (
    <Link href={`/news/${article.id || article._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
      <Card 
        className="news-card" 
        sx={{ 
          position: 'relative',
          borderRadius: 3, 
          height: '100%', 
          display: 'flex', 
          flexDirection: isHorizontal ? { xs: 'column', sm: 'row' } : 'column',
          bgcolor: 'background.paper',
        }}
      >
        <IconButton
          onClick={handleBookmarkToggle}
          disabled={bookmarkLoading}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            color: isBookmarked ? 'var(--brand-red)' : 'rgba(0, 0, 0, 0.54)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              transform: 'scale(1.1)',
              color: 'var(--brand-red)',
            }
          }}
        >
          {isBookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
        </IconButton>
        <CardActionArea sx={{ display: 'flex', flexDirection: isHorizontal ? { xs: 'column', sm: 'row' } : 'column', height: '100%', alignItems: 'stretch' }}>
          <Box sx={{ 
            position: 'relative', 
            width: isHorizontal ? { xs: '100%', sm: '40%' } : '100%', 
            flex: isHorizontal ? 'none' : 1,
            minHeight: isHorizontal ? { xs: 200, sm: 'auto' } : 240,
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            <Image
              src={article.thumbnail_url || "https://picsum.photos/600/400"}
              alt={article.title}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
              className="card-image"
            />
            {!isHorizontal && (
              <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>
                <CategoryBadge category={article.category} />
              </Box>
            )}
          </Box>
          
          <CardContent sx={{ flex: isHorizontal ? 1 : 'none', display: 'flex', flexDirection: 'column', p: 3, justifyContent: 'space-between' }}>
            <Box>
              {isHorizontal && (
                <Box sx={{ mb: 1.5 }}>
                  <CategoryBadge category={article.category} />
                </Box>
              )}
              <Typography 
                variant="h5" 
                component="h2"
                fontWeight={800} 
                sx={{ 
                  fontFamily: "'Playfair Display', serif", 
                  mb: 1.5,
                  display: "-webkit-box",
                  WebkitLineClamp: isHorizontal ? 3 : 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.3
                }}
              >
                {highlightText(article.title, searchQuery)}
              </Typography>
              
              {showExcerpt && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.6
                  }}
                >
                  {highlightText(createExcerpt(article.details, 120), searchQuery)}
                </Typography>
              )}
            </Box>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar src={article.author?.image} sx={{ width: 28, height: 28 }} />
                <Typography variant="caption" fontWeight={600} color="text.primary">
                  {article.author?.name || "The Brain"}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5} color="text.secondary">
                <AccessTimeIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption" fontWeight={500}>{readTime} min</Typography>
              </Stack>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    </Link>
  );
}
