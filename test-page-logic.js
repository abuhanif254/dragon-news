const { normalizeArticle, firestoreFieldsToObject, createExcerpt, toIsoDate } = require('./src/lib/content-utils.js');
const { absoluteImage, articlePath, articleUrl, authorUrl, SITE_NAME, SITE_URL, SITE_TWITTER_HANDLE, SITE_LOGO } = require('./src/lib/site.js');
const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('article-data.json', 'utf8'));
const news = normalizeArticle('oYKVx9QCeE8eRXqH0yR4', firestoreFieldsToObject(rawData.fields));

console.log("News normalized successfully.");

// Let's run the generateMetadata logic
function generateMetadata() {
  const seoMeta = news.seoMeta || {};
  const description = seoMeta.metaDescription?.trim()
    ? seoMeta.metaDescription
    : createExcerpt(news.details, 160);

  const image = absoluteImage(news.image_url || news.thumbnail_url);
  const imageAlt = seoMeta.altText?.banner || seoMeta.altText?.thumbnail || news.title;
  const publishedTime = toIsoDate(news.publishedAt || news.author?.published_date);
  const modifiedTime = toIsoDate(
    news.updatedAt || news.publishedAt || news.author?.published_date
  );

  const seoTags = Array.isArray(seoMeta.tags) && seoMeta.tags.length > 0
    ? seoMeta.tags
    : [];
  const titleWords = news.title
    ? news.title
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3 && !["with", "this", "that", "from", "their", "about", "your", "them", "then", "will"].includes(w))
    : [];
  const dynamicKeywords = Array.from(
    new Set([
      ...(seoMeta.focusKeyword ? [seoMeta.focusKeyword] : []),
      ...seoTags,
      news.category,
      SITE_NAME,
      ...titleWords,
    ])
  ).slice(0, 15);

  const canonicalPath = seoMeta.slug?.trim()
    ? `/news/${seoMeta.slug}`
    : articlePath(news);
    
  return "metadata generated";
}

generateMetadata();
console.log("Metadata generated successfully.");

// Let's run the jsonLD logic
function generateJsonLd() {
  const publishedIso = toIsoDate(news.publishedAt || news.author?.published_date);
  const modifiedIso = toIsoDate(
    news.updatedAt || news.publishedAt || news.author?.published_date
  );
  const imageUrl = absoluteImage(news.image_url || news.thumbnail_url);
  const articleFullUrl = articleUrl(news);

  const plainText = (news.details || "").replace(/<[^>]+>/g, " ").trim();
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  const seoMeta = news.seoMeta || {};
  const seoTags = Array.isArray(seoMeta.tags) && seoMeta.tags.length > 0 ? seoMeta.tags : [];
  const allKeywords = Array.from(new Set([
    ...(seoMeta.focusKeyword ? [seoMeta.focusKeyword] : []),
    ...seoTags,
    news.category,
    SITE_NAME,
  ])).join(", ");

  const citations = Array.isArray(seoMeta.sources)
    ? seoMeta.sources
        .filter((s) => s.url?.trim())
        .map((s) => ({
          "@type": "CreativeWork",
          name: s.label || s.url,
          url: s.url,
        }))
    : [];
    
  return "jsonld generated";
}

generateJsonLd();
console.log("JsonLd generated successfully.");
