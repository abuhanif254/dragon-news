import { getSingleNews } from "@/utils/getSingleNews";
import { getAllNews } from "@/utils/getAllNews";
import { incrementViews } from "@/lib/firestore";
import NewsDetailClient from "./NewsDetailClient";
import Script from "next/script";
import { notFound } from "next/navigation";
import { absoluteImage, articlePath, articleUrl, authorUrl, SITE_NAME } from "@/lib/site";
import { createExcerpt, toIsoDate } from "@/lib/content-utils";

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

  return {
    title: news.title,
    description,
    alternates: {
      canonical: articlePath(news),
    },
    openGraph: {
      title: news.title,
      description,
      url: articleUrl(news),
      siteName: SITE_NAME,
      images: [{ url: image, alt: news.title }],
      type: "article",
      publishedTime: toIsoDate(news.publishedAt || news.author?.published_date),
      modifiedTime: toIsoDate(news.updatedAt || news.publishedAt || news.author?.published_date),
      authors: [authorUrl(news.author?.name)],
      tags: [news.category],
    },
    twitter: {
      card: "summary_large_image",
      title: news.title,
      description,
      images: [image],
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
  await incrementViews(newsId);

  const allResponse = await getAllNews({ includeFallback: false });
  const related = allResponse.status
    ? allResponse.data
        .filter((item) => item.category === news.category && (item.id || item._id) !== newsId)
        .slice(0, 3)
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl(news),
    },
    headline: news.title,
    description: createExcerpt(news.details, 160),
    image: [absoluteImage(news.image_url || news.thumbnail_url)],
    datePublished: toIsoDate(news.publishedAt || news.author?.published_date),
    dateModified: toIsoDate(news.updatedAt || news.publishedAt || news.author?.published_date),
    articleSection: news.category,
    author: [
      {
        "@type": "Person",
        name: news.author?.name || "The Brain Editorial Team",
        url: authorUrl(news.author?.name),
      },
    ],
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteImage("/the-brain-logo.png"),
      },
    },
  };

  return (
    <>
      <Script
        id="news-article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NewsDetailClient news={news} related={related} />
    </>
  );
}
