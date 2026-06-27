import { getAllNews } from "@/utils/getAllNews";
import HomeClient from "./HomeClient";
import { getSiteSettings } from "@/lib/firestore";
import {
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_URL,
  SITE_TWITTER_HANDLE,
  SITE_KEYWORDS,
  DEFAULT_OG_IMAGE,
  SITE_LOGO,
} from "@/lib/site";

export const revalidate = 60; // ISR: refresh home page every 60 seconds

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || SITE_NAME;
  const siteDescription = settings?.siteDescription || SITE_DESCRIPTION;
  const ogImage = settings?.ogImage || DEFAULT_OG_IMAGE;

  return {
    title: `${siteName} | Latest News & Analysis`,
    description: siteDescription,
    keywords: SITE_KEYWORDS,
    alternates: { canonical: "/" },
    openGraph: {
      title: `${siteName} | Latest News & Analysis`,
      description: siteDescription,
      url: SITE_URL,
      siteName,
      type: "website",
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
      card: "summary_large_image",
      site: SITE_TWITTER_HANDLE,
      title: `${siteName} | Latest News & Analysis`,
      description: siteDescription,
      images: [ogImage],
    },
  };
}

export default async function HomePage() {
  const [response, settings] = await Promise.all([
    getAllNews(),
    getSiteSettings(),
  ]);

  const allNews = response.status ? response.data : [];
  const error = !response.status ? response.message : null;
  const siteName = settings?.siteName || SITE_NAME;
  const siteDescription = settings?.siteDescription || SITE_DESCRIPTION;
  const ogImage = settings?.ogImage || DEFAULT_OG_IMAGE;

  // ── WebPage JSON-LD for the homepage ──────────────────────────────────────
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    url: SITE_URL,
    name: `${siteName} | Latest News & Analysis`,
    description: siteDescription,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
      ],
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: ogImage,
      contentUrl: ogImage,
      width: 1200,
      height: 630,
    },
  };

  // ── ItemList JSON-LD — latest 5 articles for rich snippets ────────────────
  const itemListSchema =
    allNews.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Latest News from ${siteName}`,
          url: SITE_URL,
          numberOfItems: Math.min(allNews.length, 10),
          itemListElement: allNews.slice(0, 10).map((article, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/news/${encodeURIComponent(article.id || article._id)}`,
            name: article.title,
          })),
        }
      : null;

  return (
    <>
      <script
        id="homepage-webpage-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      {itemListSchema && (
        <script
          id="homepage-itemlist-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      <HomeClient allNews={allNews} error={error} />
    </>
  );
}
