import categoriesData from "@/data/categories.json";

export const getAllCategories = async () => {
  return {
    status: true,
    message: "success",
    data: categoriesData,
  };
};
