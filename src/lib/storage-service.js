import { auth } from "@/lib/firebase";

/**
 * Uploads an image securely via the server-side API proxy.
 * 
 * @param {File} file - The image file to upload
 * @param {string} folder - (Optional folder reference)
 * @returns {Promise<string>} - The direct URL of the uploaded image
 */
export const uploadImageToStorage = async (file, folder = "general") => {
  if (!file) throw new Error("No file provided.");

  const formData = new FormData();
  formData.append("image", file);
  if (folder) formData.append("folder", folder);

  try {
    const headers = {};
    if (auth?.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      } catch (e) {
        // Fallback to cookie authentication
      }
    }

    const response = await fetch("/api/upload", {
      method: "POST",
      headers,
      body: formData,
    });

    const data = await response.json();

    if (data.success && data.url) {
      return data.url;
    } else {
      throw new Error(data.error || "Failed to upload image.");
    }
  } catch (error) {
    console.error("Image Upload Error:", error);
    throw error;
  }
};
