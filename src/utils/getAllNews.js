import { db } from "@/lib/firebase";
import { firestoreFieldsToObject, normalizeArticle } from "@/lib/content-utils";

const fallbackNews = [
  {
    id: "mock-1",
    _id: "mock-1",
    title: "Secular Voices: Building a Public Square for Free Inquiry",
    details:
      "This preview article shows how published articles will appear once the Firestore database is reachable. The live feed only exposes approved articles to readers and search engines.",
    thumbnail_url: "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=800&auto=format&fit=crop",
    image_url: "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1200&auto=format&fit=crop",
    category: "Opinion",
    status: "approved",
    author: { name: "The Brain Editorial Team", published_date: new Date().toISOString().slice(0, 10), img: "" },
  },
  {
    id: "mock-2",
    _id: "mock-2",
    title: "Humanist Organizing and the Future of Rights Advocacy",
    details:
      "Use the dashboard to publish real reporting, analysis, and magazine essays. Writer submissions stay pending until an admin approves them.",
    thumbnail_url: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=800&auto=format&fit=crop",
    image_url: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1200&auto=format&fit=crop",
    category: "Activism",
    status: "approved",
    author: { name: "The Brain Editor", published_date: new Date().toISOString().slice(0, 10), img: "" },
  },
];

export const getAllNews = async ({ includeFallback = true } = {}) => {
  const projectId = db.app.options.projectId;
  const apiKey = db.app.options.apiKey;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "news" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "status" },
              op: "EQUAL",
              value: { stringValue: "approved" },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`REST API failed with status: ${response.status}`);
    }

    const data = await response.json();
    const formattedData = data
      .map((row) => row.document)
      .filter(Boolean)
      .map((doc) => normalizeArticle(doc.name.split("/").pop(), firestoreFieldsToObject(doc.fields || {})))
      .filter((item) => item.status === "approved")
      .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

    return { status: true, message: "success", data: formattedData };
  } catch (error) {
    if (!includeFallback) {
      return { status: false, message: error.message, data: [] };
    }

    return { status: true, message: "fallback", data: fallbackNews };
  }
};
