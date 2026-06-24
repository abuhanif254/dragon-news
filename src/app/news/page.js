import { getAllNews } from "@/utils/getAllNews";
import { SITE_DESCRIPTION } from "@/lib/site";
import NewsPageClient from "./NewsPageClient";

export const metadata = {
  title: "Latest Articles",
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/news",
  },
};

export default async function AllNewsPage() {
  const response = await getAllNews({ includeFallback: false });
  const allNews = response.status ? response.data : [];
  const error = !response.status ? response.message : "";

  return <NewsPageClient allNews={allNews} error={error} />;
}
