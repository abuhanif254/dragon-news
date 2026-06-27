import { NextResponse } from "next/server";
import { getAllNews } from "@/utils/getAllNews";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.toLowerCase() || "";
    const category = searchParams.get("category") || "";
    const author = searchParams.get("author") || "";
    const date = searchParams.get("date") || "";

    const { status, data: allNews } = await getAllNews({ includeFallback: false });

    if (!status) {
      return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
    }

    let results = allNews;

    // Filter by search term
    if (q) {
      results = results.filter(
        (news) =>
          news.title?.toLowerCase().includes(q) ||
          news.category?.toLowerCase().includes(q) ||
          news.details?.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (category) {
      results = results.filter((news) => news.category === category);
    }

    // Filter by author
    if (author) {
      results = results.filter((news) => news.author?.name === author);
    }

    // Filter by date (rough match on YYYY-MM-DD or similar string format)
    if (date) {
      results = results.filter((news) => {
        if (!news.publishedAt && !news.author?.published_date) return false;
        const articleDate = news.publishedAt || news.author?.published_date;
        return articleDate.startsWith(date);
      });
    }

    // Sort by most recent
    results.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

    return NextResponse.json(
      { results },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
        },
      }
    );
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
