export const SITE_NAME = "The Brain";
export const SITE_TAGLINE = "Atheism Activism Magazine";
export const SITE_DESCRIPTION =
  "The Brain publishes independent news, analysis, and essays for atheism activism, secular values, free inquiry, and humanist public life.";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://the-brain-news.vercel.app"
).replace(/\/+$/, "");

export const ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  process.env.ADMIN_EMAIL ||
  "mohammadbitullah@gmail.com"
).toLowerCase();

export const DEFAULT_OG_IMAGE = `${SITE_URL}/the-brain-logo.png`;

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
