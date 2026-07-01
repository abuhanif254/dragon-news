import "./globals.css";
import { ThemeContextProvider } from "@/theme/ThemeContextProvider";
import { LayoutWrapper } from "@/components/shared/LayoutWrapper";
import { SiteSettingsProvider } from "@/components/shared/SiteSettingsProvider";
import { Inter, Playfair_Display } from "next/font/google";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ToastProvider } from "@/context/ToastContext";
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  SITE_LOCALE,
  SITE_TWITTER_HANDLE,
  SITE_KEYWORDS,
  GOOGLE_SITE_VERIFICATION,
  BING_SITE_VERIFICATION,
  ADMIN_EMAIL,
  SITE_LOGO,
} from "@/lib/site";


const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ['300', '400', '500', '600', '700', '800', '900']
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  style: ['normal', 'italic'],
  weight: ['400', '600', '700', '900']
});

export async function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#ffffff" },
      { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
    ],
  };
}

export async function generateMetadata() {
  const { getSiteSettings } = await import("@/lib/firestore");
  const settings = await getSiteSettings();

  const siteName = settings?.siteName || SITE_NAME;
  const siteTagline = settings?.siteTagline || SITE_TAGLINE;
  const siteDescription = settings?.siteDescription || SITE_DESCRIPTION;
  const ogImage = settings?.ogImage || DEFAULT_OG_IMAGE;

  return {
    metadataBase: new URL(SITE_URL),

    // ── Titles ──
    title: {
      default: `${siteName} | ${siteTagline}`,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    keywords: SITE_KEYWORDS,
    applicationName: siteName,
    authors: [{ name: siteName, url: SITE_URL }],
    generator: "Next.js",
    referrer: "origin-when-cross-origin",

    // ── Canonical & Alternates ──
    alternates: {
      canonical: "/",
      types: {
        "application/rss+xml": [
          { url: "/rss.xml", title: `${siteName} RSS Feed` },
        ],
      },
    },

    // ── Open Graph ──
    openGraph: {
      type: "website",
      locale: SITE_LOCALE,
      url: SITE_URL,
      siteName: siteName,
      title: `${siteName} | ${siteTagline}`,
      description: siteDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${siteName} — ${siteTagline}`,
          type: "image/png",
        },
      ],
    },

    // ── Twitter / X ──
    twitter: {
      card: "summary_large_image",
      site: SITE_TWITTER_HANDLE,
      creator: SITE_TWITTER_HANDLE,
      title: `${siteName} | ${siteTagline}`,
      description: siteDescription,
      images: [{ url: ogImage, alt: `${siteName} — ${siteTagline}` }],
    },

    // ── Robots ──
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    // ── Verification ──
    verification: {
      ...(GOOGLE_SITE_VERIFICATION && { google: GOOGLE_SITE_VERIFICATION }),
      ...(BING_SITE_VERIFICATION && { other: { "msvalidate.01": BING_SITE_VERIFICATION } }),
    },

    // ── Icons ──
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", type: "image/png", sizes: "32x32" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
      shortcut: "/favicon.ico",
    },

    // ── Manifest & Theme ──
    manifest: "/manifest.json",

    // ── Misc ──
    category: "news",
    classification: "News & Media",
    formatDetection: { telephone: false, email: false, address: false },
  };
}

// ── WebSite + Organization JSON-LD (site-wide, rendered once in root layout) ──
function SiteJsonLd({ siteName, siteDescription, ogImage }) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: siteName,
    description: siteDescription,
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: siteName,
    url: SITE_URL,
    description: siteDescription,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: ogImage,
      contentUrl: ogImage,
      width: 512,
      height: 512,
      caption: siteName,
    },
    image: { "@id": `${SITE_URL}/#logo` },
    sameAs: [
      `https://x.com/${SITE_TWITTER_HANDLE.replace("@", "")}`,
      `https://www.facebook.com/bitulla`,
      `https://www.youtube.com/@MohammadBitullah`,
      `https://www.instagram.com/bitullah_aj`,
      `https://www.linkedin.com/in/md-abu-hanif-mia`,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: ADMIN_EMAIL,
      contactType: "editorial",
      availableLanguage: ["en"],
    },
    publishingPrinciples: `${SITE_URL}/about`,
    ethicsPolicy: `${SITE_URL}/about`,
    correctionsPolicy: `${SITE_URL}/contact`,
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [websiteSchema, organizationSchema],
  };

  return (
    <script
      id="site-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
    />
  );
}

export default async function RootLayout({ children }) {
  const { getSiteSettings } = await import("@/lib/firestore");
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || SITE_NAME;
  const siteDescription = settings?.siteDescription || SITE_DESCRIPTION;
  const ogImage = settings?.ogImage || DEFAULT_OG_IMAGE;

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* ── Preconnect for performance ── */}
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://storage.googleapis.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        
        {/* ── Viewport (explicit for older browsers) ── */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

        {/* ── Site-wide JSON-LD ── */}
        <SiteJsonLd
          siteName={siteName}
          siteDescription={siteDescription}
          ogImage={ogImage}
        />
      </head>
      <body style={{ fontFamily: "var(--font-inter)", margin: 0 }}>
        <AppRouterCacheProvider>
          <ThemeContextProvider>
            <ToastProvider>
              <SiteSettingsProvider>
                <LayoutWrapper>{children}</LayoutWrapper>
              </SiteSettingsProvider>
            </ToastProvider>
          </ThemeContextProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
