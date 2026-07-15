"use server";

import { revalidateTag } from "next/cache";

export async function triggerRevalidation(tag) {
  try {
    revalidateTag(tag);
    console.log(`Successfully revalidated tag: ${tag}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to revalidate tag:", error);
    return { success: false, error: error.message };
  }
}
