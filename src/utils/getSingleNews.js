import { db } from "@/lib/firebase";
import { firestoreFieldsToObject, normalizeArticle } from "@/lib/content-utils";

export const getSingleNews = async (id) => {
  const projectId = db.app.options.projectId;
  const apiKey = db.app.options.apiKey;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/news/${id}?key=${apiKey}`;

  try {
    const response = await fetch(url, { next: { revalidate: 60 } });

    if (!response.ok) {
      throw new Error("Article not found.");
    }

    const doc = await response.json();
    const news = normalizeArticle(id, firestoreFieldsToObject(doc.fields || {}));

    if (news.status !== "approved") {
      return { status: false, message: "Article is not published.", data: null };
    }

    return { status: true, message: "success", data: news };
  } catch (error) {
    return { status: false, message: error.message, data: null };
  }
};
