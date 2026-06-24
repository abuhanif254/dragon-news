import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeContextProvider } from "@/theme/ThemeContextProvider";
import { LayoutWrapper } from "@/components/shared/LayoutWrapper";
import { SiteSettingsProvider } from "@/components/shared/SiteSettingsProvider";
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
});

export async function generateMetadata() {
  const { getSiteSettings } = await import("@/lib/firestore");
  const settings = await getSiteSettings();
  
  const siteName = settings?.siteName || SITE_NAME;
  const siteTagline = settings?.siteTagline || SITE_TAGLINE;
  const siteDescription = settings?.siteDescription || SITE_DESCRIPTION;
  const ogImage = settings?.ogImage || DEFAULT_OG_IMAGE;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${siteName} | ${siteTagline}`,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    applicationName: siteName,
    alternates: {
      canonical: "/",
      types: {
        "application/rss+xml": "/rss.xml",
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      siteName: siteName,
      title: `${siteName} | ${siteTagline}`,
      description: siteDescription,
      images: [{ url: ogImage, alt: `${siteName} logo` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} | ${siteTagline}`,
      description: siteDescription,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    category: "news",
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${playfair.variable} ${inter.className}`}>
        <ThemeContextProvider>
          <SiteSettingsProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </SiteSettingsProvider>
        </ThemeContextProvider>
      </body>
    </html>
  );
}
