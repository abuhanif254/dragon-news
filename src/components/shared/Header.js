"use client";
import { Box, Container, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/the-brain-landscape-logo.png";
import { getCurrentDate } from "@/utils/getCurrentDate";
import { useSiteSettings } from "./SiteSettingsProvider";

const Header = () => {
  const currentDate = getCurrentDate();
  const { siteName, siteDescription, logoUrl } = useSiteSettings();

  return (
    <Box className="w-full pt-4 pb-2">
      <Container className="flex flex-col items-center">
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '2rem', md: '3rem' }, 
                fontWeight: 900, 
                fontFamily: "'Playfair Display', serif", 
                color: 'text.primary', 
                textTransform: 'uppercase',
                letterSpacing: '-0.02em'
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
            letterSpacing: '0.25em', 
            textTransform: 'uppercase', 
            fontSize: '0.75rem', 
            mb: 1 
          }}
        >
          {siteDescription || "Intelligence Without Fear or Favour"}
        </Typography>
        <Typography textAlign="center" sx={{ color: 'text.secondary', fontSize: '0.9rem', fontWeight: 500 }}>
          {currentDate}
        </Typography>
      </Container>
    </Box>
  );
};

export default Header;
