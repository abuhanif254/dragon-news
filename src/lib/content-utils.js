export function decodeHtmlEntities(str = "") {
  return String(str)
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&ldquo;/gi, '"')
    .replace(/&rdquo;/gi, '"')
    .replace(/&lsquo;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&#34;/gi, '"');
}

export function stripHtml(value = "") {
  let clean = String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  
  clean = decodeHtmlEntities(clean);
  
  return clean.replace(/\s+/g, " ").trim();
}

export function createExcerpt(value = "", maxLength = 160) {
  const text = stripHtml(value);
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 80 ? lastSpace : clipped.length).trim()}...`;
}

export function parseDate(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  if (value?.seconds) return new Date(value.seconds * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toIsoDate(value, fallback = new Date()) {
  return (parseDate(value) || parseDate(fallback) || new Date()).toISOString();
}

export function toRssDate(value, fallback = new Date()) {
  return (parseDate(value) || parseDate(fallback) || new Date()).toUTCString();
}

export function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function cdata(value = "") {
  return `<![CDATA[${String(value).replace(/\]\]>/g, "]]]]><![CDATA[>")}]]>`;
}

export function normalizeArticle(id, data = {}) {
  const author = data.author || {};
  const createdAt = parseDate(data.createdAt);
  const updatedAt = parseDate(data.updatedAt);
  const publishedAt =
    parseDate(data.publishedAt) ||
    parseDate(author.published_date) ||
    createdAt ||
    updatedAt ||
    new Date();

  return {
    id,
    _id: id,
    title: data.title || "Untitled",
    details: data.details || "",
    image_url: data.image_url || data.imageUrl || data.thumbnail_url || "",
    thumbnail_url: data.thumbnail_url || data.image_url || data.imageUrl || "",
    category: data.category || "General",
    status: data.status || "approved",
    total_view: Number(data.total_view || 0),
    rating: data.rating || { number: 5, badge: "Editorial" },
    sources: Array.isArray(data.sources) ? data.sources : [],
    createdAt: createdAt?.toISOString?.() || data.createdAt || null,
    updatedAt: updatedAt?.toISOString?.() || data.updatedAt || null,
    publishedAt: publishedAt.toISOString(),
    createdBy: data.createdBy || author.uid || "",
    author: {
      uid: author.uid || data.createdBy || "",
      email: author.email || "",
      name: author.name || data.authorName || "The Brain Editorial Team",
      published_date: author.published_date || publishedAt.toISOString().slice(0, 10),
      img: author.img || data.authorImage || "",
    },
  };
}

function firestorePrimitive(value = {}) {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) {
    return (value.arrayValue.values || []).map(firestorePrimitive);
  }
  if ("mapValue" in value) {
    return firestoreFieldsToObject(value.mapValue.fields || {});
  }
  return undefined;
}

export function firestoreFieldsToObject(fields = {}) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, firestorePrimitive(value)])
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SEO Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a string into a URL-safe slug.
 * e.g. "Hello World! 123" → "hello-world-123"
 */
export function generateSlug(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")   // remove non-word chars except hyphens
    .replace(/\s+/g, "-")        // spaces → hyphens
    .replace(/-+/g, "-")         // collapse multiple hyphens
    .replace(/^-+|-+$/g, "")    // trim leading/trailing hyphens
    .slice(0, 80);               // max 80 chars
}

/**
 * Count occurrences of a keyword (case-insensitive, whole-word) in plain text.
 * Returns { count, density } where density is a percentage (0–100).
 */
export function calcKeywordDensity(plainText = "", keyword = "") {
  if (!keyword.trim() || !plainText.trim()) return { count: 0, density: 0 };
  const words = plainText.trim().split(/\s+/);
  const kw = keyword.toLowerCase().trim();
  const count = words.filter((w) => w.toLowerCase().replace(/[^a-z0-9]/g, "") === kw.replace(/[^a-z0-9]/g, "")).length;
  const density = words.length > 0 ? Math.round((count / words.length) * 10000) / 100 : 0;
  return { count, density };
}

/**
 * Calculate a simplified Flesch-Kincaid Reading Ease score (0–100).
 * 60+ = standard, 50–59 = fairly difficult, <50 = difficult.
 */
export function calcReadabilityScore(plainText = "") {
  if (!plainText.trim()) return 0;

  // Split into sentences (by . ! ?)
  const sentences = plainText
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Split into words
  const words = plainText.trim().split(/\s+/).filter(Boolean);

  if (sentences.length === 0 || words.length === 0) return 0;

  // Count syllables (approximation)
  function countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, "");
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");
    const m = word.match(/[aeiouy]{1,2}/g);
    return m ? m.length : 1;
  }

  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const avgSentenceLen = words.length / sentences.length;
  const avgSyllablesPerWord = totalSyllables / words.length;

  // Flesch Reading Ease formula
  const score = 206.835 - 1.015 * avgSentenceLen - 84.6 * avgSyllablesPerWord;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Count internal links (matching the site domain) in HTML content.
 */
export function countInternalLinks(html = "", siteUrl = "") {
  const domain = siteUrl.replace(/https?:\/\//, "").replace(/\/$/, "");
  const matches = html.match(/<a[^>]+href=["'][^"']*["'][^>]*>/gi) || [];
  return matches.filter((tag) => {
    const href = (tag.match(/href=["']([^"']*)["']/) || [])[1] || "";
    return href.startsWith("/") || href.includes(domain);
  }).length;
}

/**
 * Count external (outbound) links in HTML content.
 */
export function countExternalLinks(html = "", siteUrl = "") {
  const domain = siteUrl.replace(/https?:\/\//, "").replace(/\/$/, "");
  const matches = html.match(/<a[^>]+href=["'][^"']*["'][^>]*>/gi) || [];
  return matches.filter((tag) => {
    const href = (tag.match(/href=["']([^"']*)["']/) || [])[1] || "";
    return href.startsWith("http") && !href.includes(domain);
  }).length;
}

/**
 * Check if a keyword appears in the first N words of plain text.
 */
export function keywordInIntro(plainText = "", keyword = "", wordLimit = 100) {
  if (!keyword.trim()) return false;
  const words = plainText.trim().split(/\s+/).slice(0, wordLimit).join(" ").toLowerCase();
  return words.includes(keyword.toLowerCase().trim());
}

/**
 * Check if a keyword appears in any H2 or H3 heading in HTML.
 */
export function keywordInHeadings(html = "", keyword = "") {
  if (!keyword.trim()) return false;
  const headings = (html.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi) || [])
    .map((h) => stripHtml(h).toLowerCase());
  return headings.some((h) => h.includes(keyword.toLowerCase().trim()));
}

/**
 * Check if inline images in content have alt text attributes.
 * Returns { total, withAlt, ratio }
 */
export function checkInlineImageAlts(html = "") {
  const images = html.match(/<img[^>]+>/gi) || [];
  const withAlt = images.filter((img) => {
    const alt = (img.match(/alt=["']([^"']*)["']/) || [])[1] || "";
    return alt.trim().length > 0;
  });
  return {
    total: images.length,
    withAlt: withAlt.length,
    ratio: images.length > 0 ? withAlt.length / images.length : 1,
  };
}
