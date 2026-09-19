import { getPage, getSiteSettings } from "@/lib/firestore";
import { createExcerpt } from "@/lib/content-utils";
import { SITE_URL } from "@/lib/site";
import LegalPageLayout from "@/components/ui/LegalPageLayout";

export async function generateMetadata() {
  const [pageData, settings] = await Promise.all([
    getPage("terms"),
    getSiteSettings()
  ]);

  const siteName = settings?.siteName || "The Brain";
  const title = pageData?.title || "Terms of Service";
  const rawContent = pageData?.content || "";
  const description = createExcerpt(rawContent, 160) || `Terms of Service for ${siteName}.`;
  const canonicalUrl = `${SITE_URL}/terms`;

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

export default async function TermsPage() {
  const [pageData, settings] = await Promise.all([
    getPage("terms"),
    getSiteSettings()
  ]);
  
  const siteName = settings?.siteName || "The Brain";
  const title = pageData?.title || "Terms of Service";
  const canonicalUrl = `${SITE_URL}/terms`;
  const content = pageData?.content || "<p>Welcome to The Brain. This page has not been published yet.</p>";
  const lastUpdated = pageData?.updatedAt ? new Date(pageData.updatedAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "Recently Updated";

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: `${title} | ${siteName}`,
    description: `Terms of Service and legal agreements for accessing ${siteName}.`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Terms of Service", item: canonicalUrl },
      ],
    },
  };

  return (
    <>
      <script
        id="terms-page-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <LegalPageLayout title={title} content={content} lastUpdated={lastUpdated} />
    </>
  );
}
