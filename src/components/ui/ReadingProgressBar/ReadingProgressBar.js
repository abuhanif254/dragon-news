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

  return <div id="reading-progress" aria-hidden="true" />;
};

export default ReadingProgressBar;
