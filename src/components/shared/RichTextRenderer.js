import React from "react";
import DOMPurify from "isomorphic-dompurify";
import parse from "html-react-parser";
import Image from "next/image";
import AdsterraBanner from "./AdsterraBanner";
import { generateSlug } from "@/lib/content-utils";

export { generateSlug };

export default function RichTextRenderer({ content }) {
  if (!content) return null;

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
    
  // Configure DOMPurify to keep id attributes and allow iframes for embeds
  const sanitizedContent = DOMPurify.sanitize(noColors, { 
    ADD_ATTR: ['target', 'id'],
    ADD_TAGS: ['iframe']
  });

  // Calculate paragraph density for intelligent in-article ad placement
  const totalParagraphs = (sanitizedContent.match(/<\/p>/gi) || []).length;
  let pCount = 0;
  let hasInjectedPrimary = false;
  let hasInjectedSecondary = false;

  const targetPrimaryP = totalParagraphs >= 4 ? 3 : 2;
  const targetSecondaryP = totalParagraphs >= 7 ? 6 : null;

  let withAdPlaceholders = sanitizedContent.replace(/<\/p>/gi, (match) => {
    pCount++;
    let replacement = match;

    // Primary in-article ad slot (high-attention zone)
    if (pCount === targetPrimaryP) {
      hasInjectedPrimary = true;
      replacement += '<div id="adsterra-in-article-primary"></div>';
    }

    // Secondary in-article ad slot (for long-form stories >= 7 paragraphs)
    if (targetSecondaryP && pCount === targetSecondaryP) {
      hasInjectedSecondary = true;
      replacement += '<div id="adsterra-in-article-secondary"></div>';
    }

    return replacement;
  });

  // Fallback for short articles (1 or 2 paragraphs)
  if (!hasInjectedPrimary && totalParagraphs > 0) {
    withAdPlaceholders += '<div id="adsterra-in-article-primary"></div>';
  }

  const parsedReactNodes = parse(withAdPlaceholders, {
    replace: (domNode) => {
      // 1. Primary In-Article Ad Banner (300x250)
      if (domNode.type === 'tag' && domNode.attribs && domNode.attribs.id === 'adsterra-in-article-primary') {
        return (
          <div className="my-8 flex flex-col items-center justify-center w-full clear-both no-print">
            <AdsterraBanner placement="articleInContent" />
          </div>
        );
      }

      // 2. Secondary In-Article Ad Banner (300x250 for long articles)
      if (domNode.type === 'tag' && domNode.attribs && domNode.attribs.id === 'adsterra-in-article-secondary') {
        return (
          <div className="my-8 flex flex-col items-center justify-center w-full clear-both no-print">
            <AdsterraBanner placement="articleInContentSecondary" />
          </div>
        );
      }

      // Responsive Next.js Optimized Image Handling
      if (domNode.type === 'tag' && domNode.name === 'img') {
        const { src, alt, width, height } = domNode.attribs;
        
        const parsedWidth = width ? parseInt(width, 10) : 800;
        const parsedHeight = height ? parseInt(height, 10) : 450;
        
        return (
          <Image
            src={src}
            alt={alt || "Article image"}
            width={parsedWidth}
            height={parsedHeight}
            sizes="(max-width: 768px) 100vw, 800px"
            style={{ maxWidth: "100%", height: "auto", borderRadius: "8px", margin: "2rem auto", display: "block", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
          />
        );
      }

      // Responsive Embedded Media / Video Iframes
      if (domNode.type === 'tag' && domNode.name === 'iframe') {
        const { src, title } = domNode.attribs || {};
        return (
          <div className="relative aspect-video my-6 w-full rounded-xl overflow-hidden shadow-lg clear-both">
            <iframe
              src={src}
              title={title || "Embedded media"}
              className="w-full h-full border-0 absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
    }
  });

  return (
    <div className="article-prose">
      {parsedReactNodes}
    </div>
  );
}
