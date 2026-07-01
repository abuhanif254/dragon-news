"use client";
import React, { useMemo } from "react";
import { Box } from "@mui/material";
import DOMPurify from "isomorphic-dompurify";

// Utility to create URL-safe IDs from text
export const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

export default function RichTextRenderer({ content }) {
  const processedContent = useMemo(() => {
    if (!content) return "";
    
    // Add id attributes to h2 and h3 tags for Table of Contents
    const withIds = content.replace(/<(h[23])>(.*?)<\/\1>/gi, (match, tag, text) => {
      // Strip nested tags from text to generate clean ID
      const cleanText = text.replace(/<[^>]*>?/gm, '');
      const id = generateSlug(cleanText);
      return `<${tag} id="${id}">${text}</${tag}>`;
    });
    
    // Strip explicit color and background-color styles that ruin dark mode
    const noColors = withIds
      .replace(/color:\s*[^;"]+;?/gi, '')
      .replace(/background-color:\s*[^;"]+;?/gi, '');
      
    // Configure DOMPurify to keep id attributes
    return DOMPurify.sanitize(noColors, { 
      ADD_ATTR: ['target', 'id'],
      ADD_TAGS: ['iframe'] // sometimes useful for embedded videos
    });
  }, [content]);

  if (!content) return null;
  
  return (
    <Box
      className="article-prose"
      dangerouslySetInnerHTML={{ __html: processedContent }}
      sx={{
        "& h2, & h3, & h4": { 
          fontFamily: "'Playfair Display', serif", 
          fontWeight: 800, 
          mt: 4, 
          mb: 2, 
          color: "text.primary",
          scrollMarginTop: "100px" // For fixed navbar spacing when anchoring
        },
        "& p": { fontSize: "inherit", lineHeight: 1.8, color: "text.secondary", mb: 3 },
        "& a": { color: "#c0392b", textDecoration: "none", fontWeight: 600, "&:hover": { textDecoration: "underline" } },
        "& ul, & ol": { pl: 3, mb: 3, color: "text.secondary", fontSize: "inherit", lineHeight: 1.8 },
        "& img": { maxWidth: "100%", height: "auto", borderRadius: 2, my: 3, boxShadow: "var(--card-shadow)" },
        "& blockquote": { 
          borderLeft: "4px solid var(--brand-red)", 
          pl: 3, 
          py: 1, 
          my: 4, 
          bgcolor: "rgba(192,57,43,0.05)", 
          borderRadius: "0 8px 8px 0",
          fontStyle: "italic",
          fontSize: "1.1em"
        }
      }}
    />
  );
}
