"use client";
import React, { useState, useEffect, useRef } from "react";
import { ADS_CONFIG } from "@/config/ads";

/**
 * High-performance Adsterra Banner component.
 * 
 * Features:
 * - Isolated browsing context via iframe srcDoc (prevents document.write crashes & window.atOptions clashing)
 * - Viewport lazy loading using IntersectionObserver (improves FCP, LCP, and TBT)
 * - Zero Cumulative Layout Shift (CLS) with reserved minHeight container
 * - Responsive max-width clipping to avoid mobile horizontal scrollbars
 * - Centralized config integration via `placement` prop or explicit `adKey`/`width`/`height`
 */
export default function AdsterraBanner({
  placement,
  adKey: directKey,
  width: directWidth,
  height: directHeight,
  showLabel = true,
  className = "",
}) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Resolve config from placement preset or direct props
  const preset = placement ? ADS_CONFIG.adsterra?.[placement] : null;
  const key = directKey || preset?.key;
  const width = directWidth || preset?.width || 300;
  const height = directHeight || preset?.height || 250;
  const title = preset?.title || `Adsterra Ad ${key || "banner"}`;

  // Viewport Lazy Loading: only render the iframe when near the viewport
  useEffect(() => {
    if (!ADS_CONFIG.enabled || !key) return;

    // Fallback if IntersectionObserver is unavailable
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "250px", // Pre-load 250px before entering viewport for smooth experience
      }
    );

    const currentElem = containerRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) observer.unobserve(currentElem);
      observer.disconnect();
    };
  }, [key]);

  // Global Kill Switch or missing ad key
  if (!ADS_CONFIG.enabled || !key) {
    return null;
  }

  // Isolated HTML for iframe srcDoc
  const adHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { box-sizing: border-box; }
          body { 
            margin: 0; 
            padding: 0; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            overflow: hidden; 
            background: transparent;
          }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          var atOptions = {
            'key' : '${key}',
            'format' : 'iframe',
            'height' : ${height},
            'width' : ${width},
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/${key}/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center justify-center w-full my-4 overflow-hidden ${className}`}
      style={{ minHeight: height }}
    >
      {/* Discreet label conforming to Google Better Ads Standards */}
      {showLabel && ADS_CONFIG.showLabel && (
        <span
          className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1 select-none"
          style={{ letterSpacing: "0.1em" }}
        >
          Advertisement
        </span>
      )}

      {isVisible ? (
        <iframe
          srcDoc={adHtml}
          width={width}
          height={height}
          frameBorder="0"
          scrolling="no"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          style={{
            border: "none",
            overflow: "hidden",
            maxWidth: "100%",
          }}
          title={title}
          loading="lazy"
        />
      ) : (
        // Lightweight CLS placeholder while waiting for viewport scroll
        <div
          style={{
            width: Math.min(width, 728),
            maxWidth: "100%",
            height,
            backgroundColor: "rgba(0, 0, 0, 0.02)",
            borderRadius: 6,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
