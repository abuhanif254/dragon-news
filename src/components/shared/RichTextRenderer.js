import React from "react";
import DOMPurify from "isomorphic-dompurify";
import parse from "html-react-parser";
import Image from "next/image";

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
    
  // Configure DOMPurify to keep id attributes
  const sanitizedContent = DOMPurify.sanitize(noColors, { 
    ADD_ATTR: ['target', 'id'],
    ADD_TAGS: ['iframe'] // sometimes useful for embedded videos
  });

  const parsedReactNodes = parse(sanitizedContent, {
    replace: (domNode) => {
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
    }
  });

  return (
    <div className="article-prose">
      {parsedReactNodes}
    </div>
  );
}
