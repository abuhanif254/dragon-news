"use client";
import { useEffect } from "react";

/**
 * ReadingProgressBar — a thin gradient bar fixed to the top of the viewport
 * that fills as the user scrolls through the article.
 */
const ReadingProgressBar = () => {
  useEffect(() => {
    const bar = document.getElementById("reading-progress");
    if (!bar) return;

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${Math.min(progress, 100)}%`;
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div
      id="reading-progress"
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "4px",
        width: "0%",
        background: "linear-gradient(90deg, #ef4444 0%, #f97316 50%, #f59e0b 100%)",
        zIndex: 9999,
        transition: "width 0.1s ease-out",
        boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)"
      }}
    />
  );
};

export default ReadingProgressBar;
