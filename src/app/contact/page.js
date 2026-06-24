import { Box, Typography } from "@mui/material";
import { getPage, getSiteSettings } from "@/lib/firestore";
import ContactContent from "./ContactContent";
import { createExcerpt } from "@/lib/content-utils";

export const revalidate = 60;

export async function generateMetadata() {
  const [pageData, settings] = await Promise.all([
    getPage("contact"),
    getSiteSettings()
  ]);

  const siteName = settings?.siteName || "The Brain";
  const title = pageData?.title || "Contact Us";
  const rawContent = pageData?.content || "";
  const description = createExcerpt(rawContent, 160) || `Get in touch with ${siteName}.`;

  return {
    title: `${title} | ${siteName}`,
    description,
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
    }
  };
}

export default async function ContactPage() {
  const pageData = await getPage("contact");
  const title = pageData?.title || "Contact The Brain";

  return (
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
  );
}
