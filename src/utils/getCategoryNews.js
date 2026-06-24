import { getAllNews } from "./getAllNews";

export const getCategoryNews = async (category) => {
  try {
    const response = await getAllNews();
    let newsData = response.data || [];
    
    if (category && category !== "all-news") {
      const targetCategory = category.toLowerCase();
      newsData = newsData.filter(
        (news) => news.category?.toLowerCase() === targetCategory
      );
    }

    return {
      status: true,
      message: response.message || "success",
      data: newsData,
    };
  } catch (error) {
    console.error("Error in getCategoryNews utility:", error);
    return {
      status: false,
      message: error.message,
      data: [],
    };
  }
};
