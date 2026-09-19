import { getAllNews } from "@/utils/getAllNews";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
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

  return <NewsPageClient allNews={allNews} error={error} />;
}
