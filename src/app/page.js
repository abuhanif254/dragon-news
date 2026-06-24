import { getAllNews } from "@/utils/getAllNews";
import HomeClient from "./HomeClient";


export default async function HomePage() {
  const response = await getAllNews();
  const allNews = response.status ? response.data : [];
  const error = !response.status ? response.message : null;

  return <HomeClient allNews={allNews} error={error} />;
}
