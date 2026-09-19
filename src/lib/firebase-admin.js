import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dragoon-news-d76b9";

if (!getApps().length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      initializeApp({
        credential: cert(serviceAccount),
        projectId,
      });
    } catch (error) {
      console.error("Firebase Admin config error:", error);
      initializeApp({ projectId });
    }
  } else {
    initializeApp({
      projectId,
    });
  }
}

let authInstance;
try {
  authInstance = getAuth();
} catch (e) {
  console.warn("Failed to getAuth() from firebase-admin:", e);
}

let dbInstance;
try {
  dbInstance = getFirestore();
} catch (e) {
  console.warn("Failed to getFirestore() from firebase-admin:", e);
}

export const adminAuth = authInstance;
export const adminDb = dbInstance;
export const adminFieldValue = FieldValue;


