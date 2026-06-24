import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { normalizeArticle } from "@/lib/content-utils";

// Collection reference
// Get all news
export async function getAllNews({ includeUnpublished = true } = {}) {
  const newsCollection = collection(db, "news");
  try {
    const querySnapshot = await getDocs(newsCollection);
    const news = querySnapshot.docs
      .map((item) => normalizeArticle(item.id, item.data()))
      .filter((item) => includeUnpublished || item.status === "approved");

    return news.sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt || 0);
      const dateB = new Date(b.publishedAt || b.createdAt || 0);
      return dateB - dateA;
    });
  } catch (error) {
    throw error;
  }
}

export async function getNewsForUser(user) {
  if (!user) return [];
  if (user.role === "admin") return getAllNews({ includeUnpublished: true });
  if (user.role !== "writer") return [];

  const newsCollection = collection(db, "news");
  const q = query(newsCollection, where("createdBy", "==", user.uid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map((item) => normalizeArticle(item.id, item.data()))
    .sort((a, b) => new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0));
}

// Get single news by ID
export async function getNewsById(id) {
  try {
    const docRef = doc(db, "news", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return normalizeArticle(docSnap.id, docSnap.data());
    }
    return null;
  } catch (error) {
    console.error("Error getting news by ID:", error);
    throw error;
  }
}

// Get news by category
export async function getNewsByCategory(category) {
  const newsCollection = collection(db, "news");
  try {
    const q = query(newsCollection, where("category", "==", category));
    const querySnapshot = await getDocs(q);
    const news = querySnapshot.docs.map((item) => normalizeArticle(item.id, item.data()));
    return news;
  } catch (error) {
    console.error("Error getting news by category:", error);
    throw error;
  }
}

// Create new news
export async function createNews(newsData) {
  const newsCollection = collection(db, "news");
  try {
    const status = newsData.status || "pending";
    const today = new Date().toISOString().slice(0, 10);
    const author = {
      uid: newsData.author?.uid || newsData.createdBy || "",
      email: newsData.author?.email || "",
      name: newsData.author?.name || "The Brain Editorial Team",
      published_date: newsData.author?.published_date || today,
      img: newsData.author?.img || "",
    };

    const docRef = await addDoc(newsCollection, {
      ...newsData,
      status,
      author,
      createdBy: newsData.createdBy || author.uid || "",
      total_view: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      publishedAt: status === "approved" ? serverTimestamp() : null,
      approvedAt: status === "approved" ? serverTimestamp() : null,
    });
    
    return { id: docRef.id, ...newsData };
  } catch (error) {
    throw error;
  }
}

// Update News Status (Approve/Reject)
export const updateNewsStatus = async (id, status) => {
  try {
    const docRef = doc(db, "news", id);
    const updates = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (status === "approved") {
      updates.approvedAt = serverTimestamp();
      updates.publishedAt = serverTimestamp();
      updates["author.published_date"] = new Date().toISOString().slice(0, 10);
    }

    if (status === "rejected") {
      updates.rejectedAt = serverTimestamp();
    }

    await updateDoc(docRef, updates);
    return { status: true };
  } catch (error) {
    console.error("Error updating news status:", error);
    throw error;
  }
};

// Update news
export async function updateNews(id, newsData) {
  try {
    const docRef = doc(db, "news", id);
    await updateDoc(docRef, {
      ...newsData,
      updatedAt: serverTimestamp(),
    });
    return { id, ...newsData };
  } catch (error) {
    console.error("Error updating news:", error);
    throw error;
  }
}

// Delete news
export async function deleteNews(id) {
  try {
    const docRef = doc(db, "news", id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting news:", error);
    throw error;
  }
}// Increment article views (Using REST to bypass gRPC blocks)
// Note: Requires Firestore Rules to allow public 'update' for the 'total_view' field.
export async function incrementViews(id) {
  const projectId = db.app.options.projectId;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        writes: [
          {
            transform: {
              document: `projects/${projectId}/databases/(default)/documents/news/${id}`,
              fieldTransforms: [
                {
                  fieldPath: "total_view",
                  increment: { integerValue: 1 }
                }
              ]
            }
          }
        ]
      })
    });

    if (res.ok) {
      console.log(`View incremented for article: ${id}`);
    }
  } catch (error) {
    // Silent fail in production to avoid blocking the UI
  }
}

// Get all categories (unique from news)
export async function getAllCategories() {
  try {
    const news = await getAllNews();
    const categories = [...new Set(news.map((item) => item.category))];
    return categories;
  } catch (error) {
    console.error("Error getting categories:", error);
    throw error;
  }
}
// Save contact form messages
export const saveContactMessage = async (messageData) => {
  try {
    const docRef = await addDoc(collection(db, "messages"), {
      ...messageData,
      timestamp: new Date().toISOString(),
      status: "unread"
    });
    return { status: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
};
// Get all messages
export const getAllMessages = async () => {
  try {
    const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting messages:", error);
    throw error;
  }
};

// Update message status (e.g., mark as read)
export const updateMessageStatus = async (id, status) => {
  try {
    const docRef = doc(db, "messages", id);
    await updateDoc(docRef, { status });
    return { status: true };
  } catch (error) {
    console.error("Error updating message:", error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (id) => {
  try {
    await deleteDoc(doc(db, "messages", id));
    return { status: true };
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

// Newsletter Subscription
export const subscribeToNewsletter = async (email) => {
  try {
    const q = query(collection(db, "subscribers"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { status: "exists", message: "You are already subscribed!" };
    }

    await addDoc(collection(db, "subscribers"), {
      email,
      subscribedAt: new Date().toISOString(),
      status: "active"
    });
    return { status: "success", message: "Subscribed successfully!" };
  } catch (error) {
    console.error("Error subscribing:", error);
    throw error;
  }
};

// Get all subscribers
export const getAllSubscribers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "subscribers"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting subscribers:", error);
    throw error;
  }
};

// Delete subscriber
export const deleteSubscriber = async (id) => {
  try {
    await deleteDoc(doc(db, "subscribers", id));
    return { status: true };
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    throw error;
  }
};

// CATEGORIES MANAGEMENT
export const getCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "categories"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting categories:", error);
    throw error;
  }
};

export const saveCategory = async (categoryData) => {
  try {
    const docRef = await addDoc(collection(db, "categories"), categoryData);
    return { id: docRef.id, ...categoryData };
  } catch (error) {
    console.error("Error saving category:", error);
    throw error;
  }
};

export const updateCategoryFirestore = async (id, categoryData) => {
  try {
    const docRef = doc(db, "categories", id);
    await updateDoc(docRef, categoryData);
    return { id, ...categoryData };
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategoryFirestore = async (id) => {
  try {
    await deleteDoc(doc(db, "categories", id));
    return { status: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

// AUTHOR PROFILES MANAGEMENT (Using REST to bypass gRPC blocks)
export const getAuthorProfile = async (name) => {
  const projectId = db.app.options.projectId;
  const apiKey = db.app.options.apiKey;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "authors" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "name" },
              op: "EQUAL",
              value: { stringValue: name }
            }
          },
          limit: 1
        }
      })
    });
    const data = await res.json();
    if (!data[0] || !data[0].document) return null;
    
    const doc = data[0].document;
    const fields = doc.fields;
    const id = doc.name.split("/").pop();
    
    return {
      id,
      name: fields.name?.stringValue || "",
      image: fields.image?.stringValue || "",
      role: fields.role?.stringValue || "",
      bio: fields.bio?.stringValue || "",
      expertise: fields.expertise?.arrayValue?.values?.map(v => v.stringValue) || [],
      social: {
        twitter: fields.social?.mapValue?.fields?.twitter?.stringValue || "",
        linkedin: fields.social?.mapValue?.fields?.linkedin?.stringValue || "",
        website: fields.social?.mapValue?.fields?.website?.stringValue || ""
      }
    };
  } catch (error) {
    console.error("Error getting author profile via REST:", error);
    return null;
  }
};

export const saveAuthorProfile = async (id, profileData) => {
  const projectId = db.app.options.projectId;
  const apiKey = db.app.options.apiKey;
  
  // Use 'patch' for both create and update in REST (if ID exists)
  // If no ID, we'd normally use 'create', but for simplicity in a dashboard
  // we'll often have an ID or use a specific doc name.
  
  const docId = id || profileData.name.toLowerCase().replace(/\s+/g, '-');
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/authors/${docId}?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          name: { stringValue: profileData.name },
          image: { stringValue: profileData.image || "" },
          role: { stringValue: profileData.role || "" },
          bio: { stringValue: profileData.bio || "" },
          expertise: { arrayValue: { values: (profileData.expertise || []).map(s => ({ stringValue: s })) } },
          social: {
            mapValue: {
              fields: {
                twitter: { stringValue: profileData.social?.twitter || "" },
                linkedin: { stringValue: profileData.social?.linkedin || "" },
                website: { stringValue: profileData.social?.website || "" }
              }
            }
          }
        }
      })
    });
    return await res.json();
  } catch (error) {
    console.error("Error saving author profile via REST:", error);
    throw error;
  }
};
