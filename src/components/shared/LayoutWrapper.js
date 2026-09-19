"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Container, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AdsterraBanner from "./AdsterraBanner";
import { ADS_CONFIG } from "@/config/ads";

export const LayoutWrapper = ({ children }) => {
  const pathname = usePathname();
  const [isStickyDismissed, setIsStickyDismissed] = useState(false);

  const isDashboard =
    pathname.startsWith("/dashboard") ||
    pathname === "/login" ||
    pathname === "/register";

  if (isDashboard) {
    return <>{children}</>;
  }

  const showMobileStickyAd = ADS_CONFIG.enabled && !isStickyDismissed;

  return (
    <>
      <Navbar />
      <Container
        className="min-h-screen"
        sx={{
          // Reserve bottom padding on mobile when sticky footer ad is active
          // to prevent obscuring content, buttons, or page footer
          pb: showMobileStickyAd ? { xs: "70px", md: 0 } : 0,
        }}
      >
        {children}
      </Container>
      <Footer />

      {/* 320x50 Mobile Sticky Footer Ad with Dismiss Button */}
      {showMobileStickyAd && (
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1300,
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "background.paper",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.12)",
            borderTop: "1px solid",
            borderColor: "divider",
            py: 0.5,
          }}
        >
          {/* Subtle Dismiss Button */}
          <IconButton
            size="small"
            onClick={() => setIsStickyDismissed(true)}
            aria-label="Close advertisement"
            sx={{
              position: "absolute",
              top: 2,
              right: 4,
              p: 0.5,
              bgcolor: "rgba(0,0,0,0.06)",
              "&:hover": { bgcolor: "rgba(0,0,0,0.12)" },
            }}
          >
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>

          <Box sx={{ my: 0 }}>
            <AdsterraBanner
              placement="mobileStickyFooter"
              showLabel={false}
              className="my-0"
            />
          </Box>
        </Box>
      )}
    </>
  );
};
