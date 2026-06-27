/**
 * JsonLd — Reusable JSON-LD Structured Data Component
 *
 * Renders a <script type="application/ld+json"> tag with the provided schema.
 * Supports multiple schemas by passing an array.
 *
 * Usage:
 *   <JsonLd schema={websiteSchema} />
 *   <JsonLd schema={[websiteSchema, organizationSchema]} />
 */

import Script from "next/script";

export default function JsonLd({ schema, id = "jsonld" }) {
  if (!schema) return null;
  const data = Array.isArray(schema)
    ? { "@context": "https://schema.org", "@graph": schema }
    : schema;

  return (
    <Script
      id={id}
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 0) }}
    />
  );
}

// ─── Schema Builders ──────────────────────────────────────────────────────────

/**
 * WebSite schema — enables Google Sitelinks Search Box
 */
export function buildWebSiteSchema({ siteName, siteUrl, description }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: siteName,
    description,
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Organization schema — establishes publisher identity (E-E-A-T)
 */
export function buildOrganizationSchema({
  siteName,
  siteUrl,
  description,
  logo,
  twitterHandle,
  email,
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": `${siteUrl}/#organization`,
    name: siteName,
    url: siteUrl,
    description,
    logo: {
      "@type": "ImageObject",
      "@id": `${siteUrl}/#logo`,
      url: logo,
      contentUrl: logo,
      width: 512,
      height: 512,
      caption: siteName,
    },
    image: { "@id": `${siteUrl}/#logo` },
    sameAs: [
      twitterHandle ? `https://x.com/${twitterHandle.replace("@", "")}` : null,
      email ? `mailto:${email}` : null,
    ].filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      email,
      contactType: "editorial",
      availableLanguage: ["en"],
    },
    publishingPrinciples: `${siteUrl}/about`,
    ethicsPolicy: `${siteUrl}/about`,
    correctionsPolicy: `${siteUrl}/contact`,
    diversityPolicy: `${siteUrl}/about`,
  };
}

/**
 * NewsArticle schema — full Google News spec
 */
export function buildNewsArticleSchema({
  article,
  siteUrl,
  siteName,
  logo,
}) {
  const { absoluteImage, articleUrl, authorUrl, toIsoDate, createExcerpt } =
    require("@/lib/site");

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${articleUrl(article)}#article`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl(article),
    },
    headline: article.title,
    description: createExcerpt?.(article.details, 160) || "",
    articleSection: article.category,
    inLanguage: "en",
    keywords: article.category,
    image: {
      "@type": "ImageObject",
      url: absoluteImage(article.image_url || article.thumbnail_url),
      width: 1200,
      height: 630,
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: [
      {
        "@type": "Person",
        name: article.author?.name || "The Brain Editorial Team",
        url: authorUrl(article.author?.name),
      },
    ],
    publisher: {
      "@type": "NewsMediaOrganization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: logo,
      },
    },
    isAccessibleForFree: "True",
    isPartOf: {
      "@type": ["CreativeWork", "Product"],
      name: siteName,
      productID: `${siteUrl}:free`,
    },
  };
}

/**
 * Person (Author) schema — E-E-A-T authority signal
 */
export function buildPersonSchema({ name, bio, image, role, social, siteUrl, articles = [] }) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/authors/${encodeURIComponent(name)}#person`,
    name,
    description: bio,
    image: image || null,
    jobTitle: role,
    worksFor: {
      "@type": "NewsMediaOrganization",
      "@id": `${siteUrl}/#organization`,
    },
    url: `${siteUrl}/authors/${encodeURIComponent(name)}`,
    sameAs: [
      social?.twitter || null,
      social?.linkedin || null,
      social?.website || null,
    ].filter(Boolean),
    knowsAbout: articles
      .slice(0, 5)
      .map((a) => a.category)
      .filter(Boolean),
  };
}

/**
 * BreadcrumbList schema — improves article page SERP appearance
 */
export function buildBreadcrumbSchema(items = [], siteUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url ? `${siteUrl}${item.url}` : undefined,
    })),
  };
}
