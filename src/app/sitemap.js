import { getAllNews } from "@/utils/getAllNews";
import { articleUrl, authorUrl, SITE_URL } from "@/lib/site";
import { parseDate } from "@/lib/content-utils";

export const revalidate = 3600; // Re-generate sitemap at most once per hour

export default async function sitemap() {
  const newsResponse = await getAllNews({ includeFallback: false });
  const newsData = newsResponse.status ? newsResponse.data : [];

  // ── Unique categories and authors ──────────────────────────────────────────
  const categories = [
    ...new Set(newsData.map((news) => news.category).filter(Boolean)),
  ];
  const authors = [
    ...new Set(newsData.map((news) => news.author?.name).filter(Boolean)),
  ];

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticEntries = [
    { path: "",          changeFrequency: "daily",   priority: 1.0 },
    { path: "/news",     changeFrequency: "hourly",  priority: 0.9 },
    { path: "/about",    changeFrequency: "monthly", priority: 0.6 },
    { path: "/contact",  changeFrequency: "monthly", priority: 0.5 },
    { path: "/pages",    changeFrequency: "weekly",  priority: 0.6 },
    { path: "/privacy-policy", changeFrequency: "yearly",  priority: 0.3 },
    { path: "/terms",          changeFrequency: "yearly",  priority: 0.3 },
    { path: "/cookies",        changeFrequency: "yearly",  priority: 0.3 },
  ].map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  // ── Category pages ────────────────────────────────────────────────────────
  // Use a static page path for categories (SEO-friendly, no query params)
  const categoryEntries = [
    // "All news" catch-all
    {
      url: `${SITE_URL}/categories/news?category=all-news`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.85,
    },
    // Individual categories
    ...categories.map((category) => ({
      url: `${SITE_URL}/categories/news?category=${encodeURIComponent(
        category.toLowerCase()
      )}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.75,
    })),
  ];

  // ── Author pages ──────────────────────────────────────────────────────────
  const authorEntries = authors.map((name) => ({
    url: authorUrl(name),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // ── Article pages ─────────────────────────────────────────────────────────
  const newsEntries = newsData.map((news) => ({
    url: articleUrl(news),
    lastModified:
      parseDate(news.updatedAt || news.publishedAt || news.author?.published_date) ||
      new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [
    ...staticEntries,
    ...categoryEntries,
    ...authorEntries,
    ...newsEntries,
  ];
}
