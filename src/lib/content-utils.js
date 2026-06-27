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
