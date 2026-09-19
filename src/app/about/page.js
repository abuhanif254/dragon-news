import { getSiteSettings } from "@/lib/firestore";
import { SITE_URL, SITE_NAME, SITE_LOGO } from "@/lib/site";
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
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || SITE_NAME;
  const canonicalUrl = `${SITE_URL}/about`;

  const aboutSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: `About ${siteName}`,
        description: `Learn more about ${siteName}, our editorial policies, ownership, and independent journalistic mission.`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "About Us", item: canonicalUrl },
          ],
        },
      },
      {
        "@type": "NewsMediaOrganization",
        "@id": `${SITE_URL}/#organization`,
        name: siteName,
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
        },
      },
    ],
  };

  return (
    <>
      <script
        id="about-page-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <AboutClient />
    </>
  );
}
