import { auth, db } from "./firebase";
import { 
  createUserWithEmailAndPassword,
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { 
  collection,
  doc, 
  getDocs,
  getDoc, 
  setDoc,
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import { isAdminEmail } from "@/lib/site";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const DEFAULT_READER_FIELDS = {
  role: "reader",
  writerApplicationStatus: "none",
};

const userPayload = (user, provider = "google") => ({
  uid: user.uid,
  name: user.displayName || user.email?.split("@")[0] || "Reader",
  email: user.email || "",
  photo: user.photoURL || "",
  provider,
  emailVerified: Boolean(user.emailVerified),
});

export const ensureUserDocument = async (user, provider = "google") => {
  if (!user?.uid || !user?.email) return null;

  const userDocRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userDocRef);
  const existing = userSnap.exists() ? userSnap.data() : {};
  const admin = isAdminEmail(user.email);

  const role = admin
    ? "admin"
    : existing.role === "admin"
      ? "reader"
      : existing.role || DEFAULT_READER_FIELDS.role;

  const profile = {
    ...DEFAULT_READER_FIELDS,
    ...existing,
    ...userPayload(user, provider),
    role,
    writerApplicationStatus:
      existing.writerApplicationStatus || DEFAULT_READER_FIELDS.writerApplicationStatus,
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  if (!userSnap.exists()) {
    profile.createdAt = serverTimestamp();
  }

  await setDoc(userDocRef, profile, { merge: true });
  return { ...existing, ...userPayload(user, provider), role };
};

// Sign in with Google
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const profile = await ensureUserDocument(result.user, "google");
    return Object.assign(result.user, profile);
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const registerWithEmailPassword = async ({ name, email, password }) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await updateProfile(result.user, { displayName: name });
  }
  const profile = await ensureUserDocument(
    {
      uid: result.user.uid,
      email: result.user.email,
      displayName: name || result.user.displayName,
      photoURL: result.user.photoURL,
      emailVerified: result.user.emailVerified,
    },
    "password"
  );
  return Object.assign(result.user, profile);
};

export const loginWithEmailPassword = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const profile = await ensureUserDocument(result.user, "password");
  return Object.assign(result.user, profile);
};

// Sign out
export const logout = () => signOut(auth);

export const getUserProfile = async (uid) => {
  try {
    const userDocRef = doc(db, "users", uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

// Get User Role from Firestore
export const getUserRole = async (uid) => {
  const profile = await getUserProfile(uid);
  return profile?.role || "reader";
};

// Subscribe to Auth Changes
export const subscribeToAuth = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const profile = await ensureUserDocument(user);
      callback({
        ...user,
        ...profile,
        displayName: user.displayName || profile?.name,
        photoURL: user.photoURL || profile?.photo,
        role: profile?.role || "reader",
      });
    } else {
      callback(null);
    }
  });
};

export const requestWriterAccess = async (message = "") => {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to apply as a writer.");

  const profile = await ensureUserDocument(user);
  if (profile?.role === "admin" || profile?.role === "writer") {
    return { status: "already-approved" };
  }

  const request = {
    uid: user.uid,
    name: user.displayName || profile?.name || "Reader",
    email: user.email,
    photo: user.photoURL || profile?.photo || "",
    message,
    status: "pending",
    requestedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, "writerRequests", user.uid), request, { merge: true });
  await updateDoc(doc(db, "users", user.uid), {
    writerApplicationStatus: "pending",
    writerApplicationMessage: message,
    updatedAt: serverTimestamp(),
  });

  return { status: "pending" };
};

export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
};

export const updateUserRole = async (user, newRole) => {
  if (newRole === "admin" && !isAdminEmail(user.email)) {
    throw new Error("Only mohammadbitullah@gmail.com can hold the admin role.");
  }

  const nextRole = isAdminEmail(user.email) ? "admin" : newRole;
  await updateDoc(doc(db, "users", user.id || user.uid), {
    role: nextRole,
    writerApplicationStatus:
      nextRole === "writer" ? "approved" : nextRole === "reader" ? "none" : user.writerApplicationStatus || "none",
    updatedAt: serverTimestamp(),
  });

  return nextRole;
};

export const reviewWriterApplication = async (user, decision) => {
  const approved = decision === "approved";
  const nextRole = approved ? "writer" : "reader";
  const userId = user.id || user.uid;

  await updateDoc(doc(db, "users", userId), {
    role: isAdminEmail(user.email) ? "admin" : nextRole,
    writerApplicationStatus: decision,
    updatedAt: serverTimestamp(),
  });

  await setDoc(
    doc(db, "writerRequests", userId),
    {
      uid: userId,
      name: user.name || "",
      email: user.email || "",
      photo: user.photo || "",
      status: decision,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { role: nextRole, writerApplicationStatus: decision };
};
