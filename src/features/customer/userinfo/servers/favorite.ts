"use server";

import { cookies } from "next/headers";
import { del, get, post } from "@/integrations/storeClient";

interface ActionResult<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface FavoriteProduct {
  id: string;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  isActive?: boolean;
  stock?: number;
}

interface FavoriteListData {
  customerId?: string;
  items?: FavoriteProduct[];
  totalItems?: number;
}

interface FavoriteApiResponse {
  success?: boolean;
  message?: string;
  data?: FavoriteListData;
}

const getCurrentUserId = async (): Promise<string> => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value || "";
  if (userId.startsWith("guest-")) {
    return "";
  }
  return userId;
};

const getResponseMessage = (
  response: FavoriteApiResponse | null,
  fallback: string
): string => {
  if (!response || typeof response.message !== "string" || !response.message.trim()) {
    return fallback;
  }

  return response.message;
};

const isFailure = (response: FavoriteApiResponse | null): boolean =>
  !response || response.success === false;

const getFavoriteItems = (response: FavoriteApiResponse | null): FavoriteProduct[] => {
  if (!response?.data || !Array.isArray(response.data.items)) {
    return [];
  }

  return response.data.items;
};

export const getFavoriteProducts = async (): Promise<ActionResult<FavoriteProduct[]>> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      success: false,
      message: "Vui long dang nhap de xem san pham yeu thich",
      data: [],
    };
  }

  const response = (await get(`/favorites/${userId}`)) as FavoriteApiResponse | null;

  if (isFailure(response)) {
    return {
      success: false,
      message: getResponseMessage(response, "Khong the tai danh sach yeu thich"),
      data: [],
    };
  }

  return {
    success: true,
    message: getResponseMessage(response, "Favorite list fetched successfully"),
    data: getFavoriteItems(response),
  };
};

export const addFavoriteProduct = async (
  productId: string
): Promise<ActionResult<null>> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      success: false,
      message: "Vui long dang nhap de them san pham yeu thich",
      data: null,
    };
  }

  const normalizedProductId = productId.trim();

  if (!normalizedProductId) {
    return {
      success: false,
      message: "San pham khong hop le",
      data: null,
    };
  }

  const response = (await post("/favorites", {
    customerId: userId,
    productId: normalizedProductId,
  })) as FavoriteApiResponse | null;

  if (isFailure(response)) {
    return {
      success: false,
      message: getResponseMessage(response, "Khong the them vao danh sach yeu thich"),
      data: null,
    };
  }

  return {
    success: true,
    message: getResponseMessage(response, "Da them vao danh sach yeu thich"),
    data: null,
  };
};

export const removeFavoriteProduct = async (
  productId: string
): Promise<ActionResult<null>> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      success: false,
      message: "Vui long dang nhap de bo yeu thich",
      data: null,
    };
  }

  const normalizedProductId = productId.trim();

  if (!normalizedProductId) {
    return {
      success: false,
      message: "San pham khong hop le",
      data: null,
    };
  }

  let response = (await del("/favorites", {
    customerId: userId,
    productId: normalizedProductId,
  })) as FavoriteApiResponse | null;

  if (isFailure(response)) {
    response = (await del(`/favorites/${userId}/${normalizedProductId}`)) as FavoriteApiResponse | null;
  }

  if (isFailure(response)) {
    return {
      success: false,
      message: getResponseMessage(response, "Khong the bo san pham yeu thich"),
      data: null,
    };
  }

  return {
    success: true,
    message: getResponseMessage(response, "Da bo san pham yeu thich"),
    data: null,
  };
};
