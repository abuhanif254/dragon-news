"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Stack } from "@mui/material";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

export default function TableOfContents({ htmlContent }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (!htmlContent) return;

    // Use a temporary DOM element to parse HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const elements = Array.from(doc.querySelectorAll("h2, h3"));
    
    // We expect RichTextRenderer to have already injected IDs, 
    // but we can generate them identically here if they don't exist
    const generateSlug = (text) => text.toLowerCase().replace(/[^\w\-]+/g, '-');
    
    const parsedHeadings = elements.map((elem) => {
      const id = elem.id || generateSlug(elem.textContent);
      return {
        id,
        text: elem.textContent,
        level: Number(elem.tagName.replace("H", "")),
      };
    });

    setHeadings(parsedHeadings);

    // Intersection observer for scroll tracking
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0% -60% 0%" }
    );

    // Wait a tick for DOM to be painted
    setTimeout(() => {
      parsedHeadings.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) observer.observe(element);
      });
    }, 500);

    return () => observer.disconnect();
  }, [htmlContent]);

  if (headings.length === 0) return null;

  return (
    <Box sx={{ bgcolor: "background.paper", p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", width: "100%", boxSizing: "border-box" }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
        <FormatListBulletedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
        <Typography variant="subtitle2" fontWeight={800} sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
          In this article
        </Typography>
      </Stack>
      
      <Stack spacing={1}>
        {headings.map((heading) => (
          <Typography
            key={heading.id}
            variant="body2"
            component="a"
            href={`#${heading.id}`}
            sx={{
              textDecoration: "none",
              color: activeId === heading.id ? "var(--brand-red)" : "text.secondary",
              fontWeight: activeId === heading.id ? 700 : 500,
              display: "block",
              pl: heading.level === 3 ? 2 : 0,
              borderLeft: heading.level === 3 ? "2px solid" : "none",
              borderColor: activeId === heading.id ? "var(--brand-red)" : "divider",
              ml: heading.level === 3 ? 0.5 : 0,
              transition: "all 0.2s ease",
              lineHeight: 1.4,
              whiteSpace: "normal",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              "&:hover": { color: "var(--brand-red)" }
            }}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById(heading.id);
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
                setActiveId(heading.id);
              }
            }}
          >
            {heading.text}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}
