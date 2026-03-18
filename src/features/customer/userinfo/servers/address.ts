"use server";

import { cookies } from "next/headers";
import { get, post } from "@/integrations/storeClient";
import { UserAddress } from "@/types/address";

export interface CreateAddressInput {
  firebaseUid?: string;
  fullName: string;
  phone: string;
  email?: string;
  province: string;
  ward: string;
  address: string;
  type: string;
  isDefault: boolean;
}

export interface CreateAddressResponse {
  success: boolean;
  message: string;
  data?: UserAddress;
}

export const getUserAddresses = async (): Promise<UserAddress[]> => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return [];
  }

  const res = await get(`/addresses/${userId}`);
  return Array.isArray(res?.data) ? (res.data as UserAddress[]) : [];
};

export const createAddress = async (
  data: CreateAddressInput
): Promise<CreateAddressResponse> => {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return { success: false, message: "User not authenticated" };
    }

    const res = await post(`/addresses`, {
      firebaseUid: userId,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      province: data.province,
      ward: data.ward,
      address: data.address,
      type: data.type,
      isDefault: data.isDefault,
    });

    if (res?.data || res?.success) {
      return {
        success: true,
        message: res?.message || "Address created successfully",
        data: res?.data as UserAddress,
      };
    }

    return {
      success: false,
      message: res?.message || "Failed to create address",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating address:", message);
    return { success: false, message };
  }
};
