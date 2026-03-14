"use server";
import { cookies } from "next/headers";
import { get, put } from "@/integrations/storeClient";
import { UserInfo } from "@/types/user";

export const getUserInfo = async (): Promise<UserInfo | null> => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  const res = await get(`/customers/${userId}`);
  return res?.data ?? null;
};

interface ChangeInfoInput {
  displayName: string;
  phoneNumber: string;
  dateOfBirth: string;
}

export const changeInfo = async (
  data: ChangeInfoInput
): Promise<{ success: boolean; message: string; data?: UserInfo }> => {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return { success: false, message: "User not authenticated" };
    }

    // Validate input
    if (!data.displayName || data.displayName.trim() === "") {
      return { success: false, message: "Display name is required" };
    }

    if (!data.phoneNumber || data.phoneNumber.trim() === "") {
      return { success: false, message: "Phone number is required" };
    }

    // API call to update user info
    const res = await put(`/customers/${userId}`, {
      displayName: data.displayName,
      phoneNumber: data.phoneNumber,
      dateOfBirth: data.dateOfBirth,
    });

    if (res?.data) {
      return {
        success: true,
        message: "User info updated successfully",
        data: res.data,
      };
    } else {
      return {
        success: false,
        message: res?.message || "Failed to update user info",
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error updating user info:", message);
    return { success: false, message };
  }
};




