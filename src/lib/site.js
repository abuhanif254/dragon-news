// ─── Site Identity ────────────────────────────────────────────────────────────
export const SITE_NAME = "The Brain";
export const SITE_TAGLINE = "Atheism Activism Magazine";
export const SITE_DESCRIPTION =
  "The Brain publishes independent news, analysis, and essays for atheism activism, secular values, free inquiry, and humanist public life.";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://blog.nexuscalculator.net"
).replace(/\/+$/, "");

// ─── Locale & Language ────────────────────────────────────────────────────────
export const SITE_LOCALE = "en_US";
export const SITE_LANGUAGE = "en";

// ─── Social & Contact ─────────────────────────────────────────────────────────
export const SITE_TWITTER_HANDLE = "@MohammadBitull1";
export const ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  process.env.ADMIN_EMAIL ||
  "mohammadbitullah@gmail.com"
).toLowerCase();

// ─── SEO Keywords ─────────────────────────────────────────────────────────────
export const SITE_KEYWORDS = [
  "atheism",
  "secular news",
  "humanism",
  "free inquiry",
  "activism",
  "independent journalism",
  "secular values",
  "opinion",
  "analysis",
  "magazine",
];

// ─── Images ───────────────────────────────────────────────────────────────────
export const DEFAULT_OG_IMAGE = `${SITE_URL}/the-brain-logo.png`;
export const SITE_LOGO = `${SITE_URL}/the-brain-logo.png`;

// ─── Verification Tokens (set via env vars for security) ─────────────────────
export const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "";
export const BING_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "";

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function isAdminEmail(email = "") {
  return email.toLowerCase() === ADMIN_EMAIL;
}

export function absoluteUrl(path = "/") {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function absoluteImage(url) {
  if (!url) return DEFAULT_OG_IMAGE;
  if (/^https?:\/\//i.test(url)) return url;
  return absoluteUrl(url);
}

export function articlePath(articleOrId) {
  const id =
    typeof articleOrId === "string"
      ? articleOrId
      : articleOrId?.id || articleOrId?._id || "";
  return `/news/${encodeURIComponent(id)}`;
}

export function articleUrl(articleOrId) {
  return absoluteUrl(articlePath(articleOrId));
}

export function authorPath(name = "") {
  return `/authors/${encodeURIComponent(name || "The Brain Editorial Team")}`;
}

export function authorUrl(name = "") {
  return absoluteUrl(authorPath(name));
}

export function categoryPath(category = "") {
  return `/categories/news?category=${encodeURIComponent(category.toLowerCase())}`;
}

export function categoryUrl(category = "") {
  return absoluteUrl(categoryPath(category));
}
