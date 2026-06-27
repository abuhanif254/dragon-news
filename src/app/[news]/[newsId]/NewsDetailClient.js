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
  LinearProgress,
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
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import TableOfContents from "@/components/ui/TableOfContents/TableOfContents";
import FontSizeControl from "@/components/ui/FontSizeControl/FontSizeControl";
import ArticleReactions from "@/components/ui/ArticleReactions/ArticleReactions";
import AuthorCard from "@/components/ui/AuthorCard/AuthorCard";
import RelatedArticles from "@/components/ui/RelatedArticles/RelatedArticles";
import CommentsSection from "@/components/ui/CommentsSection/CommentsSection";
import AudioNarrator from "@/components/ui/AudioNarrator/AudioNarrator";
import { useState, useEffect } from "react";
import { subscribeToAuth } from "@/lib/auth-service";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

const readingTime = (text = "") =>
  Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));

export default function NewsDetailClient({ news, related }) {
  const [fontSize, setFontSize] = useState(1);
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [user, setUser] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOption, setVotedOption] = useState("");
  const [pollData, setPollData] = useState(news.poll || null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && news.poll) {
      const saved = localStorage.getItem(`poll_${news.id || news._id}`);
      if (saved) {
        setHasVoted(true);
        setVotedOption(saved);
      }
    }
  }, [news]);

  const handleVote = async (optionKey) => {
    if (voting) return;
    setVoting(true);
    try {
      const { submitPollVote } = await import("@/lib/firestore");
      const success = await submitPollVote(news.id || news._id, optionKey);
      if (success) {
        localStorage.setItem(`poll_${news.id || news._id}`, optionKey);
        setHasVoted(true);
        setVotedOption(optionKey);
        setPollData((prev) => {
          if (!prev) return null;
          const updatedOptions = { ...prev.options };
          if (updatedOptions[optionKey]) {
            updatedOptions[optionKey] = {
              ...updatedOptions[optionKey],
              votes: (updatedOptions[optionKey].votes || 0) + 1
            };
          }
          return { ...prev, options: updatedOptions };
        });
      }
    } catch (err) {
      console.error("Poll vote error:", err);
    } finally {
      setVoting(false);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (u) => {
      setUser(u);
      if (u) {
        try {
          const { getUserBookmarks } = await import("@/lib/firestore");
          const bookmarks = await getUserBookmarks(u.uid);
          setIsBookmarked(bookmarks.includes(news.id || news._id));
        } catch (err) {
          console.error("Error reading bookmarks:", err);
        }
      } else {
        setIsBookmarked(false);
      }
    });
    return () => unsubscribe();
  }, [news.id, news._id]);

  useEffect(() => {
    if (typeof window !== "undefined" && news) {
      try {
        const history = JSON.parse(localStorage.getItem("reading_history") || "[]");
        const newItem = {
          id: news.id || news._id,
          title: news.title || "Untitled",
          category: news.category || "General",
          authorName: news.author?.name || "The Brain Editorial Team",
          thumbnail_url: news.thumbnail_url || news.image_url || "",
          viewedAt: new Date().toISOString(),
        };
        const filtered = [newItem, ...history.filter(h => h.id !== newItem.id)].slice(0, 5);
        localStorage.setItem("reading_history", JSON.stringify(filtered));
      } catch (err) {
        console.error("Error updating reading history:", err);
      }
    }
  }, [news]);

  const handleBookmarkToggle = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setBookmarkLoading(true);
    try {
      const { toggleBookmark } = await import("@/lib/firestore");
      const bookmarked = await toggleBookmark(user.uid, news.id || news._id);
      setIsBookmarked(bookmarked);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setBookmarkLoading(false);
    }
  };

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
      <Grid container spacing={{ xs: 4, md: 6 }} sx={{ position: "relative" }}>
        
        {/* Left Column: Article Content */}
        <Grid item xs={12} md={8}>
          <Box component="article" sx={{ pr: { md: 2 }, pl: { lg: 10 }, position: "relative" }}>
            
            {/* Floating Share Bar (Desktop Left Side - Inside reserved padding) */}
            <Box className="no-print" sx={{ 
              display: { xs: "none", lg: "flex" }, 
              position: "absolute", 
              left: 0, 
              top: 0,
              height: "100%",
              zIndex: 10 
            }}>
              <Box sx={{ position: "sticky", top: 150, height: "fit-content" }}>
                <Stack direction="column" gap={1.5} alignItems="center">
                  <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: "uppercase", writingMode: "vertical-rl", transform: "rotate(180deg)", mb: 1, letterSpacing: "0.1em" }}>
                    Share
                  </Typography>
                  <ShareButtons title={news.title} direction="column" />
                </Stack>
              </Box>
            </Box>
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
              
              <Stack direction="row" alignItems="center" gap={2} className="no-print">
                <Button
                  onClick={handleBookmarkToggle}
                  disabled={bookmarkLoading}
                  variant={isBookmarked ? "contained" : "outlined"}
                  color="error"
                  size="small"
                  startIcon={isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    textTransform: "none",
                    borderColor: isBookmarked ? "transparent" : "rgba(192, 57, 43, 0.4)",
                    color: isBookmarked ? "white" : "var(--brand-red)",
                    "&:hover": {
                      borderColor: "var(--brand-red)",
                      backgroundColor: isBookmarked ? "var(--brand-red-dark)" : "rgba(192, 57, 43, 0.04)",
                    }
                  }}
                >
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </Button>
                <Button
                  onClick={() => window.print()}
                  variant="outlined"
                  color="inherit"
                  size="small"
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    textTransform: "none",
                    borderColor: "rgba(0,0,0,0.12)",
                    "&:hover": {
                      borderColor: "text.primary",
                      backgroundColor: "rgba(0,0,0,0.04)"
                    }
                  }}
                >
                  Print
                </Button>
                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                  <FontSizeControl fontSize={fontSize} setFontSize={setFontSize} fontFamily={fontFamily} setFontFamily={setFontFamily} />
                </Box>
              </Stack>
            </Stack>

            {/* Audio Narrator */}
            <Box className="no-print">
              <AudioNarrator text={news.details} />
            </Box>

            {/* Rich Text Body */}
            <Box sx={{ 
              maxWidth: "100%", 
              overflow: "hidden", 
              wordBreak: "break-word", 
              fontSize: `${fontSize}rem`,
              fontFamily: fontFamily === "serif" ? "'Playfair Display', 'Georgia', serif" : "'Inter', 'Roboto', sans-serif"
            }}>
              {news.details && news.details.includes("<") && news.details.includes(">") ? (
                <RichTextRenderer content={news.details} />
              ) : (
                <Box className="article-prose legacy-content">
                  {news.details}
                </Box>
              )}
            </Box>

            {/* Poll Widget */}
            {pollData && (
              <Card sx={{ my: 4, borderRadius: 3, border: "1px solid", borderColor: "divider", boxShadow: "none", bgcolor: "rgba(192, 57, 43, 0.02)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="overline" fontWeight={800} color="error" sx={{ letterSpacing: "0.08em", display: "block", mb: 1.5 }}>
                    Dragon Reader Poll
                  </Typography>
                  <Typography variant="h6" fontWeight={800} sx={{ color: "text.primary", mb: 3 }}>
                    {pollData.question}
                  </Typography>

                  {hasVoted ? (
                    <Stack spacing={2.5}>
                      {Object.entries(pollData.options || {}).map(([key, opt]) => {
                        const totalVotes = Object.values(pollData.options || {}).reduce((sum, o) => sum + (o.votes || 0), 0) || 1;
                        const pct = Math.round(((opt.votes || 0) / totalVotes) * 100);
                        const isUserChoice = votedOption === key;

                        return (
                          <Box key={key}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Typography variant="body2" fontWeight={isUserChoice ? 700 : 500} color={isUserChoice ? "error.main" : "text.primary"}>
                                {opt.text} {isUserChoice && " (Your vote)"}
                              </Typography>
                              <Typography variant="caption" fontWeight={700}>
                                {pct}% ({opt.votes || 0})
                              </Typography>
                            </Stack>
                            <LinearProgress 
                              variant="determinate" 
                              value={pct} 
                              color={isUserChoice ? "error" : "inherit"}
                              sx={{ height: 6, borderRadius: 3, bgcolor: "action.hover" }}
                            />
                          </Box>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Stack spacing={1.5}>
                      {Object.entries(pollData.options || {}).map(([key, opt]) => (
                        <Button
                          key={key}
                          variant="outlined"
                          color="inherit"
                          onClick={() => handleVote(key)}
                          disabled={voting}
                          sx={{
                            justifyContent: "flex-start",
                            textTransform: "none",
                            borderRadius: 2.5,
                            py: 1.2,
                            px: 3,
                            fontWeight: 700,
                            border: "1px solid",
                            borderColor: "divider",
                            "&:hover": {
                              borderColor: "error.main",
                              bgcolor: "rgba(192, 57, 43, 0.04)"
                            }
                          }}
                        >
                          {opt.text}
                        </Button>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reactions */}
            <Box className="no-print">
              <ArticleReactions articleId={news.id || news._id} initialReactions={news.reactions} />
            </Box>

            {/* Comments Section */}
            <Box className="no-print">
              <CommentsSection articleId={news.id || news._id} />
            </Box>

            {/* Related Articles (Moved to Article Bottom) */}
            <Box className="no-print" sx={{ mt: 6, pt: 4, borderTop: "1px solid", borderColor: "divider" }}>
              <RelatedArticles related={related} />
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
            
            <Box className="no-print" sx={{ display: { xs: "block", md: "none" }, mt: 4 }}>
              <Divider sx={{ mb: 3 }} />
              <ShareButtons title={news.title} />
            </Box>
          </Box>
        </Grid>

        {/* Right Column: Sticky Sidebar */}
        <Grid item xs={12} md={4} className="no-print">
          <Stack spacing={4} sx={{ position: "sticky", top: 100, width: "100%" }}>
            
            {/* Table of Contents */}
            {news.details && news.details.includes("<h") && (
              <Box sx={{ display: { xs: "none", md: "block" }, width: "100%" }}>
                <TableOfContents htmlContent={news.details} />
              </Box>
            )}
            
            {/* Author Box */}
            <AuthorCard author={news.author} category={news.category} />

            {/* Share Buttons (Mobile/Tablet only, hidden on large desktop where floating bar is) */}
            <Box sx={{ display: { xs: "block", lg: "none" }, mb: 4 }}>
              <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.1em", display: "block", mb: 2 }}>Share Article</Typography>
              <ShareButtons title={news.title} />
            </Box>

          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
