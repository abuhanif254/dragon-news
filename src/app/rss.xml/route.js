import { NextResponse } from "next/server";
import { getAllNews } from "@/utils/getAllNews";
import { absoluteImage, articleUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { cdata, createExcerpt, escapeXml, toRssDate } from "@/lib/content-utils";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const newsResponse = await getAllNews({ includeFallback: false });
    let newsData = newsResponse.status ? newsResponse.data : [];

    if (category) {
      newsData = newsData.filter(
        (news) => news.category?.toLowerCase() === category.toLowerCase()
      );
    }

    const sortedNews = [...newsData].sort(
      (a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)
    );
    const latestDate = sortedNews[0]?.publishedAt || new Date();

    const rssItemsXml = sortedNews
      .map((news) => {
        const url = articleUrl(news);
        const image = absoluteImage(news.thumbnail_url || news.image_url);

        return `
        <item>
          <title>${cdata(news.title)}</title>
          <link>${escapeXml(url)}</link>
          <guid isPermaLink="true">${escapeXml(url)}</guid>
          <pubDate>${toRssDate(news.publishedAt || news.author?.published_date)}</pubDate>
          <category>${cdata(news.category)}</category>
          <description>${cdata(createExcerpt(news.details, 220))}</description>
          <content:encoded>${cdata(news.details)}</content:encoded>
          <dc:creator>${cdata(news.author?.name || "The Brain Editorial Team")}</dc:creator>
          ${image ? `<media:content url="${escapeXml(image)}" medium="image" />` : ""}
        </item>`;
      })
      .join("");

    const feedTitle = category ? `${SITE_NAME} | ${category} News Feed` : `${SITE_NAME} | Atheism Activism Magazine`;
    const selfLink = category ? `${SITE_URL}/rss.xml?category=${encodeURIComponent(category)}` : `${SITE_URL}/rss.xml`;

    const rssFeedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/"
>
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <atom:link href="${escapeXml(selfLink)}" rel="self" type="application/rss+xml" />
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${toRssDate(latestDate)}</lastBuildDate>
    <ttl>60</ttl>
    ${rssItemsXml}
  </channel>
</rss>`;

    return new NextResponse(rssFeedXml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("RSS Feed Error:", error);
    return new NextResponse("Error generating RSS feed", { status: 500 });
  }
}
