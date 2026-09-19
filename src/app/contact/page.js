import { Box, Typography } from "@mui/material";
import { getPage, getSiteSettings } from "@/lib/firestore";
import ContactContent from "./ContactContent";
import { createExcerpt } from "@/lib/content-utils";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export async function generateMetadata() {
  const [pageData, settings] = await Promise.all([
    getPage("contact"),
    getSiteSettings()
  ]);

  const siteName = settings?.siteName || SITE_NAME;
  const title = pageData?.title || "Contact Us";
  const rawContent = pageData?.content || "";
  const description = createExcerpt(rawContent, 160) || `Get in touch with ${siteName}.`;
  const canonicalUrl = `${SITE_URL}/contact`;
  const ogImageUrl = `${SITE_URL}/api/og?title=${encodeURIComponent("Get in Touch with Our Editorial Team")}&category=Contact`;

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
          alt: `Contact ${siteName}`,
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

export default async function ContactPage() {
  const [pageData, settings] = await Promise.all([
    getPage("contact"),
    getSiteSettings()
  ]);
  const siteName = settings?.siteName || SITE_NAME;
  const title = pageData?.title || "Contact The Brain";
  const canonicalUrl = `${SITE_URL}/contact`;

  const contactSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: `${title} | ${siteName}`,
        description: `Get in touch with ${siteName} for editorial inquiries, confidential tips, press releases, or support.`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Contact Us", item: canonicalUrl },
          ],
        },
      },
      {
        "@type": "NewsMediaOrganization",
        "@id": `${SITE_URL}/#organization`,
        name: siteName,
        url: SITE_URL,
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: "+880 1724 010261",
            contactType: "customer support",
            email: "mohammadbitullah@gmail.com",
            availableLanguage: ["en", "bn"],
          },
          {
            "@type": "ContactPoint",
            email: "editors@thebrain.com",
            contactType: "newsroom",
            availableLanguage: ["en", "bn"],
          },
        ],
        address: {
          "@type": "PostalAddress",
          streetAddress: "2300 Kishoreganj Sadar",
          addressLocality: "Kishoreganj",
          addressRegion: "Dhaka",
          addressCountry: "BD",
        },
      },
    ],
  };

  return (
    <>
      <script
        id="contact-page-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <Box sx={{ mb: 8 }}>
        {/* Hero */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #c0392b 100%)",
            borderRadius: { xs: 0, md: 3 },
            px: { xs: 3, md: 8 },
            py: { xs: 5, md: 7 },
            mb: 7,
            mt: 4,
            textAlign: "center",
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.2em", display: "block", mb: 1 }}
          >
            Get In Touch
          </Typography>
          <Typography
            variant="h3"
            fontWeight={900}
            sx={{
              fontFamily: "'Playfair Display', serif",
              color: "white",
              fontSize: { xs: "1.8rem", md: "2.8rem" },
              mb: 2,
            }}
          >
            {title}
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", maxWidth: 500, mx: "auto", lineHeight: 1.8 }}>
            Have a tip, feedback, or partnership inquiry? Our editorial team would love to hear from you.
          </Typography>
        </Box>

        {/* Client Component handles interaction and rich text rendering securely */}
        <ContactContent pageData={pageData} />
      </Box>
    </>
  );
}
