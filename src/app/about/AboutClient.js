"use client";
import { Box, Container, Typography, Paper, Grid, Avatar, Stack, IconButton, Divider } from "@mui/material";
import Link from "next/link";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LanguageIcon from "@mui/icons-material/Language";

export default function AboutClient() {
  return (
    <Box sx={{ pb: 10 }}>
      {/* ── Magazine Style Hero ── */}
      <Box
        sx={{
          bgcolor: (theme) => theme.palette.mode === "dark" ? "#0a0f1c" : "#0f172a",
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
            About The Brain
          </Typography>
          <Typography variant="h6" sx={{ color: "#cbd5e1", fontWeight: 400, maxWidth: "700px", mx: "auto", lineHeight: 1.6 }}>
            We are a dedicated team of journalists, analysts, and technologists committed to delivering intelligence without fear or favour.
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
            boxShadow: (theme) => theme.palette.mode === 'dark' ? "0 10px 40px rgba(0,0,0,0.5)" : "0 10px 40px -10px rgba(0,0,0,0.08)",
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider"
          }}
          className="article-prose"
        >
          <Box sx={{
            "& p:first-of-type::first-letter": {
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
            <p>
              Founded with the vision of promoting secular values, free inquiry, and humanist public life, 
              <strong> The Brain</strong> operates as an independent digital news and intelligence platform. 
              In an era overwhelmed by misinformation, we provide our global readership with fact-based, rigorous reporting and profound analytical essays.
            </p>

            <h2>Ownership & Funding</h2>
            <p>
              The Brain is an independent, privately-held digital media organization. We are entirely self-funded and sustained through reader subscriptions, non-intrusive advertising, and philanthropic grants dedicated to the advancement of independent journalism. We do not accept funding from state actors, political parties, or corporate conglomerates that might seek to influence our editorial independence.
            </p>

            <h2>Editorial & Ethics Policy</h2>
            <p>
              Our editorial team operates with strict autonomy. We adhere to the highest standards of journalism ethics, prioritizing truth, accuracy, and fairness. 
            </p>
            <ul>
              <li><strong>Fact-Checking:</strong> Every long-form essay and investigative report undergoes a rigorous multi-stage fact-checking process by independent editors prior to publication.</li>
              <li><strong>Corrections Policy:</strong> We are committed to transparency. When factual errors are identified, we correct them immediately and append a clear editorial note to the article detailing the correction.</li>
              <li><strong>Opinion vs. News:</strong> We maintain a strict and visible separation between our objective news reporting and our opinion/editorial pieces.</li>
            </ul>

            <h2>Diversity & Inclusion</h2>
            <p>
              We believe that true intelligence requires diverse perspectives. Our newsroom and contributor network represent a wide array of backgrounds, ensuring that our coverage remains comprehensive and empathetic to global communities.
            </p>
          </Box>
        </Paper>
      </Container>
      
      {/* ── Hardcoded Features/Values Section ── */}
      <Container maxWidth="lg" sx={{ mt: 10 }}>
        <Typography variant="h3" fontWeight={900} textAlign="center" mb={6} sx={{ fontFamily: "'Playfair Display', serif", color: "text.primary" }}>
          Our Core Values
        </Typography>
        
        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
          {[
            { title: "Truth Above All", desc: "We relentlessly pursue the truth, presenting facts without bias or political interference." },
            { title: "Global Perspective", desc: "Our reporting transcends borders, offering a truly international lens on local issues." },
            { title: "Uncompromising Quality", desc: "From deep investigative pieces to daily updates, we uphold the highest editorial standards." }
          ].map((val, i) => (
            <Paper key={i} elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid", borderColor: "divider", bgcolor: "background.default", textAlign: "center" }}>
              <Typography variant="h5" fontWeight={800} mb={2} sx={{ color: "#c0392b" }}>{val.title}</Typography>
              <Typography variant="body1" color="text.secondary" lineHeight={1.7}>{val.desc}</Typography>
            </Paper>
          ))}
        </Box>
      </Container>

      <Divider sx={{ mt: 10, mb: 10, borderColor: "divider" }} />

      {/* ── Developer Identity Section ── */}
      <Container maxWidth="md" sx={{ mb: 10 }}>
        <Typography variant="h3" fontWeight={900} textAlign="center" mb={2} sx={{ fontFamily: "'Playfair Display', serif", color: "text.primary" }}>
          Platform Architect
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" mb={6}>
          The robust technology and high-performance infrastructure powering The Brain was designed and developed by:
        </Typography>

        <Paper 
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) => theme.palette.mode === 'dark' ? "rgba(255,255,255,0.02)" : "#f8fafc",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: { xs: 4, md: 6 }
          }}
        >
          <Avatar 
            src="https://ik.imagekit.io/ubwpdqyav/my_photo-removebg-preview.png?updatedAt=1776774813574" 
            alt="MD Abu Hanif Mia"
            sx={{ 
              width: 180, 
              height: 180,
              border: "4px solid #c0392b",
              boxShadow: "0 8px 24px rgba(192,57,43,0.3)"
            }}
          />
          <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
            <Typography variant="h4" fontWeight={900} gutterBottom sx={{ fontFamily: "'Playfair Display', serif", color: "text.primary" }}>
              MD Abu Hanif Mia
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} color="#c0392b" gutterBottom>
              Full Stack Web Architect
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
              Specializing in high-performance web applications, scalable cloud architecture, and user-centric UI/UX design. Driven by a passion for delivering enterprise-level products to the global market.
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3, justifyContent: { xs: "center", md: "flex-start" } }}>
              <Grid item>
                <Stack direction="row" alignItems="center" gap={1} color="text.secondary">
                  <PhoneIcon fontSize="small" />
                  <Typography variant="body2">+8801724010261</Typography>
                </Stack>
              </Grid>
              <Grid item>
                <Stack direction="row" alignItems="center" gap={1} color="text.secondary">
                  <EmailIcon fontSize="small" />
                  <Typography variant="body2">mohammadbitullah@gmail.com</Typography>
                </Stack>
              </Grid>
              <Grid item>
                <Stack direction="row" alignItems="center" gap={1} color="text.secondary">
                  <LanguageIcon fontSize="small" />
                  <Link href="https://abu-hanif-mia.vercel.app" target="_blank" style={{ color: "inherit", textDecoration: "none" }}>
                    <Typography variant="body2" sx={{ "&:hover": { color: "#c0392b" } }}>abu-hanif-mia.vercel.app</Typography>
                  </Link>
                </Stack>
              </Grid>
            </Grid>

            <Stack direction="row" gap={1.5} justifyContent={{ xs: "center", md: "flex-start" }}>
              <IconButton component="a" href="https://www.facebook.com/bitulla" target="_blank" sx={{ color: "text.secondary", "&:hover": { color: "#4267B2" } }}>
                <FacebookIcon />
              </IconButton>
              <IconButton component="a" href="https://x.com/MohammadBitull1" target="_blank" sx={{ color: "text.secondary", "&:hover": { color: "#1DA1F2" } }}>
                <TwitterIcon />
              </IconButton>
              <IconButton component="a" href="https://www.youtube.com/@MohammadBitullah" target="_blank" sx={{ color: "text.secondary", "&:hover": { color: "#FF0000" } }}>
                <YouTubeIcon />
              </IconButton>
              <IconButton component="a" href="https://www.instagram.com/bitullah_aj" target="_blank" sx={{ color: "text.secondary", "&:hover": { color: "#E1306C" } }}>
                <InstagramIcon />
              </IconButton>
              <IconButton component="a" href="https://www.linkedin.com/in/md-abu-hanif-mia" target="_blank" sx={{ color: "text.secondary", "&:hover": { color: "#0A66C2" } }}>
                <LinkedInIcon />
              </IconButton>
              <IconButton component="a" href="https://github.com/abuhanif254" target="_blank" sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}>
                <GitHubIcon />
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
