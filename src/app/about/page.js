import { Box, Container, Typography, Paper } from "@mui/material";
import { getPage, getSiteSettings } from "@/lib/firestore";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import { createExcerpt } from "@/lib/content-utils";

export const revalidate = 60;

export async function generateMetadata() {
  const [pageData, settings] = await Promise.all([
    getPage("about"),
    getSiteSettings()
  ]);

  const siteName = settings?.siteName || "The Brain";
  const title = pageData?.title || "About Us";
  const rawContent = pageData?.content || "";
  const description = createExcerpt(rawContent, 160) || `Learn more about ${siteName}.`;

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
  const pageData = await getPage("about");
  
  const title = pageData?.title || "About Us";
  const content = pageData?.content || "<p>Welcome to The Brain. We are dedicated to intelligence without fear or favour.</p>";

  return (
    <Box sx={{ pb: 10 }}>
      {/* ── Magazine Style Hero ── */}
      <Box
        sx={{
          bgcolor: "#0f172a",
          color: "white",
          pt: { xs: 12, md: 16 },
          pb: { xs: 8, md: 12 },
          px: 3,
          textAlign: "center",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="overline" sx={{ color: "#ef4444", letterSpacing: "0.15em", fontWeight: 700, display: "block", mb: 2 }}>
            Who We Are
          </Typography>
          <Typography
            variant="h1"
            fontWeight={900}
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontSize: { xs: "3rem", md: "4.5rem" },
              lineHeight: 1.1,
              mb: 4,
            }}
          >
            {title}
          </Typography>
          <Typography variant="h6" sx={{ color: "#cbd5e1", fontWeight: 400, maxWidth: "700px", mx: "auto", lineHeight: 1.6 }}>
            We are a dedicated team of journalists, analysts, and storytellers committed to delivering intelligence without fear or favour.
          </Typography>
        </Container>
      </Box>

      {/* ── Editorial Content ── */}
      <Container maxWidth="lg" sx={{ mt: -6 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 4, md: 8 }, 
            borderRadius: 4, 
            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)",
            bgcolor: "white",
            border: "1px solid #f1f5f9"
          }}
        >
          {/* Decorative Dropcap/Styling for the CMS Content */}
          <Box sx={{
            "& .article-prose p:first-of-type::first-letter": {
              float: "left",
              fontSize: "4.5rem",
              lineHeight: 0.8,
              pt: 1,
              pr: 2,
              fontWeight: 900,
              fontFamily: "'Playfair Display', serif",
              color: "#c0392b"
            }
          }}>
            <RichTextRenderer content={content} />
          </Box>
        </Paper>
      </Container>
      
      {/* ── Hardcoded Features/Values Section ── */}
      <Container maxWidth="lg" sx={{ mt: 10 }}>
        <Typography variant="h3" fontWeight={900} textAlign="center" mb={6} sx={{ fontFamily: "'Playfair Display', serif", color: "#0f172a" }}>
          Our Core Values
        </Typography>
        
        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
          {[
            { title: "Truth Above All", desc: "We relentlessly pursue the truth, presenting facts without bias or political interference." },
            { title: "Global Perspective", desc: "Our reporting transcends borders, offering a truly international lens on local issues." },
            { title: "Uncompromising Quality", desc: "From deep investigative pieces to daily updates, we uphold the highest editorial standards." }
          ].map((val, i) => (
            <Paper key={i} elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #e2e8f0", bgcolor: "#f8fafc", textAlign: "center" }}>
              <Typography variant="h5" fontWeight={800} mb={2} sx={{ color: "#c0392b" }}>{val.title}</Typography>
              <Typography variant="body1" color="text.secondary" lineHeight={1.7}>{val.desc}</Typography>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
