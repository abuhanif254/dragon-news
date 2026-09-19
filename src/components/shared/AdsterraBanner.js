"use client";
import React, { useState, useEffect, useRef } from "react";
import { ADS_CONFIG } from "@/config/ads";

/**
 * High-performance Adsterra Banner component.
 * 
 * Engineering Solutions:
 * 1. Isolated Context without Sandbox: Runs in an iframe without restrictive sandbox
 *    attributes that strip the Referer header (Adsterra returns 0 bytes if Referer is null/opaque).
 * 2. Viewport Lazy Loading: IntersectionObserver loads the ad only when near the viewport.
 * 3. Localhost Awareness: Adsterra rejects localhost and only serves on live registered domains.
 *    Shows a developer placeholder on localhost so developers don't see broken white space.
 * 4. Auto-Collapse on AdBlock / No-Fill: If invoke.js is blocked or returns empty, the container
 *    and "ADVERTISEMENT" label automatically collapse completely (0px height).
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
  const [isFailed, setIsFailed] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);

  // Resolve config from placement preset or direct props
  const preset = placement ? ADS_CONFIG.adsterra?.[placement] : null;
  const key = directKey || preset?.key;
  const width = directWidth || preset?.width || 300;
  const height = directHeight || preset?.height || 250;
  const title = preset?.title || `Adsterra Ad ${key || "banner"}`;
  const scriptHost = ADS_CONFIG.scriptHost || "www.highrevenueformat.com";

  // Check if running on localhost/local network
  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (
        host === "localhost" ||
        host === "127.0.0.1" ||
        host.startsWith("192.168.") ||
        host.endsWith(".local")
      ) {
        setIsLocalhost(true);
      }
    }
  }, []);

  // Listen for ad failure or empty creative from iframe to auto-collapse
  useEffect(() => {
    const handleMessage = (event) => {
      if (
        (event.data?.type === "ADSTERRA_FAILED" || event.data?.type === "ADSTERRA_EMPTY") &&
        event.data?.key === key
      ) {
        setIsFailed(true);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [key]);

  // Viewport Lazy Loading: only render the iframe when near the viewport
  useEffect(() => {
    if (!ADS_CONFIG.enabled || !key) return;

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
        rootMargin: "250px",
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

  // Global Kill Switch or missing ad key or failed/blocked by AdBlock
  if (!ADS_CONFIG.enabled || !key || isFailed) {
    return null;
  }

  // On localhost, Adsterra will not serve live ads because it requires an approved production domain.
  // We display a clean informative placeholder so local developers understand why live ads don't render.
  if (isLocalhost) {
    return (
      <div
        className={`flex flex-col items-center justify-center w-full my-2 overflow-hidden ${className}`}
      >
        {showLabel && ADS_CONFIG.showLabel && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1 select-none">
            Advertisement (Local Preview)
          </span>
        )}
        <div
          style={{
            width: Math.min(width, 728),
            maxWidth: "100%",
            height,
            border: "1px dashed rgba(192, 57, 43, 0.4)",
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(192, 57, 43, 0.03)",
            padding: "8px 16px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#c0392b" }}>
            Adsterra Banner Placeholder ({width}×{height})
          </span>
          <span style={{ fontSize: "11px", color: "#666", marginTop: 4 }}>
            Live ads only serve on your verified production domain (e.g. blog.nexuscalculator.net), not on localhost.
          </span>
        </div>
      </div>
    );
  }

  // Isolated HTML for iframe srcDoc
  // Important:
  // 1. We include an onerror handler to detect adblockers immediately.
  // 2. We detect if no ad elements were rendered after 4s (no-fill) and notify parent to collapse.
  // 3. We do NOT use the sandbox attribute because sandboxed srcdoc strips the Referer header,
  //    which causes Adsterra's CDN to return Content-Length: 0 (blank script).
  const adHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="referrer" content="no-referrer-when-downgrade">
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
        <script
          type="text/javascript"
          src="https://${scriptHost}/${key}/invoke.js"
          onerror="window.parent.postMessage({ type: 'ADSTERRA_FAILED', key: '${key}' }, '*');"
        ></script>
        <script type="text/javascript">
          // Auto-collapse if no ad container was rendered after 4 seconds (e.g. AdBlock or zero fill)
          setTimeout(function() {
            var hasAd = document.body.querySelectorAll('iframe, img, a, div[id*="atContainer"]').length > 0;
            if (!hasAd) {
              window.parent.postMessage({ type: 'ADSTERRA_EMPTY', key: '${key}' }, '*');
            }
          }, 4000);
        </script>
      </body>
    </html>
  `;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center justify-center w-full my-2 overflow-hidden ${className}`}
      style={{ minHeight: isVisible ? height : 0 }}
    >
      {showLabel && ADS_CONFIG.showLabel && (
        <span
          className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1 select-none"
          style={{ letterSpacing: "0.1em" }}
        >
          Advertisement
        </span>
      )}

      {isVisible && (
        <iframe
          srcDoc={adHtml}
          width={width}
          height={height}
          frameBorder="0"
          scrolling="no"
          style={{
            border: "none",
            overflow: "hidden",
            maxWidth: "100%",
          }}
          title={title}
          loading="lazy"
        />
      )}
    </div>
  );
}
