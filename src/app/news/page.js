import { getAllNews } from "@/utils/getAllNews";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, articleUrl } from "@/lib/site";
import NewsPageClient from "./NewsPageClient";

export const metadata = {
  title: `Latest Articles | ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/news`,
    types: {
      "application/rss+xml": `${SITE_URL}/rss.xml`,
    },
  },
  openGraph: {
    title: `Latest Articles | ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/news`,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/api/og?title=${encodeURIComponent("Latest Articles & Investigations")}&category=News`,
        width: 1200,
        height: 630,
        alt: `Latest News | ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Latest Articles | ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/api/og?title=${encodeURIComponent("Latest Articles & Investigations")}&category=News`],
  },
};

export default async function AllNewsPage() {
  const response = await getAllNews({ includeFallback: false });
  const allNews = response.status ? response.data : [];
  const error = !response.status ? response.message : "";
  const newsCanonical = `${SITE_URL}/news`;

  const newsListSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${newsCanonical}#webpage`,
        url: newsCanonical,
        name: `Latest Articles & Investigations | ${SITE_NAME}`,
        description: SITE_DESCRIPTION,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "News", item: newsCanonical },
          ],
        },
      },
      {
        "@type": "ItemList",
        name: `Latest Articles from ${SITE_NAME}`,
        numberOfItems: Math.min(allNews.length, 10),
        itemListElement: allNews.slice(0, 10).map((art, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: articleUrl(art),
          name: art.title,
        })),
      },
    ],
  };

  return (
    <>
      <script
        id="all-news-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsListSchema) }}
      />
      <NewsPageClient allNews={allNews} error={error} />
    </>
  );
}
