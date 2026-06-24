"use client";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  Avatar,
  Button,
} from "@mui/material";
import SafeImage from "@/components/ui/SafeImage/SafeImage";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarIcon from "@mui/icons-material/Star";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ReadingProgressBar from "@/components/ui/ReadingProgressBar/ReadingProgressBar";
import ShareButtons from "@/components/ui/ShareButtons/ShareButtons";
import VerifiedIcon from "@mui/icons-material/Verified";
import DOMPurify from "isomorphic-dompurify";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// Ensure all links open in a new tab securely
DOMPurify.addHook("afterSanitizeAttributes", function (node) {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

const readingTime = (text = "") =>
  Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));

export default function NewsDetailClient({ news, related }) {
  if (!news) return null;

  return (
    <Box className="fade-in-up" sx={{ mb: 8, mt: { xs: 2, md: 4 } }}>
      <ReadingProgressBar />

      {/* ── Top Bar ── */}
      <Box sx={{ mb: 3 }}>
        <Link href="/">
          <Stack
            direction="row"
            alignItems="center"
            gap={0.6}
            sx={{
              display: "inline-flex",
              color: "text.secondary",
              transition: "color 0.2s",
              "&:hover": { color: "#c0392b" },
            }}
          >
            <ArrowBackIcon fontSize="small" />
            <Typography variant="body2" fontWeight={600}>Back to Home</Typography>
          </Stack>
        </Link>
      </Box>

      {/* ── Hero Banner (Full Width / Bleed) ── */}
      <Box 
        sx={{ 
          position: "relative", 
          width: "100%", 
          height: { xs: 300, sm: 400, md: 500 }, 
          borderRadius: { xs: 2, md: 4 }, 
          overflow: "hidden",
          mb: 5,
          boxShadow: "0 12px 32px rgba(0,0,0,0.1)"
        }}
      >
        <SafeImage
          src={news.thumbnail_url || news.image_url}
          fallback="https://picsum.photos/1200/800"
          fill
          alt={news.title}
          style={{ objectFit: "cover" }}
          priority
          unoptimized
          sizes="(max-width:768px) 100vw, 90vw"
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, transparent 100%)",
          }}
        />
        <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, p: { xs: 3, md: 5 } }}>
          <Chip
            label={news.category}
            size="small"
            sx={{
              mb: 2,
              backgroundColor: "#c0392b",
              color: "white",
              fontWeight: 800,
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              borderRadius: 1,
              px: 1,
            }}
          />
          <Typography
            variant="h1"
            fontWeight={900}
            sx={{
              color: "white",
              fontFamily: "'Playfair Display', serif",
              lineHeight: 1.2,
              textShadow: "0 2px 12px rgba(0,0,0,0.6)",
              fontSize: { xs: "2rem", sm: "2.8rem", md: "3.5rem" },
              maxWidth: 900
            }}
          >
            {news.title}
          </Typography>
        </Box>
      </Box>

      {/* ── Main Layout Grid ── */}
      <Grid container spacing={{ xs: 4, md: 6 }}>
        
        {/* Left Column: Article Content */}
        <Grid item xs={12} md={8}>
          <Box component="article" sx={{ pr: { md: 2 } }}>
            {/* Meta Bar */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              flexWrap="wrap"
              gap={2}
              sx={{ mb: 4, pb: 3, borderBottom: "1px solid", borderColor: "divider" }}
            >
              <Stack direction="row" alignItems="center" gap={1.5}>
                <Link href={`/authors/${encodeURIComponent(news.author?.name)}`}>
                  <Avatar
                    src={news.author?.img}
                    alt={news.author?.name}
                    sx={{ width: 48, height: 48, border: "2px solid", borderColor: "divider", cursor: "pointer", "&:hover": { borderColor: "#c0392b" } }}
                  />
                </Link>
                <Box>
                  <Link href={`/authors/${encodeURIComponent(news.author?.name)}`}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ "&:hover": { color: "#c0392b" } }}>
                      {news.author?.name}
                    </Typography>
                  </Link>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {news.author?.published_date}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" gap={3} flexWrap="wrap">
                <Stack direction="row" alignItems="center" gap={0.75}>
                  <AccessTimeIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {readingTime(news.details || "")} min read
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={0.75}>
                  <VisibilityIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {(news.total_view || 0).toLocaleString()} views
                  </Typography>
                </Stack>
                {news.rating && (
                  <Stack direction="row" alignItems="center" gap={0.75}>
                    <StarIcon fontSize="small" sx={{ color: "#f5a623" }} />
                    <Typography variant="body2" fontWeight={600} color="text.primary">
                      {news.rating.number}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Stack>

            {/* Rich Text Body */}
            <Box sx={{ maxWidth: "100%", overflow: "hidden", wordBreak: "break-word" }}>
              {news.details && news.details.includes("<") && news.details.includes(">") ? (
                <Box
                  className="article-prose"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.details, { ADD_ATTR: ['target'] }) }}
                  sx={{
                    "& img": { borderRadius: 3, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", my: 4 },
                    "& blockquote": { 
                      borderLeft: "4px solid #c0392b", 
                      pl: 3, 
                      py: 1, 
                      my: 4, 
                      bgcolor: "rgba(192,57,43,0.03)", 
                      fontStyle: "italic", 
                      fontSize: "1.2rem",
                      color: "text.primary" 
                    }
                  }}
                />
              ) : (
                <Box className="article-prose legacy-content">
                  {news.details}
                </Box>
              )}
            </Box>

            {/* Sources & Citations */}
            {Array.isArray(news.sources) && news.sources.length > 0 && (
              <Box sx={{ mt: 6, p: 4, borderRadius: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
                  <VerifiedIcon sx={{ fontSize: 20, color: "success.main" }} />
                  <Typography variant="subtitle1" fontWeight={800} sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Sources & Citations
                  </Typography>
                </Stack>
                <Stack spacing={1.5}>
                  {news.sources.map((source, index) => (
                    <Typography key={index} variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <span aria-hidden="true" style={{ color: "#c0392b", fontWeight: 800 }}>•</span>
                      <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ color: "#1e293b", fontWeight: 600, textDecoration: "none", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = '#c0392b'} onMouseOut={e => e.target.style.color = '#1e293b'}>
                        {source.name}
                      </a>
                    </Typography>
                  ))}
                </Stack>
              </Box>
            )}
            
            <Box sx={{ display: { xs: "block", md: "none" }, mt: 4 }}>
              <Divider sx={{ mb: 3 }} />
              <ShareButtons title={news.title} />
            </Box>
          </Box>
        </Grid>

        {/* Right Column: Sticky Sidebar */}
        <Grid item xs={12} md={4}>
          <Box sx={{ position: "sticky", top: 100 }}>
            
            {/* Author Box */}
            <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 4, overflow: "visible" }}>
              <Box sx={{ h: 60, bgcolor: "rgba(192,57,43,0.05)", borderBottom: "1px solid", borderColor: "divider", p: 2 }}>
                <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.1em" }}>Written By</Typography>
              </Box>
              <CardContent sx={{ pt: 4, px: 3, pb: 3, position: "relative" }}>
                <Link href={`/authors/${encodeURIComponent(news.author?.name)}`}>
                  <Avatar
                    src={news.author?.img}
                    alt={news.author?.name}
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
                <Link href={`/authors/${encodeURIComponent(news.author?.name)}`}>
                  <Typography variant="h6" fontWeight={800} sx={{ mt: 2, mb: 1, fontFamily: "'Playfair Display', serif", "&:hover": { color: "#c0392b" } }}>
                    {news.author?.name}
                  </Typography>
                </Link>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                  Contributor at The Brain. Covering topics in {news.category} and bringing insightful analysis to our readers.
                </Typography>
                <Link href={`/authors/${encodeURIComponent(news.author?.name)}`}>
                  <Button variant="outlined" color="error" fullWidth sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}>
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Share Buttons (Desktop) */}
            <Box sx={{ display: { xs: "none", md: "block" }, mb: 4 }}>
              <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.1em", display: "block", mb: 2 }}>Share Article</Typography>
              <ShareButtons title={news.title} />
            </Box>

            {/* Related Articles */}
            {related.length > 0 && (
              <Box>
                <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.1em", display: "block", mb: 2 }}>Related Reads</Typography>
                <Stack spacing={3}>
                  {related.map((rel) => (
                    <Link key={rel.id || rel._id} href={`/news/${rel.id || rel._id}`}>
                      <Stack direction="row" gap={2} sx={{ 
                        group: true, 
                        cursor: "pointer",
                        "&:hover .rel-title": { color: "#c0392b" },
                        "&:hover .rel-img": { transform: "scale(1.08)" }
                      }}>
                        <Box sx={{ width: 100, height: 75, flexShrink: 0, borderRadius: 2, overflow: "hidden", position: "relative" }}>
                          <SafeImage
                            className="rel-img"
                            src={rel.thumbnail_url || rel.image_url}
                            fallback="https://picsum.photos/400/300"
                            fill
                            unoptimized
                            alt={rel.title}
                            sizes="100px"
                            style={{ objectFit: "cover", transition: "transform 0.4s ease" }}
                          />
                        </Box>
                        <Box>
                          <Typography
                            className="rel-title"
                            variant="subtitle2"
                            fontWeight={800}
                            sx={{
                              fontFamily: "'Playfair Display', serif",
                              lineHeight: 1.3,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              transition: "color 0.2s",
                              mb: 0.5
                            }}
                          >
                            {rel.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {rel.author?.published_date}
                          </Typography>
                        </Box>
                      </Stack>
                    </Link>
                  ))}
                </Stack>
              </Box>
            )}

          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
