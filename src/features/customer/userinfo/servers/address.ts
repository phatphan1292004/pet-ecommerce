"use server";

import { cookies } from "next/headers";
import { del, get, post, put } from "@/integrations/storeClient";
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

  if (!userId || userId.startsWith("guest-")) {
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

    if (!userId || userId.startsWith("guest-")) {
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

export interface DeleteAddressResponse {
  success: boolean;
  message: string;
}

export const deleteAddress = async (
  addressId: string
): Promise<DeleteAddressResponse> => {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId || userId.startsWith("guest-")) {
      return { success: false, message: "User not authenticated" };
    }

    const res = await del(`/addresses/${addressId}`, {
      firebaseUid: userId,
    });

    if (res?.success || res?.data) {
      return {
        success: true,
        message: res?.message || "Address deleted successfully",
      };
    }

    return { success: false, message: res?.message || "Failed to delete address" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error deleting address:", message);
    return { success: false, message };
  }
};

export interface UpdateAddressResponse {
  success: boolean;
  message: string;
  data?: UserAddress;
}

export const updateAddress = async (
  addressId: string,
  data: CreateAddressInput
): Promise<UpdateAddressResponse> => {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId || userId.startsWith("guest-")) {
      return { success: false, message: "User not authenticated" };
    }

    const res = await put(`/addresses/${addressId}`, {
      firebaseUid: userId,
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim(),
      address: data.address.trim(),
      province: data.province.trim(),
      ward: data.ward.trim(),
      type: data.type,
      isDefault: data.isDefault,
    });

    if (res?.data || res?.success) {
      return {
        success: true,
        message: res?.message || "Address updated successfully",
        data: res?.data as UserAddress,
      };
    }

    return {
      success: false,
      message: res?.message || "Failed to update address",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error updating address:", message);
    return { success: false, message };
  }
};
