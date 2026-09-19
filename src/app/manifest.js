import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export default function manifest() {
  return {
    name: `${SITE_NAME} | News & Media`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#c0392b",
    orientation: "portrait-primary",
    categories: ["news", "magazines", "education"],
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable any",
      },
    ],
  };
}
