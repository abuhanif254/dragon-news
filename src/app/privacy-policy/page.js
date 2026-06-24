import { getPage, getSiteSettings } from "@/lib/firestore";
import { createExcerpt } from "@/lib/content-utils";
import LegalPageLayout from "@/components/ui/LegalPageLayout";

export const revalidate = 60;

export async function generateMetadata() {
  const [pageData, settings] = await Promise.all([
    getPage("privacy-policy"),
    getSiteSettings()
  ]);

  const siteName = settings?.siteName || "The Brain";
  const title = pageData?.title || "Privacy Policy";
  const rawContent = pageData?.content || "";
  const description = createExcerpt(rawContent, 160) || `Privacy Policy for ${siteName}.`;

  return {
    title: `${title} | ${siteName}`,
    description,
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
    }
  };
}

export default async function PrivacyPolicyPage() {
  const pageData = await getPage("privacy-policy");
  
  const title = pageData?.title || "Privacy Policy";
  const content = pageData?.content || "<p>Welcome to The Brain. This page has not been published yet.</p>";
  // Format the date if we have one, otherwise just use a placeholder string or nothing
  const lastUpdated = pageData?.updatedAt ? new Date(pageData.updatedAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "Recently Updated";

  return <LegalPageLayout title={title} content={content} lastUpdated={lastUpdated} />;
}
