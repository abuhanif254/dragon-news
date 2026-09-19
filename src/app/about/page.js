import { getSiteSettings } from "@/lib/firestore";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import AboutClient from "./AboutClient";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || SITE_NAME;
  const title = "About Us";
  const description = `Learn more about ${siteName}, our editorial policies, ownership, and the team behind our independent journalism.`;
  const canonicalUrl = `${SITE_URL}/about`;
  const ogImageUrl = `${SITE_URL}/api/og?title=${encodeURIComponent("About Our Editorial Mission")}&category=About`;

  return {
    title: `${title} | ${siteName}`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: canonicalUrl,
      siteName,
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `About ${siteName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function AboutPage() {
  return <AboutClient />;
}
