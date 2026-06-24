import { getPage, getSiteSettings } from "@/lib/firestore";
import { createExcerpt } from "@/lib/content-utils";
import LegalPageLayout from "@/components/ui/LegalPageLayout";

export const revalidate = 60;

export async function generateMetadata() {
  const [pageData, settings] = await Promise.all([
    getPage("terms"),
    getSiteSettings()
  ]);

  const siteName = settings?.siteName || "The Brain";
  const title = pageData?.title || "Terms of Service";
  const rawContent = pageData?.content || "";
  const description = createExcerpt(rawContent, 160) || `Terms of Service for ${siteName}.`;

  return {
    title: `${title} | ${siteName}`,
    description,
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
    }
  };
}

export default async function TermsPage() {
  const pageData = await getPage("terms");
  
  const title = pageData?.title || "Terms of Service";
  const content = pageData?.content || "<p>Welcome to The Brain. This page has not been published yet.</p>";
  const lastUpdated = pageData?.updatedAt ? new Date(pageData.updatedAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "Recently Updated";

  return <LegalPageLayout title={title} content={content} lastUpdated={lastUpdated} />;
}
