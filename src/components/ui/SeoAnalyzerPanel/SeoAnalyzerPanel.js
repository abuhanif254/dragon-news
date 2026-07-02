"use client";
import { useMemo } from "react";
import {
  Box, Typography, Stack, Chip, LinearProgress, Divider, Tooltip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import SearchIcon from "@mui/icons-material/Search";
import {
  stripHtml,
  calcKeywordDensity,
  calcReadabilityScore,
  countInternalLinks,
  countExternalLinks,
  keywordInIntro,
  keywordInHeadings,
  checkInlineImageAlts,
} from "@/lib/content-utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

function buildChecks(formData, seoMeta) {
  const { title = "", details = "", thumbnail_url = "", imageUrl = "", category = "" } = formData;
  const {
    focusKeyword = "", metaDescription = "", slug = "",
    tags = [], altText = {}, sources = [],
  } = seoMeta;

  const plainText = stripHtml(details);
  const words = plainText.trim() ? plainText.trim().split(/\s+/) : [];
  const wordCount = words.length;
  const titleLen = title.length;
  const headingMatches = (details.match(/<(h2|h3)[^>]*>[\s\S]*?<\/\1>/gi) || []);
  const h1Matches = (details.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || []);
  const { density: kwDensity } = calcKeywordDensity(plainText, focusKeyword);
  const readability = calcReadabilityScore(plainText);
  const internalLinks = countInternalLinks(details, SITE_URL);
  const externalLinks = countExternalLinks(details, SITE_URL);
  const kwLower = focusKeyword.toLowerCase().trim();
  const firstParaKw = keywordInIntro(plainText, focusKeyword, 100);
  const kwInHeadingsOk = keywordInHeadings(details, focusKeyword);
  const kwInTitle = kwLower && title.toLowerCase().includes(kwLower);
  const kwInMetaDesc = kwLower && metaDescription.toLowerCase().includes(kwLower);
  const kwInSlug = kwLower && slug.toLowerCase().includes(kwLower.replace(/\s+/g, "-"));

  return [
    {
      label: "Focus Keyword",
      icon: "🎯",
      checks: [
        { id: "kw_set", label: "Focus keyword is set", pass: !!focusKeyword.trim(), tip: "Set a primary keyword — the main search term you want this article to rank for.", weight: 2 },
        { id: "kw_in_title", label: "Keyword in title", pass: kwInTitle, tip: `Add "${focusKeyword || "your keyword"}" to your article title.`, weight: 2 },
        { id: "kw_in_intro", label: "Keyword in first 100 words", pass: firstParaKw, tip: "Use your focus keyword naturally in the opening paragraph.", weight: 2 },
        { id: "kw_in_headings", label: "Keyword in a H2/H3 subheading", pass: kwInHeadingsOk, tip: "Include your focus keyword in at least one subheading.", weight: 1 },
        { id: "kw_density", label: `Keyword density 0.5–2.5% (now ${kwDensity}%)`, pass: kwLower ? kwDensity >= 0.5 && kwDensity <= 2.5 : false, warn: kwDensity > 2.5, tip: kwDensity > 2.5 ? "Too high — reduce keyword usage to avoid stuffing penalties." : "Aim for keyword density between 0.5% and 2.5%.", weight: 1 },
        { id: "kw_in_meta", label: "Keyword in meta description", pass: kwInMetaDesc, tip: "Include your focus keyword in the meta description.", weight: 1 },
      ],
    },
    {
      label: "Title & Meta",
      icon: "📝",
      checks: [
        { id: "title_len", label: `Title 35–70 chars (now ${titleLen})`, pass: titleLen >= 35 && titleLen <= 70, tip: titleLen < 35 ? "Title is too short — expand to at least 35 characters." : "Title is too long — keep under 70 characters.", weight: 2 },
        { id: "no_h1", label: "No H1 tags in content body", pass: h1Matches.length === 0, tip: "Do not use H1 inside the article body. The article title IS the H1.", weight: 1 },
        { id: "meta_desc", label: `Meta description 120–160 chars (now ${metaDescription.length})`, pass: metaDescription.trim().length >= 120 && metaDescription.trim().length <= 160, tip: "Write a meta description between 120 and 160 characters.", weight: 2 },
        { id: "slug_set", label: "URL slug is set", pass: slug.trim().length > 3, tip: "Set a keyword-rich URL slug for cleaner, SEO-friendly URLs.", weight: 1 },
        { id: "kw_in_slug", label: "Keyword in URL slug", pass: kwInSlug, tip: "Include your focus keyword in the URL slug.", weight: 1 },
      ],
    },
    {
      label: "Content Quality",
      icon: "📖",
      checks: [
        { id: "word_count", label: `600+ words (now ${wordCount})`, pass: wordCount >= 600, warn: wordCount >= 300 && wordCount < 600, tip: "Aim for at least 600 words. Google News prefers substantial articles.", weight: 2 },
        { id: "headings", label: `2+ H2/H3 subheadings (now ${headingMatches.length})`, pass: headingMatches.length >= 2, tip: "Add at least 2 subheadings to structure your article.", weight: 2 },
        { id: "internal_link", label: `Internal links present (now ${internalLinks})`, pass: internalLinks >= 1, tip: "Link to at least one other article on your site.", weight: 1 },
        { id: "external_link", label: `Source/external links present (now ${externalLinks})`, pass: externalLinks >= 1, tip: "Link to at least one credible external source.", weight: 1 },
        { id: "readability", label: `Readability score 60+ (now ${readability})`, pass: readability >= 60, warn: readability >= 45 && readability < 60, tip: "Simplify sentences. Use shorter sentences and common words.", weight: 1 },
        { id: "no_stuffing", label: "No keyword stuffing (density < 3%)", pass: !kwLower || kwDensity < 3, tip: "Reduce keyword repetition. Google penalises keyword stuffing.", weight: 1 },
      ],
    },
    {
      label: "Images & Media",
      icon: "🖼️",
      checks: [
        { id: "thumbnail", label: "Thumbnail image uploaded", pass: !!thumbnail_url, tip: "Upload a square thumbnail (min 400×400px).", weight: 1 },
        { id: "banner", label: "Banner image uploaded", pass: !!imageUrl, tip: "Upload a 16:9 banner image (1200×630px recommended).", weight: 1 },
        { id: "thumb_alt", label: "Thumbnail alt text set", pass: (altText.thumbnail || "").trim().length > 3, tip: "Add descriptive alt text for your thumbnail image.", weight: 1 },
        { id: "banner_alt", label: "Banner alt text set", pass: (altText.banner || "").trim().length > 3, tip: "Add descriptive alt text for your banner image.", weight: 1 },
      ],
    },
    {
      label: "Publication Standards",
      icon: "📋",
      checks: [
        { id: "category", label: "Category selected", pass: !!category, tip: "Select a category — required for Google News sections.", weight: 1 },
        { id: "sources", label: "1+ source citation added", pass: sources.filter((s) => s.url?.trim()).length >= 1, tip: "Add at least one credible source citation (critical for E-E-A-T).", weight: 2 },
        { id: "tags", label: "2+ tags/keywords added", pass: tags.filter((t) => t.trim()).length >= 2, tip: "Add at least 2 tags to improve discoverability.", weight: 1 },
      ],
    },
  ];
}

function computeScore(groups) {
  let totalW = 0, passedW = 0;
  groups.flatMap((g) => g.checks).forEach(({ weight = 1, pass }) => {
    totalW += weight;
    if (pass) passedW += weight;
  });
  return totalW > 0 ? Math.round((passedW / totalW) * 100) : 0;
}

function CheckRow({ check }) {
  const Icon = check.pass ? CheckCircleIcon : check.warn ? WarningAmberIcon : CancelIcon;
  const color = check.pass ? "#10b981" : check.warn ? "#f59e0b" : "#ef4444";
  return (
    <Tooltip
      title={!check.pass ? (
        <Stack direction="row" spacing={0.5} alignItems="flex-start" sx={{ p: 0.3 }}>
          <TipsAndUpdatesIcon sx={{ fontSize: 12, mt: 0.2, flexShrink: 0 }} />
          <Typography variant="caption">{check.tip}</Typography>
        </Stack>
      ) : ""}
      placement="left"
      arrow
    >
      <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ py: 0.5, px: 0.5, borderRadius: 1, cursor: check.pass ? "default" : "help", "&:hover": { bgcolor: check.pass ? "transparent" : "rgba(0,0,0,0.03)" } }}>
        <Icon sx={{ fontSize: 13, color, mt: 0.2, flexShrink: 0 }} />
        <Typography variant="caption" sx={{ color: check.pass ? "#64748b" : "#1e293b", lineHeight: 1.4, fontWeight: check.pass ? 400 : 600, fontSize: "0.7rem" }}>
          {check.label}
        </Typography>
      </Stack>
    </Tooltip>
  );
}

export default function SeoAnalyzerPanel({ formData = {}, seoMeta = {} }) {
  const groups = useMemo(() => buildChecks(formData, seoMeta), [formData, seoMeta]);
  const score = useMemo(() => computeScore(groups), [groups]);

  const scoreColor = score >= 90 ? "#10b981" : score >= 70 ? "#3b82f6" : score >= 50 ? "#f59e0b" : "#ef4444";
  const muiColor = score >= 90 ? "success" : score >= 70 ? "info" : score >= 50 ? "warning" : "error";
  const scoreLabel = score >= 90 ? "Excellent — Ready to Publish!" : score >= 70 ? "Good — Minor improvements needed" : score >= 50 ? "Fair — Needs more work" : "Poor — Not ready for Google News";
  const totalChecks = groups.flatMap((g) => g.checks).length;
  const passedChecks = groups.flatMap((g) => g.checks).filter((c) => c.pass).length;

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, background: `linear-gradient(135deg, ${scoreColor}22, ${scoreColor}55)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SearchIcon sx={{ fontSize: 16, color: scoreColor }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#0f172a", lineHeight: 1.1, fontSize: "0.85rem" }}>SEO Analyzer</Typography>
          <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.6rem" }}>{passedChecks}/{totalChecks} checks passed</Typography>
        </Box>
        <Chip label={`${score}%`} size="small" color={muiColor} sx={{ fontWeight: 900, fontSize: "0.8rem", height: 26, minWidth: 52 }} />
      </Stack>

      <LinearProgress variant="determinate" value={score} color={muiColor} sx={{ height: 8, borderRadius: 4, mb: 0.8, bgcolor: `${scoreColor}18` }} />
      <Typography variant="caption" fontWeight={700} sx={{ color: scoreColor, display: "block", mb: 2.5, fontSize: "0.65rem" }}>{scoreLabel}</Typography>

      <Stack spacing={1.5}>
        {groups.map((group) => {
          const gPassed = group.checks.filter((c) => c.pass).length;
          return (
            <Box key={group.label}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.4 }}>
                <Typography variant="caption" fontWeight={800} sx={{ color: "#64748b", fontSize: "0.6rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {group.icon} {group.label}
                </Typography>
                <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.58rem" }}>{gPassed}/{group.checks.length}</Typography>
              </Stack>
              <Box sx={{ borderLeft: "2px solid #f1f5f9", pl: 1.5 }}>
                {group.checks.map((check) => <CheckRow key={check.id} check={check} />)}
              </Box>
            </Box>
          );
        })}
      </Stack>

      <Divider sx={{ my: 2, borderColor: "#f1f5f9" }} />
      {score < 70 && (
        <Box sx={{ bgcolor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 2, p: 1.5 }}>
          <Stack direction="row" gap={1} alignItems="flex-start">
            <WarningAmberIcon sx={{ fontSize: 15, color: "#f97316", mt: 0.1, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: "#92400e", lineHeight: 1.5, fontSize: "0.68rem" }}>
              <strong>Google News:</strong> Score must be 70%+ before publishing. Hover ❌ items for fix tips.
            </Typography>
          </Stack>
        </Box>
      )}
      {score >= 70 && score < 90 && (
        <Box sx={{ bgcolor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 2, p: 1.5 }}>
          <Stack direction="row" gap={1} alignItems="flex-start">
            <TipsAndUpdatesIcon sx={{ fontSize: 15, color: "#3b82f6", mt: 0.1, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: "#1e40af", lineHeight: 1.5, fontSize: "0.68rem" }}>
              <strong>Almost there!</strong> Fix remaining items to reach 90%+ for maximum Google News visibility.
            </Typography>
          </Stack>
        </Box>
      )}
      {score >= 90 && (
        <Box sx={{ bgcolor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 2, p: 1.5 }}>
          <Stack direction="row" gap={1} alignItems="flex-start">
            <CheckCircleIcon sx={{ fontSize: 15, color: "#10b981", mt: 0.1, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: "#065f46", lineHeight: 1.5, fontSize: "0.68rem" }}>
              <strong>Excellent!</strong> This article meets Google News SEO standards. Ready to publish!
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
