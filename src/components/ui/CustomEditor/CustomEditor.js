"use client";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { uploadImageToStorage } from "@/lib/storage-service";
import "react-quill-new/dist/quill.snow.css";
import {
  Box, CircularProgress, Typography, Stack, Chip, IconButton, Tooltip, LinearProgress,
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";

// Dynamically load ReactQuill (SSR-safe)
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 350, bgcolor: "#f8fafc", borderRadius: 2 }}>
      <CircularProgress size={32} sx={{ color: "#ef4444" }} />
    </Box>
  ),
});

// Quill formats we support
const FORMATS = [
  "header",
  "bold", "italic", "underline", "strike",
  "script",
  "align",
  "color", "background",
  "blockquote", "code-block",
  "list", "indent",
  "link", "image", "video",
];

// Compute editor statistics from HTML content
function getStats(html = "") {
  const plain = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

  const words = plain ? plain.split(/\s+/).filter(Boolean) : [];
  const sentences = plain ? plain.split(/[.!?]+/).filter((s) => s.trim().length > 0) : [];
  const paragraphs = (html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || []).filter((p) =>
    p.replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, "").trim().length > 0
  );
  const readingTime = Math.max(1, Math.ceil(words.length / 200));

  return {
    wordCount: words.length,
    charCount: plain.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    readingTime,
  };
}

// Convert YouTube/Vimeo share URLs to embeddable URLs
function toEmbedUrl(url = "") {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/(?:vimeo\.com\/)([0-9]+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  // Return original if we can't parse it (user may have pasted embed URL directly)
  return url.trim();
}

export default function CustomEditor({
  value = "",
  onChange,
  placeholder = "Write your article content here. Use H2/H3 headings, add links to sources, and include your focus keyword naturally...",
}) {
  const quillRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const stats = useMemo(() => getStats(value), [value]);

  const WORD_GOAL = 600;
  const wordPct = Math.min(100, Math.round((stats.wordCount / WORD_GOAL) * 100));
  const wordColor =
    stats.wordCount >= WORD_GOAL ? "#10b981" :
    stats.wordCount >= 300 ? "#f59e0b" : "#ef4444";
  const wordMuiColor =
    stats.wordCount >= WORD_GOAL ? "success" :
    stats.wordCount >= 300 ? "warning" : "error";

  // Exit fullscreen on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && isFullscreen) setIsFullscreen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen]);

  // Lock body scroll in fullscreen
  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isFullscreen]);

  // ── Image upload handler ──────────────────────────────────────────────────
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        alert("Image too large — maximum size is 5MB.");
        return;
      }
      const quill = quillRef.current;
      if (!quill) return;
      const editor = quill.getEditor();
      const range = editor.getSelection(true);
      try {
        setIsUploading(true);
        const url = await uploadImageToStorage(file, "articles/inline");
        editor.insertEmbed(range.index, "image", url);
        editor.setSelection(range.index + 1);
      } catch (err) {
        console.error("Image upload failed:", err);
        alert("Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    };
  }, []);

  // ── Video embed handler ───────────────────────────────────────────────────
  const videoHandler = useCallback(() => {
    const url = prompt("Paste a YouTube or Vimeo video URL:");
    if (!url?.trim()) return;
    const embedUrl = toEmbedUrl(url);
    const quill = quillRef.current;
    if (!quill) return;
    const editor = quill.getEditor();
    const range = editor.getSelection(true);
    editor.insertEmbed(range.index, "video", embedUrl);
    editor.setSelection(range.index + 1);
  }, []);

  // ── Toolbar modules ───────────────────────────────────────────────────────
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          // Row 1: Headings
          [{ header: [2, 3, 4, false] }],
          // Row 2: Text formatting
          ["bold", "italic", "underline", "strike"],
          [{ script: "sub" }, { script: "super" }],
          // Row 3: Alignment & Color
          [{ align: [] }],
          [{ color: [] }, { background: [] }],
          // Row 4: Block elements
          ["blockquote", "code-block"],
          // Row 5: Lists & Indent
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          // Row 6: Media & Links
          ["link", "image", "video"],
          // Row 7: Utilities
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
          video: videoHandler,
        },
      },
      // Better paste behavior from Word / Google Docs
      clipboard: {
        matchVisual: false,
      },
    }),
    [imageHandler, videoHandler]
  );

  // ── Shared editor box styles ─────────────────────────────────────────────
  const editorBoxSx = {
    "& .quill": {
      display: "flex",
      flexDirection: "column",
      bgcolor: "white",
      borderRadius: isFullscreen ? 0 : "8px",
      height: isFullscreen ? "calc(100vh - 116px)" : "auto",
    },
    "& .ql-toolbar.ql-snow": {
      borderTopLeftRadius: isFullscreen ? 0 : 8,
      borderTopRightRadius: isFullscreen ? 0 : 8,
      borderColor: "#e2e8f0",
      bgcolor: "#fafbfc",
      padding: "8px",
      flexShrink: 0,
    },
    "& .ql-container.ql-snow": {
      borderBottomLeftRadius: isFullscreen ? 0 : 8,
      borderBottomRightRadius: isFullscreen ? 0 : 8,
      borderColor: "#e2e8f0",
      minHeight: isFullscreen ? "unset" : 350,
      flex: isFullscreen ? 1 : "unset",
      overflowY: isFullscreen ? "auto" : "visible",
      fontSize: "1rem",
      fontFamily: "'Inter', sans-serif",
    },
    "& .ql-editor": {
      minHeight: isFullscreen ? "unset" : 350,
      lineHeight: "1.85",
      fontSize: "1.05rem",
      padding: isFullscreen ? "24px 48px" : "16px",
      maxWidth: isFullscreen ? "860px" : "unset",
      marginLeft: isFullscreen ? "auto" : 0,
      marginRight: isFullscreen ? "auto" : 0,
      width: "100%",
    },
    // Placeholder styling
    "& .ql-editor.ql-blank::before": {
      color: "#94a3b8",
      fontStyle: "normal",
      fontSize: "1rem",
    },
    // Blockquote styling
    "& .ql-editor blockquote": {
      borderLeft: "4px solid #ef4444",
      paddingLeft: "16px",
      color: "#475569",
      fontStyle: "italic",
      margin: "12px 0",
    },
    // Code block styling
    "& .ql-editor pre.ql-syntax": {
      backgroundColor: "#1e293b",
      color: "#e2e8f0",
      borderRadius: "6px",
      padding: "12px 16px",
      fontFamily: "'Fira Code', 'Courier New', monospace",
      fontSize: "0.9rem",
      lineHeight: 1.6,
    },
    // Inline code
    "& .ql-editor code": {
      backgroundColor: "#f1f5f9",
      color: "#ef4444",
      borderRadius: "4px",
      padding: "1px 5px",
      fontFamily: "'Fira Code', 'Courier New', monospace",
      fontSize: "0.875rem",
    },
    // Images
    "& .ql-editor img": {
      maxWidth: "100%",
      borderRadius: "6px",
      margin: "8px 0",
    },
    // Videos
    "& .ql-editor .ql-video": {
      display: "block",
      width: "100%",
      aspectRatio: "16/9",
      borderRadius: "8px",
      margin: "12px 0",
    },
    // Toolbar button active state
    "& .ql-toolbar button:hover, & .ql-toolbar button.ql-active": {
      color: "#ef4444 !important",
    },
    "& .ql-toolbar button:hover .ql-stroke, & .ql-toolbar button.ql-active .ql-stroke": {
      stroke: "#ef4444 !important",
    },
    "& .ql-toolbar button:hover .ql-fill, & .ql-toolbar button.ql-active .ql-fill": {
      fill: "#ef4444 !important",
    },
    "& .ql-toolbar .ql-picker-label:hover, & .ql-toolbar .ql-picker-label.ql-active": {
      color: "#ef4444 !important",
    },
  };

  return (
    <Box sx={{ position: "relative" }}>
      {/* ── Full-screen wrapper ── */}
      <Box
        sx={
          isFullscreen
            ? {
                position: "fixed",
                inset: 0,
                zIndex: 1300,
                bgcolor: "white",
                display: "flex",
                flexDirection: "column",
              }
            : {}
        }
      >
        {/* Full-screen header bar */}
        {isFullscreen && (
          <Box sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            px: 3, py: 1.2, borderBottom: "1px solid #e2e8f0",
            bgcolor: "#fafbfc", flexShrink: 0,
          }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#ef4444", boxShadow: "0 0 0 3px rgba(239,68,68,0.2)" }} />
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#0f172a" }}>
                Full-Screen Writing Mode
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                {stats.wordCount} words &middot; {stats.charCount} chars &middot; {stats.readingTime} min read
              </Typography>
              <Typography variant="caption" sx={{ color: wordColor, fontWeight: 700 }}>
                {stats.wordCount >= WORD_GOAL ? "✓ Goal reached" : `${WORD_GOAL - stats.wordCount} more to goal`}
              </Typography>
              <Tooltip title="Exit full-screen (Esc)">
                <IconButton size="small" onClick={() => setIsFullscreen(false)} sx={{ color: "#64748b", "&:hover": { color: "#ef4444" } }}>
                  <FullscreenExitIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        )}

        {/* ── Editor ── */}
        <Box sx={{ position: "relative", flex: isFullscreen ? 1 : "unset", minHeight: 0, ...editorBoxSx }}>
          {/* Image uploading overlay */}
          {isUploading && (
            <Box sx={{
              position: "absolute", inset: 0, zIndex: 10,
              bgcolor: "rgba(255,255,255,0.88)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              borderRadius: 2,
            }}>
              <CircularProgress size={40} sx={{ color: "#ef4444", mb: 1.5 }} />
              <Typography variant="body2" fontWeight={700} sx={{ color: "#475569" }}>
                Uploading image to storage...
              </Typography>
            </Box>
          )}

          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={FORMATS}
            placeholder={placeholder}
          />
        </Box>

        {/* ── Status Bar ── */}
        <Box sx={{
          px: isFullscreen ? 3 : 0.5,
          py: isFullscreen ? 1.2 : 0.8,
          ...(isFullscreen && {
            borderTop: "1px solid #e2e8f0",
            bgcolor: "#fafbfc",
            flexShrink: 0,
          }),
        }}>
          {/* Word goal progress bar */}
          <LinearProgress
            variant="determinate"
            value={wordPct}
            color={wordMuiColor}
            sx={{ height: 3, borderRadius: 2, mb: 1.2, bgcolor: `${wordColor}18` }}
          />
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
            {/* Left: stats chips */}
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={0.5}>
              <Chip
                size="small"
                label={`${stats.wordCount} words`}
                sx={{
                  height: 22, fontSize: "0.68rem", fontWeight: 700,
                  bgcolor: `${wordColor}15`, color: wordColor,
                }}
              />
              <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.68rem" }}>
                {stats.charCount} chars
              </Typography>
              <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#e2e8f0" }} />
              <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.68rem" }}>
                {stats.readingTime} min read
              </Typography>
              {stats.paragraphCount > 0 && (
                <>
                  <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#e2e8f0" }} />
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.68rem" }}>
                    {stats.paragraphCount} {stats.paragraphCount === 1 ? "para" : "paras"}
                  </Typography>
                </>
              )}
              {stats.sentenceCount > 0 && (
                <>
                  <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#e2e8f0" }} />
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.68rem" }}>
                    {stats.sentenceCount} sentences
                  </Typography>
                </>
              )}
              {stats.wordCount > 0 && stats.wordCount < WORD_GOAL && (
                <Typography variant="caption" sx={{ color: "#f59e0b", fontWeight: 600, fontSize: "0.68rem" }}>
                  ({WORD_GOAL - stats.wordCount} more to reach 600-word goal)
                </Typography>
              )}
              {stats.wordCount >= WORD_GOAL && (
                <Typography variant="caption" sx={{ color: "#10b981", fontWeight: 700, fontSize: "0.68rem" }}>
                  ✓ Word goal reached
                </Typography>
              )}
            </Stack>

            {/* Right: full-screen toggle */}
            {!isFullscreen && (
              <Tooltip title="Enter full-screen writing mode (Esc to exit)">
                <IconButton
                  size="small"
                  onClick={() => setIsFullscreen(true)}
                  sx={{
                    color: "#94a3b8",
                    "&:hover": { color: "#ef4444", bgcolor: "rgba(239,68,68,0.08)" },
                    borderRadius: 1.5,
                  }}
                >
                  <FullscreenIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}