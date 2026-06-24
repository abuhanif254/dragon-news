"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Container } from "@mui/material";

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
    </>
  );
};
