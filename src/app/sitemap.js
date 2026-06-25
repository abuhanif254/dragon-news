import { getAllNews } from "@/utils/getAllNews";
import { articleUrl, SITE_URL } from "@/lib/site";
import { parseDate } from "@/lib/content-utils";

export default async function sitemap() {
  const newsResponse = await getAllNews({ includeFallback: false });
  const newsData = newsResponse.status ? newsResponse.data : [];

  const categories = [...new Set(newsData.map((news) => news.category).filter(Boolean))];

  const staticEntries = [
    ["", "daily", 1],
    ["/news", "hourly", 0.9],
    ["/categories/news?category=all-news", "daily", 0.8],
    ["/about", "monthly", 0.5],
    ["/contact", "monthly", 0.5],
    ["/privacy-policy", "yearly", 0.3],
    ["/terms", "yearly", 0.3],
    ["/cookies", "yearly", 0.3],
  ].map(([path, changeFrequency, priority]) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  const categoryEntries = categories.map((category) => ({
    url: `${SITE_URL}/categories/news?category=${encodeURIComponent(category.toLowerCase())}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const newsEntries = newsData.map((news) => ({
    url: articleUrl(news),
    lastModified: parseDate(news.updatedAt || news.publishedAt || news.author?.published_date) || new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...categoryEntries, ...newsEntries];
}
