"use server";

import { post } from "./storeClient";

interface SyncUserData {
  firebaseUid: string;
  email: string;
  displayName: string;
  phone?: string;
}

export async function syncUserToDatabase(userData: SyncUserData) {
  try {
    const result = await post(
      "/customers",
      userData,
      null,
      (error) => {
        console.error("Failed to sync user to database:", error);
        return null;
      }
    );
    return result;
  } catch (error) {
    console.error("Error syncing user:", error);
    return null;
  }
}
