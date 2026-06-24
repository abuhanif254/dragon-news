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
    <Box className="fade-in-up" sx={{ my: 4 }}>
      <ReadingProgressBar />

      {/* ── Back link ── */}
      <Link href="/">
        <Stack
          direction="row"
          alignItems="center"
          gap={0.6}
          sx={{
            mb: 3,
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

      {/* ── Hero ── */}
      <Card sx={{ borderRadius: 3, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
        <Box sx={{ position: "relative", width: "100%", height: { xs: 240, sm: 360, md: 480 } }}>
          <SafeImage
            src={news.thumbnail_url || news.image_url}
            fallback="https://picsum.photos/1200/800"
            fill
            alt={news.title}
            style={{ objectFit: "cover" }}
            priority
            unoptimized
            sizes="(max-width:768px) 100vw, 80vw"
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)",
            }}
          />
          <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, p: { xs: 2.5, md: 4 } }}>
            <Chip
              label={news.category}
              size="small"
              sx={{
                mb: 1.5,
                backgroundColor: "#c0392b",
                color: "white",
                fontWeight: 700,
                fontSize: "0.7rem",
                letterSpacing: "0.06em",
                borderRadius: 1,
              }}
            />
            <Typography
              variant="h3"
              fontWeight={900}
              sx={{
                color: "white",
                fontFamily: "'Playfair Display', serif",
                lineHeight: 1.25,
                textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
              }}
            >
              {news.title}
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ px: { xs: 2.5, md: 5 }, py: 3.5 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            flexWrap="wrap"
            gap={2}
            sx={{ mb: 2.5 }}
          >
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Link href={`/authors/${encodeURIComponent(news.author?.name)}`}>
                <Avatar
                  src={news.author?.img}
                  alt={news.author?.name}
                  sx={{ width: 44, height: 44, border: "2px solid", borderColor: "divider", cursor: "pointer", "&:hover": { borderColor: "#c0392b" } }}
                />
              </Link>
              <Box>
                <Link href={`/authors/${encodeURIComponent(news.author?.name)}`}>
                  <Typography variant="body2" fontWeight={700} sx={{ "&:hover": { color: "#c0392b" } }}>
                    {news.author?.name}
                  </Typography>
                </Link>
                <Typography variant="caption" color="text.secondary">
                  {news.author?.published_date}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" gap={2.5} flexWrap="wrap">
              <Stack direction="row" alignItems="center" gap={0.5}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {readingTime(news.details || "")} min read
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={0.5}>
                <VisibilityIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {(news.total_view || 0).toLocaleString()} views
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={0.5}>
                <StarIcon fontSize="small" sx={{ color: "#f5a623" }} />
                <Typography variant="body2">
                  {news.rating?.number || 5.0} — {news.rating?.badge || "Excellent"}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          <Divider sx={{ mb: 3.5 }} />

        <Box sx={{ maxWidth: 780 }}>
            {news.details && news.details.includes("<") && news.details.includes(">") ? (
              <Box
                className="article-prose"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.details, { ADD_ATTR: ['target'] }) }}
              />
            ) : (
              <Box className="article-prose legacy-content">
                {news.details}
              </Box>
            )}
          </Box>

          {Array.isArray(news.sources) && news.sources.length > 0 && (
            <Box sx={{ mt: 5, p: 3, borderRadius: 3, bgcolor: "rgba(0,0,0,0.02)", border: "1px solid", borderColor: "divider" }}>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <VerifiedIcon sx={{ fontSize: 18, color: "success.main" }} />
                <Typography variant="subtitle2" fontWeight={800} sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Sources & Citations
                </Typography>
              </Stack>
              <Stack spacing={1}>
                {news.sources.map((source, index) => (
                  <Typography key={index} variant="caption" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span aria-hidden="true">-</span>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ color: "#c0392b", fontWeight: 600, textDecoration: "none" }}>{source.name}</a>
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}

          <Divider sx={{ my: 3.5 }} />

          <Box sx={{ mb: 1 }}>
            <ShareButtons title={news.title} />
          </Box>
        </CardContent>
      </Card>

      {related.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <div className="section-header">Related Articles</div>
            <Box sx={{ flex: 1, height: "1px", background: "linear-gradient(90deg, #c0392b20, transparent)" }} />
          </Box>
          <Grid container spacing={2.5}>
            {related.map((rel) => (
              <Grid key={rel.id || rel._id} item xs={12} sm={4}>
                <Link href={`/news/${rel.id || rel._id}`}>
                  <Card
                    className="news-card"
                    sx={{
                      borderRadius: 2.5,
                      overflow: "hidden",
                      cursor: "pointer",
                      "&:hover .rel-img": { transform: "scale(1.05)" },
                    }}
                  >
                    <Box sx={{ position: "relative", height: 160, overflow: "hidden" }}>
                      <SafeImage
                        className="rel-img"
                        src={rel.thumbnail_url || rel.image_url}
                        fallback="https://picsum.photos/400/300"
                        fill
                        unoptimized
                        alt={rel.title}
                        sizes="30vw"
                        style={{ objectFit: "cover", transition: "transform 0.4s ease" }}
                      />
                      <Chip
                        label={rel.category}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          backgroundColor: "#c0392b",
                          color: "white",
                          fontWeight: 700,
                          fontSize: "0.65rem",
                          borderRadius: 1,
                          height: 22,
                        }}
                      />
                    </Box>
                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          fontFamily: "'Playfair Display', serif",
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {rel.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                        {rel.author?.published_date}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
