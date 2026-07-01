import { getSiteSettings } from "@/lib/firestore";
import AboutClient from "./AboutClient";

export const revalidate = 60;

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || "The Brain";
  const title = "About Us";
  const description = `Learn more about ${siteName}, our editorial policies, ownership, and the team behind our independent journalism.`;

  return {
    title: `${title} | ${siteName}`,
    description,
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
    }
  };
}

export default async function AboutPage() {
  return <AboutClient />;
}
