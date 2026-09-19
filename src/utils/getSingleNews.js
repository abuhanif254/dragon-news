import { db } from "@/lib/firebase";
import { firestoreFieldsToObject, normalizeArticle, generateSlug } from "@/lib/content-utils";
import { fetchWithRetry } from "./fetchWithRetry";
import { getAllNews } from "./getAllNews";

/**
 * Resolves a single article by either its Firestore document ID or its URL slug.
 * Supports:
 * 1. Direct ID lookup (O(1) REST GET)
 * 2. Firestore structuredQuery by `slug` field
 * 3. In-memory fallback matching `slug`, `seoMeta.slug`, or `generateSlug(title)`
 */
export const getSingleNews = async (slugOrId) => {
  if (!slugOrId) {
    return { status: false, message: "Missing slug or article ID.", data: null };
  }

  let decodedSlug = String(slugOrId);
  try {
    decodedSlug = decodeURIComponent(slugOrId);
  } catch (e) {
    // ignore
  }

  try {
    if (!db || !db.app || !db.app.options) {
      throw new Error("Firebase DB not initialized");
    }

    const projectId = db.app.options.projectId;
    const apiKey = db.app.options.apiKey;

    // 1. Direct Document ID lookup (e.g. "L0C5pUh2WeeO4LG0mbTJ")
    // If slugOrId looks like a Firestore ID (no hyphens, standard length 16-28 chars)
    const looksLikeId = /^[a-zA-Z0-9_-]{16,28}$/.test(slugOrId) && !slugOrId.includes("-");
    if (looksLikeId) {
      try {
        const directUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/news/${slugOrId}?key=${apiKey}`;
        const directRes = await fetchWithRetry(directUrl, { next: { tags: ["news"], revalidate: 60 } });
        if (directRes.ok) {
          const doc = await directRes.json();
          const news = normalizeArticle(slugOrId, firestoreFieldsToObject(doc.fields || {}));
          if (news.status === "approved") {
            return { status: true, message: "success", data: news };
          }
        }
      } catch (err) {
        // Fall through to query lookup
      }
    }

    // 2. Structured Query by top-level `slug` field
    try {
      const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;
      const queryRes = await fetchWithRetry(queryUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        next: { tags: ["news"], revalidate: 60 },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: "news" }],
            where: {
              fieldFilter: {
                field: { fieldPath: "slug" },
                op: "EQUAL",
                value: { stringValue: decodedSlug },
              },
            },
            limit: 1,
          },
        }),
      });

      if (queryRes.ok) {
        const queryData = await queryRes.json();
        const foundRow = queryData.find((row) => row.document);
        if (foundRow && foundRow.document) {
          const doc = foundRow.document;
          const id = doc.name.split("/").pop();
          const news = normalizeArticle(id, firestoreFieldsToObject(doc.fields || {}));
          if (news.status === "approved") {
            return { status: true, message: "success", data: news };
          }
        }
      }
    } catch (err) {
      // Fall through to allNews fallback
    }

    // 3. Fallback: Search in all approved articles (covers legacy articles without top-level slug)
    const allResponse = await getAllNews({ includeFallback: false });
    if (allResponse.status && Array.isArray(allResponse.data)) {
      const matched = allResponse.data.find(
        (item) =>
          item.slug === slugOrId ||
          item.slug === decodedSlug ||
          item.id === slugOrId ||
          item._id === slugOrId ||
          item.seoMeta?.slug === slugOrId ||
          item.seoMeta?.slug === decodedSlug ||
          generateSlug(item.title) === slugOrId ||
          generateSlug(item.title) === decodedSlug
      );

      if (matched && matched.status === "approved") {
        return { status: true, message: "success", data: matched };
      }
    }

    return { status: false, message: "Article not found.", data: null };
  } catch (error) {
    return { status: false, message: error.message, data: null };
  }
};
