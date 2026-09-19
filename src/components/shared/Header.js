"use client";
import { Box, Container, Typography, Stack, IconButton } from "@mui/material";
import Link from "next/link";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { getCurrentDate } from "@/utils/getCurrentDate";
import { useSiteSettings } from "./SiteSettingsProvider";

const Header = () => {
  const currentDate = getCurrentDate();
  const { siteName, siteDescription } = useSiteSettings();

  return (
    <Box className="w-full pt-3 pb-2 border-b border-gray-100 dark:border-neutral-800">
      <Container maxWidth="xl">
        {/* Top utility strip: Date on left, Social icons on right */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
            mb: 2,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: { xs: "0.75rem", sm: "0.85rem" },
              fontWeight: 600,
              letterSpacing: "0.02em",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <span>📅</span> {currentDate}
          </Typography>

          {/* Social media channels */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            <IconButton
              component="a"
              href="https://www.facebook.com/bitulla"
              target="_blank"
              size="small"
              sx={{ color: "text.secondary", "&:hover": { color: "#4267B2" }, p: 0.5 }}
              aria-label="Facebook"
            >
              <FacebookIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              component="a"
              href="https://x.com/MohammadBitull1"
              target="_blank"
              size="small"
              sx={{ color: "text.secondary", "&:hover": { color: "#1DA1F2" }, p: 0.5 }}
              aria-label="Twitter / X"
            >
              <TwitterIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              component="a"
              href="https://www.youtube.com/@MohammadBitullah"
              target="_blank"
              size="small"
              sx={{ color: "text.secondary", "&:hover": { color: "#FF0000" }, p: 0.5 }}
              aria-label="YouTube"
            >
              <YouTubeIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              component="a"
              href="https://www.instagram.com/bitullah_aj"
              target="_blank"
              size="small"
              sx={{ color: "text.secondary", "&:hover": { color: "#E1306C" }, p: 0.5 }}
              aria-label="Instagram"
            >
              <InstagramIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              component="a"
              href="https://www.linkedin.com/in/md-abu-hanif-mia"
              target="_blank"
              size="small"
              sx={{ color: "text.secondary", "&:hover": { color: "#0A66C2" }, p: 0.5 }}
              aria-label="LinkedIn"
            >
              <LinkedInIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Box>

        {/* Center Masthead */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 0.5 }}>
              <Typography 
                variant="h1" 
                sx={{ 
                  fontSize: { xs: "2.2rem", sm: "3rem", md: "3.75rem" }, 
                  fontWeight: 900, 
                  fontFamily: "'Playfair Display', serif", 
                  color: "text.primary", 
                  textTransform: "uppercase",
                  letterSpacing: "-0.02em"
                }}
              >
                {siteName}
              </Typography>
            </Box>
          </Link>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: "#f39c12", 
              textAlign: "center", 
              fontWeight: 700, 
              letterSpacing: "0.25em", 
              textTransform: "uppercase", 
              fontSize: { xs: "0.68rem", sm: "0.75rem" }, 
              mb: 1 
            }}
          >
            {siteDescription || "Intelligence Without Fear or Favour"}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Header;
