import { NextResponse } from "next/server";
import { getAllNews } from "@/utils/getAllNews";
import { articleUrl, SITE_NAME } from "@/lib/site";
import { escapeXml, parseDate, toIsoDate } from "@/lib/content-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const newsResponse = await getAllNews({ includeFallback: false });
  const articles = newsResponse.status ? newsResponse.data : [];
  const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000;

  const entries = articles
    .filter((article) => {
      const published = parseDate(article.publishedAt || article.author?.published_date);
      return published && published.getTime() >= twoDaysAgo;
    })
    .map((article) => {
      const published = toIsoDate(article.publishedAt || article.author?.published_date);
      return `
  <url>
    <loc>${escapeXml(articleUrl(article))}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE_NAME)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(published)}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
