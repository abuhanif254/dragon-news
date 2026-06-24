import { getAllNews } from "@/utils/getAllNews";
import HomeClient from "./HomeClient";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const metadata = {
  title: `${SITE_NAME} | ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const response = await getAllNews();
  const allNews = response.status ? response.data : [];
  const error = !response.status ? response.message : null;

  return <HomeClient allNews={allNews} error={error} />;
}
