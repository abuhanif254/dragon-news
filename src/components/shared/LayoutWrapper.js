"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Container, Box } from "@mui/material";
import AdsterraBanner from "./AdsterraBanner";

export const LayoutWrapper = ({ children }) => {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard") || pathname === "/login" || pathname === "/register";

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <Container className="min-h-screen">{children}</Container>
      <Footer />
      
      {/* 320x50 Mobile Sticky Footer Ad */}
      <Box sx={{ 
        display: { xs: 'flex', md: 'none' }, 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 50, 
        justifyContent: 'center',
        bgcolor: 'background.paper',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
      }}>
        <Box sx={{ mt: -2, mb: -2 }}>
          <AdsterraBanner adKey="fd2f33caedbe45d52eae1cc1324603f3" width={320} height={50} />
        </Box>
      </Box>
    </>
  );
};
