import { getPage, getSiteSettings } from "@/lib/firestore";
import { createExcerpt } from "@/lib/content-utils";
import { SITE_URL } from "@/lib/site";
import LegalPageLayout from "@/components/ui/LegalPageLayout";

export async function generateMetadata() {
  const [pageData, settings] = await Promise.all([
    getPage("privacy-policy"),
    getSiteSettings()
  ]);

  const siteName = settings?.siteName || "The Brain";
  const title = pageData?.title || "Privacy Policy";
  const rawContent = pageData?.content || "";
  const description = createExcerpt(rawContent, 160) || `Privacy Policy for ${siteName}.`;
  const canonicalUrl = `${SITE_URL}/privacy-policy`;

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
    },
    twitter: {
      card: "summary",
      title: `${title} | ${siteName}`,
      description,
    },
  };
}

export default async function PrivacyPolicyPage() {
  const [pageData, settings] = await Promise.all([
    getPage("privacy-policy"),
    getSiteSettings()
  ]);
  
  const siteName = settings?.siteName || "The Brain";
  const title = pageData?.title || "Privacy Policy";
  const canonicalUrl = `${SITE_URL}/privacy-policy`;
  const content = pageData?.content || "<p>Welcome to The Brain. This page has not been published yet.</p>";
  const lastUpdated = pageData?.updatedAt ? new Date(pageData.updatedAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "Recently Updated";

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: `${title} | ${siteName}`,
    description: `Official Privacy Policy and data protection commitments for ${siteName}.`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Privacy Policy", item: canonicalUrl },
      ],
    },
  };

  return (
    <>
      <script
        id="privacy-policy-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <LegalPageLayout title={title} content={content} lastUpdated={lastUpdated} />
    </>
  );
}
