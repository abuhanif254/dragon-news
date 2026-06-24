"use client";
import React, { useEffect, useState, useRef } from "react";
import { Box, Container, Typography, Grid, Paper, Stack } from "@mui/material";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export default function LegalPageLayout({ title, content, lastUpdated }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState("");
  const contentRef = useRef(null);

  useEffect(() => {
    if (!contentRef.current) return;

    // Find all h2 and h3 elements within the rich text content
    const elements = Array.from(contentRef.current.querySelectorAll("h2, h3"));
    const newHeadings = elements.map((elem) => {
      let id = elem.id;
      if (!id) {
        id = slugify(elem.innerText);
        elem.id = id;
      }
      return {
        id,
        text: elem.innerText,
        level: Number(elem.tagName.substring(1)),
        top: elem.offsetTop,
      };
    });

    setHeadings(newHeadings);

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150; // Offset for sticky header
      
      let currentActiveId = "";
      for (const heading of newHeadings) {
        const element = document.getElementById(heading.id);
        if (element && element.offsetTop <= scrollPosition) {
          currentActiveId = heading.id;
        }
      }
      
      if (currentActiveId !== activeId) {
        setActiveId(currentActiveId);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [content, activeId]);

  const scrollToHeading = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100, // Offset for navbar
        behavior: "smooth"
      });
    }
  };

  return (
    <Box sx={{ mb: 10 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          pt: { xs: 8, md: 12 },
          pb: { xs: 6, md: 10 },
          mb: 6,
          px: 3,
          textAlign: "center",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Container maxWidth="md">
          <Box display="inline-flex" alignItems="center" gap={1} mb={2} sx={{ bgcolor: "rgba(255,255,255,0.1)", px: 2, py: 0.5, borderRadius: 5 }}>
            <InsertDriveFileOutlinedIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
            <Typography variant="overline" sx={{ color: "#94a3b8", letterSpacing: "0.1em", fontWeight: 600 }}>
              Legal Document
            </Typography>
          </Box>
          <Typography
            variant="h1"
            fontWeight={900}
            sx={{
              fontFamily: "'Playfair Display', serif",
              color: "white",
              fontSize: { xs: "2.5rem", md: "4rem" },
              lineHeight: 1.1,
              mb: 3,
            }}
          >
            {title}
          </Typography>
          {lastUpdated && (
            <Typography variant="body1" sx={{ color: "#cbd5e1" }}>
              Last Updated: {lastUpdated}
            </Typography>
          )}
        </Container>
      </Box>

      {/* Content & Sidebar Layout */}
      <Container maxWidth="lg">
        <Grid container spacing={6} justifyContent="center">
          {/* TOC Sidebar */}
          {headings.length > 0 && (
            <Grid item xs={12} md={4} lg={3} sx={{ display: { xs: "none", md: "block" } }}>
              <Box sx={{ position: "sticky", top: 120 }}>
                <Typography variant="overline" sx={{ fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", display: "block", mb: 2 }}>
                  Contents
                </Typography>
                <Stack spacing={1}>
                  {headings.map((heading) => (
                    <Box
                      key={heading.id}
                      component="a"
                      href={`#${heading.id}`}
                      onClick={(e) => scrollToHeading(e, heading.id)}
                      sx={{
                        textDecoration: "none",
                        color: activeId === heading.id ? "#c0392b" : "#475569",
                        fontSize: heading.level === 2 ? "0.95rem" : "0.85rem",
                        fontWeight: activeId === heading.id ? 700 : 500,
                        pl: heading.level === 3 ? 2 : 0,
                        display: "flex",
                        alignItems: "center",
                        transition: "all 0.2s",
                        "&:hover": { color: "#c0392b" }
                      }}
                    >
                      {activeId === heading.id && <KeyboardArrowRightIcon sx={{ fontSize: 16, mr: 0.5 }} />}
                      {heading.text}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>
          )}

          {/* Main Document Content */}
          <Grid item xs={12} md={headings.length > 0 ? 8 : 12} lg={headings.length > 0 ? 9 : 12}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 3, md: 6 }, 
                borderRadius: 4, 
                border: "1px solid", 
                borderColor: "#e2e8f0",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                bgcolor: "#ffffff"
              }}
            >
              <Box ref={contentRef} sx={{
                "& h2": { mt: 6, mb: 3, pt: 2, borderTop: "1px solid #f1f5f9" },
                "& h2:first-of-type": { mt: 0, pt: 0, borderTop: "none" }
              }}>
                <RichTextRenderer content={content} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
