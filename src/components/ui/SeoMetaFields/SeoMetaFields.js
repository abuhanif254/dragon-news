"use client";
import { useState } from "react";
import {
  Box, Typography, TextField, Stack, Chip, Button, Divider,
  IconButton, InputAdornment, Collapse,
} from "@mui/material";
import KeyIcon from "@mui/icons-material/Key";
import DescriptionIcon from "@mui/icons-material/Description";
import LinkIcon from "@mui/icons-material/Link";
import ImageIcon from "@mui/icons-material/Image";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import SourceIcon from "@mui/icons-material/Source";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { generateSlug, createExcerpt } from "@/lib/content-utils";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2, bgcolor: "#fafbfc",
    "&:hover fieldset": { borderColor: "#94a3b8" },
    "&.Mui-focused fieldset": { borderColor: "#ef4444" },
  },
  "& label.Mui-focused": { color: "#ef4444" },
};

const SectionHeader = ({ icon: Icon, title, iconColor = "#ef4444" }) => (
  <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
    <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: `${iconColor}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon sx={{ fontSize: 15, color: iconColor }} />
    </Box>
    <Typography variant="caption" fontWeight={800} sx={{ color: "#334155", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.65rem" }}>
      {title}
    </Typography>
  </Stack>
);

export default function SeoMetaFields({ seoMeta, onChange, formData = {} }) {
  const [tagInput, setTagInput] = useState("");
  const [expanded, setExpanded] = useState(true);

  const update = (key, value) => onChange({ ...seoMeta, [key]: value });

  // Auto-generate slug from title
  const handleAutoSlug = () => {
    if (formData.title) update("slug", generateSlug(formData.title));
  };

  // Auto-generate meta description from article content
  const handleAutoDesc = () => {
    if (formData.details) update("metaDescription", createExcerpt(formData.details, 155));
  };

  // Tag management
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag) return;
    const current = Array.isArray(seoMeta.tags) ? seoMeta.tags : [];
    if (!current.includes(tag) && current.length < 10) {
      update("tags", [...current, tag]);
    }
    setTagInput("");
  };
  const removeTag = (tag) => {
    const current = Array.isArray(seoMeta.tags) ? seoMeta.tags : [];
    update("tags", current.filter((t) => t !== tag));
  };
  const handleTagKey = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
  };

  // Source citations management
  const addSource = () => {
    const current = Array.isArray(seoMeta.sources) ? seoMeta.sources : [];
    update("sources", [...current, { label: "", url: "" }]);
  };
  const removeSource = (idx) => {
    const current = Array.isArray(seoMeta.sources) ? seoMeta.sources : [];
    update("sources", current.filter((_, i) => i !== idx));
  };
  const updateSource = (idx, field, value) => {
    const current = Array.isArray(seoMeta.sources) ? seoMeta.sources : [];
    const next = [...current];
    next[idx] = { ...next[idx], [field]: value };
    update("sources", next);
  };

  const tags = Array.isArray(seoMeta.tags) ? seoMeta.tags : [];
  const sources = Array.isArray(seoMeta.sources) ? seoMeta.sources : [];
  const metaDescLen = (seoMeta.metaDescription || "").length;

  return (
    <Box sx={{ border: "1px solid #e2e8f0", borderRadius: 2.5, overflow: "hidden" }}>
      {/* Header Toggle */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        onClick={() => setExpanded((p) => !p)}
        sx={{
          px: 2.5, py: 1.5,
          bgcolor: "linear-gradient(135deg, #fafbfc, #f8fafc)",
          background: "linear-gradient(135deg, #fafbfc, #f1f5f9)",
          borderBottom: expanded ? "1px solid #e2e8f0" : "none",
          cursor: "pointer",
          "&:hover": { bgcolor: "#f8fafc" },
          transition: "background 0.2s",
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, background: "linear-gradient(135deg, #ef4444, #f97316)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <KeyIcon sx={{ color: "white", fontSize: 16 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#0f172a", fontSize: "0.85rem" }}>
              SEO Settings
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.62rem" }}>
              Focus keyword, meta description, slug, tags &amp; sources
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" sx={{ color: "#64748b" }}>
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Stack>

      <Collapse in={expanded}>
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={3}>

            {/* Focus Keyword */}
            <Box>
              <SectionHeader icon={KeyIcon} title="Focus Keyword" iconColor="#8b5cf6" />
              <TextField
                fullWidth
                label="Focus Keyword"
                placeholder="e.g. climate change policy 2025"
                value={seoMeta.focusKeyword || ""}
                onChange={(e) => update("focusKeyword", e.target.value)}
                sx={fieldSx}
                helperText="The primary search term you want this article to rank for."
              />
            </Box>

            <Divider sx={{ borderColor: "#f1f5f9" }} />

            {/* Meta Description */}
            <Box>
              <SectionHeader icon={DescriptionIcon} title="Meta Description" iconColor="#3b82f6" />
              <TextField
                fullWidth multiline rows={3}
                label="Meta Description"
                placeholder="Write a compelling 120–160 character description of this article..."
                value={seoMeta.metaDescription || ""}
                onChange={(e) => update("metaDescription", e.target.value.slice(0, 160))}
                sx={fieldSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                      <IconButton size="small" onClick={handleAutoDesc} title="Auto-generate from content">
                        <AutoAwesomeIcon sx={{ fontSize: 16, color: "#3b82f6" }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText={
                  <Stack direction="row" justifyContent="space-between">
                    <span>120–160 chars recommended. Click ✨ to auto-generate from content.</span>
                    <span style={{ color: metaDescLen >= 120 && metaDescLen <= 160 ? "#10b981" : metaDescLen > 160 ? "#ef4444" : "#f59e0b", fontWeight: 700 }}>
                      {metaDescLen}/160
                    </span>
                  </Stack>
                }
                FormHelperTextProps={{ component: "div" }}
              />
            </Box>

            <Divider sx={{ borderColor: "#f1f5f9" }} />

            {/* URL Slug */}
            <Box>
              <SectionHeader icon={LinkIcon} title="URL Slug" iconColor="#10b981" />
              <TextField
                fullWidth
                label="URL Slug"
                placeholder="e.g. breaking-news-article-title-2025"
                value={seoMeta.slug || ""}
                onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
                sx={fieldSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.7rem", fontWeight: 600, whiteSpace: "nowrap" }}>/news/</Typography></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button size="small" onClick={handleAutoSlug} sx={{ fontSize: "0.6rem", textTransform: "none", fontWeight: 700, color: "#10b981", minWidth: "auto" }}>
                        Auto
                      </Button>
                    </InputAdornment>
                  ),
                }}
                helperText="Use lowercase letters, numbers, and hyphens only. Click Auto to generate from title."
              />
            </Box>

            <Divider sx={{ borderColor: "#f1f5f9" }} />

            {/* Image Alt Text */}
            <Box>
              <SectionHeader icon={ImageIcon} title="Image Alt Text" iconColor="#f59e0b" />
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Thumbnail Alt Text"
                  placeholder="e.g. President signs climate bill at White House"
                  value={seoMeta.altText?.thumbnail || ""}
                  onChange={(e) => update("altText", { ...(seoMeta.altText || {}), thumbnail: e.target.value })}
                  sx={fieldSx}
                  helperText="Describe the thumbnail image in 5–15 words."
                />
                <TextField
                  fullWidth
                  label="Banner Alt Text"
                  placeholder="e.g. Wide shot of climate summit delegates in Paris"
                  value={seoMeta.altText?.banner || ""}
                  onChange={(e) => update("altText", { ...(seoMeta.altText || {}), banner: e.target.value })}
                  sx={fieldSx}
                  helperText="Describe the banner image in 5–15 words."
                />
              </Stack>
            </Box>

            <Divider sx={{ borderColor: "#f1f5f9" }} />

            {/* Tags */}
            <Box>
              <SectionHeader icon={LocalOfferIcon} title="Tags / Keywords" iconColor="#06b6d4" />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mb: 1.5, minHeight: 32 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    onDelete={() => removeTag(tag)}
                    sx={{
                      height: 24, fontSize: "0.68rem", fontWeight: 700,
                      bgcolor: "#e0f2fe", color: "#0369a1",
                      "& .MuiChip-deleteIcon": { fontSize: 14, color: "#0369a1" },
                    }}
                  />
                ))}
                {tags.length === 0 && (
                  <Typography variant="caption" sx={{ color: "#cbd5e1", alignSelf: "center" }}>No tags added yet</Typography>
                )}
              </Box>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth size="small"
                  label="Add tag"
                  placeholder="e.g. politics (press Enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey}
                  sx={fieldSx}
                  disabled={tags.length >= 10}
                />
                <Button
                  variant="outlined" size="small" onClick={addTag}
                  disabled={!tagInput.trim() || tags.length >= 10}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, borderColor: "#06b6d4", color: "#06b6d4", px: 2, whiteSpace: "nowrap", "&:hover": { borderColor: "#0891b2", bgcolor: "#e0f2fe" } }}
                >
                  <AddIcon sx={{ fontSize: 16 }} />
                </Button>
              </Stack>
              <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mt: 0.8, fontSize: "0.62rem" }}>
                Press Enter or comma to add. Max 10 tags. {tags.length}/10 used.
              </Typography>
            </Box>

            <Divider sx={{ borderColor: "#f1f5f9" }} />

            {/* Source Citations */}
            <Box>
              <SectionHeader icon={SourceIcon} title="Source Citations" iconColor="#ef4444" />
              <Stack spacing={1.5}>
                {sources.map((src, idx) => (
                  <Box key={idx} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, p: 1.5, position: "relative" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="caption" fontWeight={700} sx={{ color: "#64748b", fontSize: "0.62rem" }}>
                        Source #{idx + 1}
                      </Typography>
                      <IconButton size="small" onClick={() => removeSource(idx)} sx={{ color: "#ef4444" }}>
                        <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Stack>
                    <Stack spacing={1}>
                      <TextField
                        fullWidth size="small"
                        label="Source Name / Label"
                        placeholder="e.g. Reuters, BBC News, WHO Report"
                        value={src.label || ""}
                        onChange={(e) => updateSource(idx, "label", e.target.value)}
                        sx={fieldSx}
                      />
                      <TextField
                        fullWidth size="small"
                        label="Source URL"
                        placeholder="https://www.example.com/article"
                        value={src.url || ""}
                        onChange={(e) => updateSource(idx, "url", e.target.value)}
                        sx={fieldSx}
                        type="url"
                      />
                    </Stack>
                  </Box>
                ))}
                <Button
                  variant="outlined" size="small" startIcon={<AddIcon />} onClick={addSource}
                  disabled={sources.length >= 8}
                  sx={{
                    borderRadius: 2, textTransform: "none", fontWeight: 700,
                    borderColor: "#ef4444", color: "#ef4444", borderStyle: "dashed",
                    "&:hover": { bgcolor: "#fef2f2", borderStyle: "solid" }
                  }}
                >
                  Add Source Citation
                </Button>
                <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.62rem" }}>
                  Source citations boost Google E-E-A-T signals — critical for Google News approval.
                </Typography>
              </Stack>
            </Box>

          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
}
