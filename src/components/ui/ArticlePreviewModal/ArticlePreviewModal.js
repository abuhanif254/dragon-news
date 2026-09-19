"use client";
import React, { useState } from "react";
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Container,
  Stack,
  Chip,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Tooltip,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import LaptopIcon from "@mui/icons-material/Laptop";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import FormatSizeIcon from "@mui/icons-material/FormatSize";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import PollIcon from "@mui/icons-material/Poll";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ShareIcon from "@mui/icons-material/Share";
import { isBengali } from "@/lib/content-utils";

export default function ArticlePreviewModal({
  open,
  onClose,
  formData = {},
  seoMeta = {},
  user = {},
  hasPoll = false,
  pollQuestion = "",
  pollOptions = [],
}) {
  const [device, setDevice] = useState("desktop"); // "desktop" | "mobile"
  const [fontSize, setFontSize] = useState("1.05"); // rem
  const [fontFamily, setFontFamily] = useState("serif"); // "serif" | "sans"
  const [selectedPollOpt, setSelectedPollOpt] = useState("");
  const [pollVoted, setPollVoted] = useState(false);

  const title = formData.title || "Untitled Article";
  const category = formData.category || "General";
  const coverImage = formData.imageUrl || formData.thumbnail_url || "https://picsum.photos/seed/editorial-preview/1200/675";
  const details = formData.details || "<p><em>No article content written yet. Start typing in the editor to see your live preview here.</em></p>";
  const authorName = user?.displayName || user?.name || formData.authorName || "The Brain Editorial Team";
  const authorImg = user?.photoURL || user?.photo || "https://xsgames.co/randomusers/avatar.php?g=pixel";
  const tags = seoMeta?.tags || [];

  const isBangla = isBengali(title + details);

  // Compute estimated reading time
  const cleanWords = details.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.ceil(cleanWords / 200));
  const readingTimeText = isBangla
    ? `${readingMinutes} মিনিট পড়ার সময়`
    : `${readingMinutes} min read`;

  const validPollOptions = pollOptions.filter((opt) => opt && opt.trim());

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDialog-paper": {
          bgcolor: "#0b0f19",
          color: "#f8fafc",
        },
      }}
    >
      {/* ── Top Sticky Control Bar ── */}
      <AppBar
        position="sticky"
        sx={{
          bgcolor: "#0f172a",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", py: 0.5 }}>
          {/* Left: Brand / Title */}
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, mr: 2 }}>
            <Box
              sx={{
                px: 1.2,
                py: 0.3,
                borderRadius: 1.5,
                bgcolor: "#c0392b",
                color: "white",
                fontWeight: 900,
                fontSize: "0.7rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              READER PREVIEW
            </Box>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color="white"
              noWrap
              sx={{ display: { xs: "none", sm: "block" }, maxWidth: { sm: 250, md: 450 } }}
            >
              {title}
            </Typography>
          </Stack>

          {/* Center: Device Viewport Switcher */}
          <ToggleButtonGroup
            value={device}
            exclusive
            onChange={(_, val) => val && setDevice(val)}
            size="small"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.08)",
              borderRadius: 2,
              p: 0.3,
              "& .MuiToggleButton-root": {
                color: "rgba(255, 255, 255, 0.7)",
                border: "none",
                borderRadius: 1.5,
                px: 1.8,
                py: 0.5,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.8rem",
                "&.Mui-selected": {
                  bgcolor: "#c0392b",
                  color: "white",
                  "&:hover": { bgcolor: "#962d22" },
                },
              },
            }}
          >
            <ToggleButton value="desktop">
              <LaptopIcon sx={{ fontSize: 18, mr: 0.75 }} />
              Desktop
            </ToggleButton>
            <ToggleButton value="mobile">
              <SmartphoneIcon sx={{ fontSize: 18, mr: 0.75 }} />
              Mobile (390px)
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Right: Typography Controls & Close */}
          <Stack direction="row" alignItems="center" spacing={1}>
            {/* Font Family Toggle */}
            <Tooltip title="Toggle Serif / Sans-Serif">
              <IconButton
                size="small"
                onClick={() => setFontFamily(fontFamily === "serif" ? "sans" : "serif")}
                sx={{
                  color: "white",
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.16)" },
                }}
              >
                <TextFieldsIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Font Size Toggle */}
            <Tooltip title="Cycle Reading Font Size">
              <IconButton
                size="small"
                onClick={() => {
                  if (fontSize === "0.95") setFontSize("1.05");
                  else if (fontSize === "1.05") setFontSize("1.2");
                  else setFontSize("0.95");
                }}
                sx={{
                  color: "white",
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.16)" },
                }}
              >
                <FormatSizeIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.15)", mx: 0.5 }} />

            {/* Close Button */}
            <IconButton
              edge="end"
              color="inherit"
              onClick={onClose}
              aria-label="close preview"
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.08)",
                "&:hover": { bgcolor: "rgba(192, 57, 43, 0.4)" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* ── Scrollable Preview Canvas ── */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          py: device === "mobile" ? 4 : 2,
          px: { xs: 1, sm: 3 },
          bgcolor: device === "mobile" ? "#060911" : "#ffffff",
          color: "#0f172a",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* Device Frame Wrapper */}
        <Box
          sx={{
            width: "100%",
            maxWidth: device === "mobile" ? "390px" : "1050px",
            bgcolor: "#ffffff",
            color: "#0f172a",
            borderRadius: device === "mobile" ? 6 : 0,
            border: device === "mobile" ? "10px solid #1e293b" : "none",
            boxShadow: device === "mobile" ? "0 25px 60px rgba(0,0,0,0.6)" : "none",
            overflow: "hidden",
            transition: "max-width 0.3s ease-in-out",
          }}
        >
          {/* Mobile Status Bar Simulation */}
          {device === "mobile" && (
            <Box
              sx={{
                bgcolor: "#0f172a",
                color: "#94a3b8",
                px: 3,
                py: 0.8,
                fontSize: "0.7rem",
                fontWeight: 700,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>9:41</span>
              <Box sx={{ width: 120, height: 16, bgcolor: "#1e293b", borderRadius: 4 }} />
              <span>5G 100%</span>
            </Box>
          )}

          {/* Article Hero Banner */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: device === "mobile" ? 240 : 420,
              bgcolor: "#0f172a",
              overflow: "hidden",
            }}
          >
            <img
              src={coverImage}
              alt={title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            {/* Gradient Overlay */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
              }}
            />

            {/* Header Content Overlay */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                p: { xs: 2.5, sm: 4 },
              }}
            >
              <Chip
                label={category}
                size="small"
                sx={{
                  bgcolor: "#c0392b",
                  color: "white",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  borderRadius: 1,
                  mb: 1.5,
                }}
              />
              <Typography
                variant="h1"
                fontWeight={900}
                sx={{
                  color: "white",
                  fontFamily: fontFamily === "serif" ? "'Playfair Display', Georgia, serif" : "'Inter', sans-serif",
                  lineHeight: 1.25,
                  fontSize: device === "mobile" ? "1.5rem" : { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
                  textShadow: "0 2px 8px rgba(0,0,0,0.7)",
                }}
              >
                {title}
              </Typography>
            </Box>
          </Box>

          {/* Article Container */}
          <Box sx={{ p: { xs: 2.5, sm: 4, md: 5 } }}>
            {/* Meta Bar */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
              sx={{
                pb: 3,
                mb: 3,
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar
                  src={authorImg}
                  alt={authorName}
                  sx={{ width: 44, height: 44, border: "2px solid #e2e8f0" }}
                />
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                    {authorName}
                  </Typography>
                  <Typography variant="caption" color="#64748b" fontWeight={500}>
                    {new Date().toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={2.5}>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <AccessTimeIcon sx={{ fontSize: 16, color: "#64748b" }} />
                  <Typography variant="caption" color="#64748b" fontWeight={600}>
                    {readingTimeText}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <VisibilityIcon sx={{ fontSize: 16, color: "#64748b" }} />
                  <Typography variant="caption" color="#64748b" fontWeight={600}>
                    1 view
                  </Typography>
                </Stack>
                <IconButton size="small" sx={{ color: "#c0392b" }}>
                  <BookmarkBorderIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ color: "#64748b" }}>
                  <ShareIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>

            {/* Audio Narrator Mockup Bar */}
            <Paper
              sx={{
                p: 2,
                borderRadius: 2.5,
                border: "1px solid #fed7aa",
                bgcolor: "#fffbeb",
                boxShadow: "none",
                mb: 4,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      bgcolor: "rgba(192, 57, 43, 0.1)",
                      color: "#c0392b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <VolumeUpIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                      Listen to this Story
                    </Typography>
                    <Typography variant="caption" color="#64748b">
                      AI audio narrator will synthesize this article for readers.
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<PlayArrowIcon />}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                >
                  Play
                </Button>
              </Stack>
            </Paper>

            {/* Rich Article Body */}
            <Box
              sx={{
                fontSize: `${fontSize}rem`,
                lineHeight: 1.8,
                color: "#1e293b",
                fontFamily:
                  fontFamily === "serif"
                    ? "'Playfair Display', Georgia, serif"
                    : "'Inter', 'Roboto', sans-serif",
                "& p": { mb: 2.5 },
                "& h1, & h2, & h3, & h4": {
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 800,
                  color: "#0f172a",
                  mt: 3,
                  mb: 1.5,
                  lineHeight: 1.3,
                },
                "& blockquote": {
                  borderLeft: "4px solid #c0392b",
                  pl: 2.5,
                  my: 3,
                  fontStyle: "italic",
                  color: "#475569",
                  bgcolor: "#f8fafc",
                  py: 1.5,
                  borderRadius: "0 8px 8px 0",
                },
                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: 2,
                  my: 2.5,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                },
                "& ul, & ol": {
                  pl: 3,
                  mb: 2.5,
                },
                "& li": {
                  mb: 1,
                },
                "& a": {
                  color: "#c0392b",
                  textDecoration: "underline",
                  fontWeight: 600,
                },
              }}
              dangerouslySetInnerHTML={{ __html: details }}
            />

            {/* Interactive Poll Preview (if active) */}
            {hasPoll && pollQuestion && validPollOptions.length > 0 && (
              <Card
                sx={{
                  my: 4,
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                  bgcolor: "#f8fafc",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <PollIcon sx={{ color: "#c0392b", fontSize: 20 }} />
                    <Typography
                      variant="overline"
                      fontWeight={800}
                      color="#c0392b"
                      sx={{ letterSpacing: "0.08em" }}
                    >
                      READER POLL PREVIEW
                    </Typography>
                  </Stack>

                  <Typography variant="subtitle1" fontWeight={800} color="#0f172a" sx={{ mb: 2 }}>
                    {pollQuestion}
                  </Typography>

                  <RadioGroup
                    value={selectedPollOpt}
                    onChange={(e) => setSelectedPollOpt(e.target.value)}
                  >
                    {validPollOptions.map((opt, idx) => (
                      <FormControlLabel
                        key={idx}
                        value={opt}
                        control={<Radio size="small" color="error" />}
                        label={
                          <Typography variant="body2" fontWeight={600} color="#334155">
                            {opt}
                          </Typography>
                        }
                        sx={{
                          mb: 1,
                          p: 0.8,
                          borderRadius: 2,
                          bgcolor: selectedPollOpt === opt ? "rgba(192, 57, 43, 0.08)" : "white",
                          border: "1px solid",
                          borderColor: selectedPollOpt === opt ? "#c0392b" : "#e2e8f0",
                          mx: 0,
                        }}
                      />
                    ))}
                  </RadioGroup>

                  <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      size="small"
                      color="error"
                      onClick={() => setPollVoted(true)}
                      disabled={!selectedPollOpt || pollVoted}
                      sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                    >
                      {pollVoted ? "Vote Recorded (Preview)" : "Vote"}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Article Tags */}
            {tags.length > 0 && (
              <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #e2e8f0" }}>
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color="#64748b"
                  sx={{ textTransform: "uppercase", letterSpacing: "0.08em", display: "block", mb: 1.5 }}
                >
                  TOPICS & TAGS
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {tags.map((tag, idx) => (
                    <Chip
                      key={idx}
                      label={`#${tag}`}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        bgcolor: "#f1f5f9",
                        color: "#334155",
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Author Attribution Card */}
            <Card
              sx={{
                mt: 5,
                p: 3,
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                bgcolor: "#f8fafc",
                boxShadow: "none",
              }}
            >
              <Stack direction="row" spacing={2.5} alignItems="center">
                <Avatar
                  src={authorImg}
                  alt={authorName}
                  sx={{ width: 64, height: 64, border: "2px solid #e2e8f0" }}
                />
                <Box>
                  <Typography variant="overline" color="#c0392b" fontWeight={800}>
                    WRITTEN BY
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="#0f172a">
                    {authorName}
                  </Typography>
                  <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
                    Contributing journalist and analyst for The Brain. Independent reporting on science, politics, and culture.
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
