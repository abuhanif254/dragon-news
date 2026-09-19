import { SITE_URL } from "@/lib/site";

export default function robots() {
  return {
    rules: [
      {
        // Main crawlers — full access to public content and dynamic social cards
        userAgent: "*",
        allow: [
          "/",
          "/news/",
          "/categories/",
          "/authors/",
          "/about",
          "/contact",
          "/privacy-policy",
          "/terms",
          "/cookies",
          "/pages/",
          "/api/og", // Unblock dynamic OpenGraph generator for social media scrapers
          "/llms.txt",
        ],
        disallow: [
          "/api/",
          "/dashboard/",
          "/login",
          "/register",
          "/bookmarks",
          "/offline",
          "/_next/",
          "/search?*", // Allow /search page but not query spam
        ],
      },
      {
        // Allow AI Search & Citation Engines (ChatGPT Search, Perplexity)
        userAgent: ["OAI-SearchBot", "PerplexityBot"],
        allow: ["/", "/news/", "/categories/", "/authors/", "/about", "/contact", "/llms.txt"],
        disallow: ["/api/", "/dashboard/", "/login", "/register"],
      },
      {
        // Block indiscriminate AI mass-training dataset scrapers
        userAgent: [
          "GPTBot",
          "Google-Extended",
          "CCBot",
          "anthropic-ai",
          "ClaudeBot",
          "Omgilibot",
          "FacebookBot",
        ],
        disallow: ["/"],
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/news-sitemap.xml`,
    ],
    host: SITE_URL,
  };
}
