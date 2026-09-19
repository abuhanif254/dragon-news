import { getAllNews } from "./getAllNews";

export const getCategoryNews = async (category) => {
  try {
    const response = await getAllNews();
    let newsData = response.data || [];
    
    if (category && category !== "all-news") {
      let decodedCategory = category;
      try {
        decodedCategory = decodeURIComponent(category);
      } catch (e) {
        // ignore
      }
      const target1 = category.toLowerCase();
      const target2 = decodedCategory.toLowerCase();
      newsData = newsData.filter((news) => {
        const cat = (news.category || "").toLowerCase();
        return cat === target1 || cat === target2;
      });
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
