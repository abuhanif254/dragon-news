import { NextResponse } from "next/server";
import { adminAuth, adminDb, adminFieldValue } from "@/lib/firebase-admin";
import { ADMIN_EMAIL, isAdminEmail } from "@/lib/site";

export async function POST(req) {
  try {
    // 1. Authenticate the caller
    const authHeader = req.headers.get("authorization");
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = req.cookies.get("admin_token")?.value;
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Missing administrative credentials." },
        { status: 401 }
      );
    }

    // 2. Verify token cryptographic signature with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(token);
    if (!isAdminEmail(decodedToken.email)) {
      return NextResponse.json(
        { success: false, message: `Access Denied: Only ${ADMIN_EMAIL} can perform administrative role operations.` },
        { status: 403 }
      );
    }

    // 3. Parse and validate input payload
    const body = await req.json();
    const { targetUserId, targetEmail, nextRole, decision, message } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, message: "Invalid payload: targetUserId is required." },
        { status: 400 }
      );
    }

    // 4. Enforce strict anti-escalation security check
    if (nextRole === "admin" && !isAdminEmail(targetEmail)) {
      return NextResponse.json(
        { success: false, message: `Security violation: Only ${ADMIN_EMAIL} can hold the admin role.` },
        { status: 400 }
      );
    }

    const userRef = adminDb.collection("users").doc(targetUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, message: "Target user document does not exist." },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const effectiveTargetEmail = targetEmail || userData.email || "";

    // Double check that target email is not granted admin unless authorized
    if (nextRole === "admin" && !isAdminEmail(effectiveTargetEmail)) {
      return NextResponse.json(
        { success: false, message: `Security violation: Only ${ADMIN_EMAIL} can hold the admin role.` },
        { status: 400 }
      );
    }

    // Determine final role and status
    let finalRole = nextRole || userData.role || "reader";
    if (isAdminEmail(effectiveTargetEmail)) {
      finalRole = "admin";
    }

    let writerStatus = userData.writerApplicationStatus || "none";
    if (decision === "approved" || finalRole === "writer") {
      writerStatus = "approved";
      finalRole = "writer";
    } else if (decision === "rejected") {
      writerStatus = "rejected";
      if (finalRole === "writer") finalRole = "reader";
    } else if (finalRole === "reader") {
      writerStatus = "none";
    }

    // 5. Update user document atomically
    await userRef.update({
      role: finalRole,
      writerApplicationStatus: writerStatus,
      updatedAt: adminFieldValue.serverTimestamp(),
      lastAdminReview: {
        by: decodedToken.email,
        timestamp: adminFieldValue.serverTimestamp(),
        action: decision ? `writer_${decision}` : `role_set_to_${finalRole}`,
      },
    });

    // 6. Update writerRequests collection if a decision was submitted
    if (decision) {
      const requestRef = adminDb.collection("writerRequests").doc(targetUserId);
      await requestRef.set(
        {
          uid: targetUserId,
          name: userData.name || userData.displayName || "",
          email: effectiveTargetEmail,
          photo: userData.photo || userData.photoURL || "",
          status: decision,
          message: message || userData.writerApplicationMessage || "",
          reviewedBy: decodedToken.email,
          reviewedAt: adminFieldValue.serverTimestamp(),
          updatedAt: adminFieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    // 7. Write persistent audit log entry
    try {
      await adminDb.collection("audit_logs").add({
        action: decision ? "REVIEW_WRITER_APPLICATION" : "UPDATE_USER_ROLE",
        performedBy: decodedToken.email,
        performedByUid: decodedToken.uid,
        targetUserId,
        targetEmail: effectiveTargetEmail,
        previousRole: userData.role || "reader",
        newRole: finalRole,
        decision: decision || null,
        timestamp: adminFieldValue.serverTimestamp(),
      });
    } catch (auditErr) {
      console.warn("Audit logging non-fatal error:", auditErr);
    }

    return NextResponse.json({
      success: true,
      role: finalRole,
      writerApplicationStatus: writerStatus,
      message: `Successfully updated ${effectiveTargetEmail} to ${finalRole}.`,
    });
  } catch (error) {
    console.error("Admin user role API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error during role update." },
      { status: 500 }
    );
  }
}
