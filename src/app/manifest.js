import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export default function manifest() {
  return {
    name: `${SITE_NAME} | Intelligence Without Fear or Favour`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    background_color: "#0a0d14",
    theme_color: "#c0392b",
    orientation: "portrait-primary",
    categories: ["news", "magazines", "education", "politics"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Latest News",
        short_name: "News",
        description: "Browse the latest breaking stories and updates",
        url: "/news",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Saved Bookmarks",
        short_name: "Bookmarks",
        description: "Access your saved articles and reading list",
        url: "/dashboard/bookmarks",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Search Articles",
        short_name: "Search",
        description: "Search in-depth analysis and reports",
        url: "/search",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
