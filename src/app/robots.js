import { SITE_URL } from "@/lib/site";

export default function robots() {
  return {
    rules: [
      {
        // Main crawlers — full access to public content
        userAgent: "*",
        allow: ["/", "/news/", "/categories/", "/authors/", "/about", "/contact", "/pages/"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/login",
          "/register",
          "/bookmarks",
          "/_next/",
          "/search?*", // Allow /search page but not query spam
        ],
      },
      {
        // Block AI training scrapers
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
