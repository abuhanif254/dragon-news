/**
 * Uploads an image to ImgBB and returns the direct image URL.
 * 
 * @param {File} file - The image file to upload
 * @param {string} folder - (Ignored by ImgBB, kept for compatibility)
 * @returns {Promise<string>} - The direct URL of the uploaded image
 */
export const uploadImageToStorage = async (file, folder = "general") => {
  if (!file) throw new Error("No file provided.");

  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error("ImgBB API key is missing. Please add NEXT_PUBLIC_IMGBB_API_KEY to your .env.local file.");
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      return data.data.url; // Returns the direct image URL
    } else {
      throw new Error(data.error?.message || "Failed to upload image to ImgBB");
    }
  } catch (error) {
    console.error("ImgBB Upload Error:", error);
    throw error;
  }
};
