"use client";
import React from "react";
import { Box } from "@mui/material";
import DOMPurify from "isomorphic-dompurify";

export default function RichTextRenderer({ content }) {
  if (!content) return null;
  
  return (
    <Box
      className="article-prose"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content, { ADD_ATTR: ['target'] }) }}
      sx={{
        "& h2, & h3, & h4": { fontFamily: "'Playfair Display', serif", fontWeight: 800, mt: 4, mb: 2, color: "text.primary" },
        "& p": { fontSize: "1.1rem", lineHeight: 1.8, color: "text.secondary", mb: 3 },
        "& a": { color: "#c0392b", textDecoration: "none", fontWeight: 600, "&:hover": { textDecoration: "underline" } },
        "& ul, & ol": { pl: 3, mb: 3, color: "text.secondary", fontSize: "1.1rem", lineHeight: 1.8 },
        "& img": { maxWidth: "100%", height: "auto", borderRadius: 2, my: 3 }
      }}
    />
  );
}
