import { getSingleNews } from "@/utils/getSingleNews";
import { getAllNews } from "@/utils/getAllNews";
import { incrementViews } from "@/lib/firestore";
import NewsDetailClient from "./NewsDetailClient";
import { notFound } from "next/navigation";
import {
  absoluteImage,
  articlePath,
  articleUrl,
  authorUrl,
  SITE_NAME,
  SITE_URL,
  SITE_TWITTER_HANDLE,
  SITE_LOGO,
} from "@/lib/site";
import { createExcerpt, toIsoDate } from "@/lib/content-utils";

export const revalidate = 300; // ISR: revalidate article pages every 5 minutes

export async function generateStaticParams() {
  // Pre-render the most recent 20 articles at build time
  const response = await getAllNews({ includeFallback: false });
  const articles = response.status ? response.data.slice(0, 20) : [];
  return articles.map((a) => ({ newsId: a.id || a._id }));
}

export async function generateMetadata({ params }) {
  const { newsId } = await params;
  const newsResponse = await getSingleNews(newsId);

  if (!newsResponse.status || !newsResponse.data) {
    return {
      title: `Article Not Found | ${SITE_NAME}`,
      robots: { index: false, follow: false },
    };
  }

  const news = newsResponse.data;
  const description = createExcerpt(news.details, 160);
  const image = absoluteImage(news.image_url || news.thumbnail_url);
  const publishedTime = toIsoDate(news.publishedAt || news.author?.published_date);
  const modifiedTime = toIsoDate(
    news.updatedAt || news.publishedAt || news.author?.published_date
  );

  // Dynamically extract keyword search terms from the article title (excluding short/stop words)
  const titleWords = news.title
    ? news.title
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3 && !["with", "this", "that", "from", "their", "about", "your", "them", "then", "will"].includes(w))
    : [];
  const dynamicKeywords = Array.from(new Set([news.category, SITE_NAME, ...titleWords])).slice(0, 10);

  return {
    title: news.title,
    description,
    keywords: dynamicKeywords,

    // ── Canonical ──
    alternates: {
      canonical: articlePath(news),
    },

    // ── Open Graph (Article) ──
    openGraph: {
      title: news.title,
      description,
      url: articleUrl(news),
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: news.title,
          type: "image/jpeg",
        },
      ],
      type: "article",
      locale: "en_US",
      publishedTime,
      modifiedTime,
      authors: [authorUrl(news.author?.name)],
      tags: [news.category, SITE_NAME],
      section: news.category,
    },

    // ── Twitter / X ──
    twitter: {
      card: "summary_large_image",
      site: SITE_TWITTER_HANDLE,
      creator: SITE_TWITTER_HANDLE,
      title: news.title,
      description,
      images: [{ url: image, alt: news.title }],
    },

    // ── Robots ──
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function NewsDetailPage({ params }) {
  const { newsId } = await params;
  const newsResponse = await getSingleNews(newsId);

  if (!newsResponse.status || !newsResponse.data) {
    notFound();
  }

  const news = newsResponse.data;

  // Fire-and-forget view increment (non-blocking)
  incrementViews(newsId).catch(() => {});

  // Smart Recommendation Algorithm:
  // 1. Same category first
  // 2. Same author fallback
  // 3. Most popular / recent articles as final fallback
  const allResponse = await getAllNews({ includeFallback: false });
  const relatedList = [];
  if (allResponse.status) {
    // Same category (excluding current)
    const sameCategory = allResponse.data.filter(
      (item) =>
        item.category === news.category &&
        (item.id || item._id) !== newsId
    );
    relatedList.push(...sameCategory);

    // Same author (excluding current, no duplicates)
    if (relatedList.length < 3) {
      const sameAuthor = allResponse.data.filter(
        (item) =>
          item.author?.name === news.author?.name &&
          (item.id || item._id) !== newsId &&
          !relatedList.some((r) => (r.id || r._id) === (item.id || item._id))
      );
      relatedList.push(...sameAuthor);
    }

    // General fallback: popular reads (excluding current, no duplicates)
    if (relatedList.length < 3) {
      const popularFallback = allResponse.data
        .filter(
          (item) =>
            (item.id || item._id) !== newsId &&
            !relatedList.some((r) => (r.id || r._id) === (item.id || item._id))
        )
        .sort((a, b) => (b.total_view || 0) - (a.total_view || 0));
      relatedList.push(...popularFallback);
    }
  }
  const related = relatedList.slice(0, 3);

  // ── NewsArticle JSON-LD (full Google News spec) ──────────────────────────
  const publishedIso = toIsoDate(news.publishedAt || news.author?.published_date);
  const modifiedIso = toIsoDate(
    news.updatedAt || news.publishedAt || news.author?.published_date
  );
  const imageUrl = absoluteImage(news.image_url || news.thumbnail_url);
  const articleFullUrl = articleUrl(news);

  // Estimate word count from stripped HTML for Google's wordCount property
  const plainText = (news.details || "").replace(/<[^>]+>/g, " ").trim();
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${articleFullUrl}#article`,

    // ── Content ──
    headline: news.title,
    description: createExcerpt(news.details, 160),
    articleSection: news.category,
    articleBody: plainText.slice(0, 500), // Truncated for schema brevity
    wordCount,
    inLanguage: "en",
    keywords: [news.category, SITE_NAME].join(", "),
    isAccessibleForFree: "True",

    // ── Dates ──
    datePublished: publishedIso,
    dateModified: modifiedIso,

    // ── Images ──
    image: {
      "@type": "ImageObject",
      url: imageUrl,
      contentUrl: imageUrl,
      width: 1200,
      height: 630,
      caption: news.title,
    },

    // ── Author (E-E-A-T) ──
    author: [
      {
        "@type": "Person",
        name: news.author?.name || "The Brain Editorial Team",
        url: authorUrl(news.author?.name),
      },
    ],

    // ── Publisher ──
    publisher: {
      "@type": "NewsMediaOrganization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: SITE_LOGO,
        width: 512,
        height: 512,
      },
    },

    // ── Speakable (for Google Assistant / audio) ──
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["article h1", ".article-prose p:first-of-type"],
    },

    // ── Page reference ──
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleFullUrl,
    },

    // ── Breadcrumbs ──
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: news.category,
          item: `${SITE_URL}/categories/news?category=${encodeURIComponent(
            (news.category || "").toLowerCase()
          )}`,
        },
        { "@type": "ListItem", position: 3, name: news.title },
      ],
    },
  };

  return (
    <>
      <script
        id="news-article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NewsDetailClient news={news} related={related} />
    </>
  );
}
