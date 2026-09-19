"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Box, Container, Typography, Paper, Stack } from "@mui/material";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { normalizeLegalContent } from "@/lib/content-utils";

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

  const normalizedContent = useMemo(() => normalizeLegalContent(content), [content]);

  useEffect(() => {
    if (!contentRef.current) return;

    // Find all valid h2 and h3 elements within the rich text content (excluding oversized prose)
    const elements = Array.from(contentRef.current.querySelectorAll("h2, h3")).filter((elem) => {
      const text = elem.innerText.trim();
      return text.length > 0 && text.length <= 80;
    });

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
  }, [normalizedContent, activeId]);

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
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: headings.length > 0
              ? { xs: "1fr", md: "260px minmax(0, 1fr)", lg: "280px minmax(0, 1fr)" }
              : "1fr",
            gap: { xs: 4, md: 5, lg: 6 },
            alignItems: "start",
          }}
        >
          {/* TOC Sidebar */}
          {headings.length > 0 && (
            <Box
              component="aside"
              sx={{
                display: { xs: "none", md: "block" },
                position: "sticky",
                top: 120,
                maxHeight: "calc(100vh - 160px)",
                overflowY: "auto",
                pr: 2,
                "&::-webkit-scrollbar": { width: 4 },
                "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(0,0,0,0.15)", borderRadius: 2 },
              }}
            >
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
                      fontSize: heading.level === 2 ? "0.92rem" : "0.82rem",
                      fontWeight: activeId === heading.id ? 700 : 500,
                      pl: heading.level === 3 ? 2 : 0,
                      display: "flex",
                      alignItems: "center",
                      transition: "all 0.2s",
                      wordBreak: "break-word",
                      "&:hover": { color: "#c0392b" }
                    }}
                  >
                    {activeId === heading.id && <KeyboardArrowRightIcon sx={{ fontSize: 16, mr: 0.5, flexShrink: 0 }} />}
                    <span>{heading.text}</span>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Main Document Content */}
          <Box sx={{ minWidth: 0, width: "100%" }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 3, sm: 4, md: 6 }, 
                borderRadius: 4, 
                border: "1px solid", 
                borderColor: "#e2e8f0",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                bgcolor: "#ffffff"
              }}
            >
              <Box ref={contentRef} sx={{
                "& h2": { mt: 5, mb: 2.5, pt: 2, borderTop: "1px solid #f1f5f9", fontSize: { xs: "1.35rem", md: "1.6rem" }, fontWeight: 700, color: "#0f172a" },
                "& h2:first-of-type": { mt: 0, pt: 0, borderTop: "none" },
                "& h3": { mt: 3, mb: 1.5, fontSize: { xs: "1.15rem", md: "1.25rem" }, fontWeight: 600, color: "#1e293b" },
                "& p": { my: 2, lineHeight: 1.85, color: "#334155", fontSize: "1rem" },
                "& ul, & ol": { my: 2, pl: 3, lineHeight: 1.85, color: "#334155" },
                "& li": { mb: 1 }
              }}>
                <RichTextRenderer content={normalizedContent} />
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
