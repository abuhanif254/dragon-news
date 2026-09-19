import { getSingleNews } from "@/utils/getSingleNews";
import { getAllNews } from "@/utils/getAllNews";
import { incrementViews } from "@/lib/firestore";
import NewsDetailClient from "./NewsDetailClient";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import { notFound, permanentRedirect } from "next/navigation";
import {
  absoluteImage,
  articlePath,
  articleUrl,
  authorUrl,
  SITE_NAME,
  SITE_URL,
  SITE_TWITTER_HANDLE,
  SITE_LOGO,
  slugify,
} from "@/lib/site";
import { createExcerpt, toIsoDate, generateSlug, isBengali } from "@/lib/content-utils";

export async function generateStaticParams() {
  // Pre-render the most recent 30 articles at build time (both slug and id for instant response)
  const response = await getAllNews({ includeFallback: false });
  const articles = response.status ? response.data.slice(0, 30) : [];
  const params = [];
  for (const a of articles) {
    const slug = a.slug || a.seoMeta?.slug || (a.title ? slugify(a.title) : "");
    if (slug) {
      params.push({ news: "news", newsId: slug });
    }
    if (a.id) {
      params.push({ news: "news", newsId: a.id });
    }
  }
  return params;
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
  const seoMeta = news.seoMeta || {};

  // Use custom meta description if set, otherwise auto-generate from content
  const description = seoMeta.metaDescription?.trim()
    ? seoMeta.metaDescription
    : createExcerpt(news.details, 160);

  const image = absoluteImage(news.image_url || news.thumbnail_url);
  const imageAlt = seoMeta.altText?.banner || seoMeta.altText?.thumbnail || news.title;
  const publishedTime = toIsoDate(news.publishedAt || news.author?.published_date);
  const modifiedTime = toIsoDate(
    news.updatedAt || news.publishedAt || news.author?.published_date
  );

  const isBangla = isBengali(news.title + (news.details || ""));
  const locale = isBangla ? "bn_BD" : "en_US";
  const stopWords = isBangla
    ? ["এবং", "ও", "বা", "কিন্তু", "একটি", "এই", "সেই", "থেকে", "করে", "হলে", "হবে", "আছে", "জন্য"]
    : ["with", "this", "that", "from", "their", "about", "your", "them", "then", "will"];

  // Build keyword list: seoMeta tags first, then fallback to title-extracted words
  const seoTags = Array.isArray(seoMeta.tags) && seoMeta.tags.length > 0
    ? seoMeta.tags
    : [];
  const titleWords = news.title
    ? news.title
        .toLowerCase()
        .replace(/[^\p{L}\p{M}\p{N}\s]/gu, "")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stopWords.includes(w))
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

  const canonicalUrl = articleUrl(news);
  const dynamicOgUrl = `${SITE_URL}/api/og?title=${encodeURIComponent(news.title)}&category=${encodeURIComponent(news.category || "News")}&author=${encodeURIComponent(news.author?.name || SITE_NAME)}`;
  const ogImages = image
    ? [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAlt,
          type: "image/jpeg",
        },
        {
          url: dynamicOgUrl,
          width: 1200,
          height: 630,
          alt: `${news.title} | ${SITE_NAME}`,
        },
      ]
    : [
        {
          url: dynamicOgUrl,
          width: 1200,
          height: 630,
          alt: `${news.title} | ${SITE_NAME}`,
        },
      ];

  return {
    title: news.title,
    description,
    keywords: dynamicKeywords,

    // ── Canonical & Multilingual Alternates ──
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: canonicalUrl,
        bn: canonicalUrl,
        "x-default": canonicalUrl,
      },
    },

    // ── Open Graph (Article) ──
    openGraph: {
      title: news.title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: ogImages,
      type: "article",
      locale,
      publishedTime,
      modifiedTime,
      authors: [authorUrl(news.author?.name)],
      tags: dynamicKeywords.slice(0, 6),
      section: news.category,
    },

    // ── Twitter / X ──
    twitter: {
      card: "summary_large_image",
      site: SITE_TWITTER_HANDLE,
      creator: SITE_TWITTER_HANDLE,
      title: news.title,
      description,
      images: ogImages,
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
  const canonicalSlug = news.slug || (news.title ? slugify(news.title) : "") || news.id;

  // ── HTTP 301/308 Permanent Redirect for Legacy ID URLs ──
  // If the visitor or crawler reached this page via the raw Firestore ID (e.g. /news/L0C5pUh2WeeO4LG0mbTJ)
  // and the article has a semantic slug, permanently redirect to the canonical slug!
  if (newsId === news.id && canonicalSlug && canonicalSlug !== news.id) {
    permanentRedirect(`/news/${encodeURIComponent(canonicalSlug)}`);
  }

  // ── Semantic Content Recommendation Algorithm ──
  // Evaluates tag intersection, focus keyword matches, title word similarity, and category affinity.
  const allResponse = await getAllNews({ includeFallback: false });
  let related = [];
  if (allResponse.status && Array.isArray(allResponse.data)) {
    const currentTags = Array.isArray(news.seoMeta?.tags) ? news.seoMeta.tags.map((t) => t.toLowerCase()) : [];
    const currentFocus = (news.seoMeta?.focusKeyword || "").toLowerCase();
    const currentCategory = (news.category || "").toLowerCase();
    const currentAuthor = (news.author?.name || "").toLowerCase();
    const currentWords = (news.title || "")
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}\s]/gu, "")
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const candidates = allResponse.data
      .filter((item) => (item.id || item._id) !== news.id && (item.id || item._id) !== newsId)
      .map((item) => {
        let score = 0;
        const itemTags = Array.isArray(item.seoMeta?.tags) ? item.seoMeta.tags.map((t) => t.toLowerCase()) : [];
        const itemFocus = (item.seoMeta?.focusKeyword || "").toLowerCase();
        const itemCategory = (item.category || "").toLowerCase();
        const itemAuthor = (item.author?.name || "").toLowerCase();

        // 1. Shared tags: +4 points per tag
        const sharedTags = itemTags.filter((t) => currentTags.includes(t));
        score += sharedTags.length * 4;

        // 2. Focus keyword match: +3 points
        if (currentFocus && itemFocus && currentFocus === itemFocus) {
          score += 3;
        }

        // 3. Same category: +2 points
        if (currentCategory && itemCategory && currentCategory === itemCategory) {
          score += 2;
        }

        // 4. Same author: +1 point
        if (currentAuthor && itemAuthor && currentAuthor === itemAuthor) {
          score += 1;
        }

        // 5. Title word overlaps: +1 point per significant word
        if (currentWords.length > 0) {
          const itemTitleWords = (item.title || "")
            .toLowerCase()
            .replace(/[^\p{L}\p{M}\p{N}\s]/gu, "")
            .split(/\s+/);
          const overlaps = currentWords.filter((w) => itemTitleWords.includes(w));
          score += overlaps.length;
        }

        // Popularity tie-breaker
        const views = Number(item.total_view) || 0;
        score += Math.min(views / 100, 1);

        return { item, score };
      });

    candidates.sort((a, b) => b.score - a.score);
    related = candidates.slice(0, 3).map((c) => c.item);
  }

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
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));
  const timeRequiredIso = `PT${readingTimeMinutes}M`;

  const seoMeta = news.seoMeta || {};
  const seoTags = Array.isArray(seoMeta.tags) && seoMeta.tags.length > 0 ? seoMeta.tags : [];
  const allKeywords = Array.from(new Set([
    ...(seoMeta.focusKeyword ? [seoMeta.focusKeyword] : []),
    ...seoTags,
    news.category,
    SITE_NAME,
  ])).join(", ");

  // Build citation list from seoMeta.sources
  const citations = Array.isArray(seoMeta.sources)
    ? seoMeta.sources
        .filter((s) => s.url?.trim())
        .map((s) => ({
          "@type": "CreativeWork",
          name: s.label || s.url,
          url: s.url,
        }))
    : [];

  const isBangla = isBengali(news.title + (news.details || ""));

  // Google Discover requires 16:9, 4:3, and 1:1 image representations
  const imageCaption = seoMeta.altText?.banner || seoMeta.altText?.thumbnail || news.title;
  const discoverImages = [
    {
      "@type": "ImageObject",
      url: imageUrl,
      contentUrl: imageUrl,
      width: 1200,
      height: 675, // 16:9 aspect ratio
      caption: imageCaption,
    },
    {
      "@type": "ImageObject",
      url: imageUrl,
      contentUrl: imageUrl,
      width: 1200,
      height: 900, // 4:3 aspect ratio
      caption: imageCaption,
    },
    {
      "@type": "ImageObject",
      url: imageUrl,
      contentUrl: imageUrl,
      width: 1200,
      height: 1200, // 1:1 aspect ratio
      caption: imageCaption,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${articleFullUrl}#article`,

    // ── Content ──
    headline: news.title,
    description: seoMeta.metaDescription?.trim() || createExcerpt(news.details, 160),
    articleSection: news.category,
    articleBody: plainText.slice(0, 1000), // Expanded for richer structured data
    wordCount,
    timeRequired: timeRequiredIso,
    inLanguage: isBangla ? "bn" : "en",
    keywords: allKeywords,
    isAccessibleForFree: "True",
    about: [
      { "@type": "Thing", name: news.category },
      ...(seoMeta.focusKeyword ? [{ "@type": "Thing", name: seoMeta.focusKeyword }] : []),
    ],

    // ── Dates ──
    datePublished: publishedIso,
    dateModified: modifiedIso,

    // ── Images (Google Discover compliant: 16:9, 4:3, 1:1) ──
    image: discoverImages,

    // ── Author (E-E-A-T) ──
    author: [
      {
        "@type": "Person",
        name: news.author?.name || "The Brain Editorial Team",
        jobTitle: "Journalist",
        url: authorUrl(news.author?.name),
        sameAs: [authorUrl(news.author?.name)],
        worksFor: {
          "@type": "NewsMediaOrganization",
          "@id": `${SITE_URL}/#organization`,
          name: SITE_NAME,
          url: SITE_URL,
        },
      },
    ],

    // ── Publisher (Full E-E-A-T Transparency Specification) ──
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
      publishingPrinciples: `${SITE_URL}/about`,
      correctionsPolicy: `${SITE_URL}/about#corrections`,
      diversityPolicy: `${SITE_URL}/about#diversity`,
      ethicsPolicy: `${SITE_URL}/terms#ethics`,
      masthead: `${SITE_URL}/about#team`,
      ownershipFundingInfo: `${SITE_URL}/about#funding`,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+880 1724 010261",
        contactType: "newsroom",
        email: "editors@thebrain.com",
        availableLanguage: ["en", "bn"],
      },
    },

    // ── Source Citations (E-E-A-T) ──
    ...(citations.length > 0 && { citation: citations }),

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
          item: `${SITE_URL}/categories/news/${encodeURIComponent(
            (news.category || "").toLowerCase()
          )}`,
        },
        { "@type": "ListItem", position: 3, name: news.title, item: articleFullUrl },
      ],
    },
  };

  // Normalize article content into structured HTML paragraphs if plain text
  const rawDetails = news.details || "";
  const normalizedContent = rawDetails.includes("<") && rawDetails.includes(">")
    ? rawDetails
    : rawDetails
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`)
        .join("");

  const contentNode = <RichTextRenderer content={normalizedContent} />;

  return (
    <>
      <script
        id="news-article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NewsDetailClient news={news} related={related} contentNode={contentNode} />
    </>
  );
}
