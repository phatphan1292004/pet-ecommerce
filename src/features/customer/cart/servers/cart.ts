"use server";

import { cookies } from "next/headers";
import { del, get, patch, post } from "@/integrations/storeClient";
import type { CartItem } from "@/store";

interface ActionResult<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface OpenCartData {
  items: CartItem[];
}

interface SyncOpenCartInput {
  productId: string;
  quantity: number;
  name?: string;
  price?: number;
  image?: string;
  slug?: string;
}

interface CreateOrderFromOpenCartInput {
  customerId?: string;
  cartId?: string;
  arrivalName: string;
  arrivalPhone: string;
  arrivalAddress: string;
  status?: string;
  paymentMethod?: string;
  arrivalTime?: string;
  note?: string;
}

const normalizeCartItems = (rawItems: unknown): CartItem[] => {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  const items: CartItem[] = [];

  for (const rawItem of rawItems) {
    const item = rawItem as {
      _id?: string;
      productId?: string;
      name?: string;
      image?: string;
      slug?: string;
      price?: number;
      unitPrice?: number;
      quantity?: number;
      qty?: number;
      product?: {
        _id?: string;
        name?: string;
        image?: string;
        slug?: string;
        price?: number;
      };
    };

    const productId = item.productId || item._id || item.product?._id;
    if (!productId) {
      continue;
    }

    items.push({
      _id: productId,
      name: item.name || item.product?.name || "San pham",
      image: item.image || item.product?.image || "",
      slug: item.slug || item.product?.slug,
      price: Number(item.price ?? item.unitPrice ?? item.product?.price ?? 0),
      quantity: Math.max(1, Number(item.quantity ?? item.qty ?? 1)),
    });
  }

  return items;
};

const getRawOpenItems = (response: unknown): unknown => {
  const data = (response as { data?: unknown })?.data;

  if (Array.isArray(data)) {
    return data;
  }

  const asObject = (data || {}) as {
    items?: unknown;
    cartItems?: unknown;
    products?: unknown;
  };

  return asObject.items || asObject.cartItems || asObject.products || [];
};

const tryRequests = async <T>(requests: Array<() => Promise<T>>): Promise<T | null> => {
  for (const request of requests) {
    try {
      const result = await request();
      if (result) {
        return result;
      }
    } catch {
      // Try fallback endpoint.
    }
  }

  return null;
};

const toStringValue = (value: unknown): string =>
  typeof value === "string" || typeof value === "number" ? String(value) : "";

const getCartIdFromResponse = (response: unknown): string => {
  const data = (response as { data?: unknown })?.data;

  if (!data || Array.isArray(data) || typeof data !== "object") {
    return "";
  }

  const record = data as Record<string, unknown>;

  return (
    toStringValue(record.cartId) ||
    toStringValue(record.cartid) ||
    toStringValue(record._id) ||
    toStringValue(record.id)
  );
};

const getCurrentUserId = async (): Promise<string> => {
  const cookieStore = await cookies();
  return cookieStore.get("userId")?.value || "";
};

export const getOpenCart = async (): Promise<ActionResult<OpenCartData>> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { success: false, message: "User not authenticated", data: { items: [] } };
  }

  const response = await tryRequests([
    () => get(`/carts/${userId}?status=open`),
    () => get(`/carts/${userId}/open`),
    () => get(`/carts/open/${userId}`),
  ]);

  if (!response) {
    return { success: false, message: "Failed to load open cart", data: { items: [] } };
  }

  const items = normalizeCartItems(getRawOpenItems(response));

  return {
    success: true,
    message: "Open cart loaded",
    data: { items },
  };
};

export const syncOpenCartItem = async (
  input: SyncOpenCartInput
): Promise<ActionResult<null>> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { success: false, message: "User not authenticated" };
  }

  const payload = {
    productId: input.productId,
    quantity: Math.max(1, input.quantity),
    price: Number(input.price || 0),
    name: input.name,
    image: input.image,
    slug: input.slug,
  };

  const response = await patch(`/carts/${userId}/items`, payload);

  if (!response) {
    return { success: false, message: "Failed to sync open cart item" };
  }

  return { success: true, message: "Open cart item synced" };
};

export const updateOpenCartItem = async (
  productId: string,
  quantity: number
): Promise<ActionResult<null>> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { success: false, message: "User not authenticated" };
  }

  const normalizedQuantity = Math.max(1, quantity);
  const response = await patch(`/carts/${userId}/items`, {
    productId,
    quantity: normalizedQuantity,
  });

  if (!response) {
    return { success: false, message: "Failed to update open cart item" };
  }

  return { success: true, message: "Open cart item updated" };
};

export const removeOpenCartItem = async (productId: string): Promise<ActionResult<null>> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { success: false, message: "User not authenticated" };
  }

  const response = await del(`/carts/${userId}/items/${productId}`);

  if (!response) {
    return { success: false, message: "Failed to remove open cart item" };
  }

  return { success: true, message: "Open cart item removed" };
};

export const clearOpenCart = async (): Promise<ActionResult<null>> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { success: false, message: "User not authenticated" };
  }

  const response = await del(`/carts/${userId}/open`);

  if (!response) {
    return { success: false, message: "Failed to clear open cart" };
  }

  return { success: true, message: "Open cart cleared" };
};

export const createOrderFromOpenCart = async (
  input: CreateOrderFromOpenCartInput
): Promise<ActionResult<{ orderId?: string }>> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { success: false, message: "User not authenticated" };
  }

  const openCartResponse = await tryRequests([
    () => get(`/carts/${userId}?status=open`),
    () => get(`/carts/${userId}/open`),
    () => get(`/carts/open/${userId}`),
  ]);
  const detectedCartId = getCartIdFromResponse(openCartResponse);

  const payload = {
    customerId: input.customerId || userId,
    cartId: input.cartId || detectedCartId,
    status: input.status || "paid_later",
    paymentMethod: input.paymentMethod,
    arrivalName: input.arrivalName,
    arrivalPhone: input.arrivalPhone,
    arrivalAddress: input.arrivalAddress,
    arrivalTime: input.arrivalTime,
    note: input.note,
  };

  if (!payload.cartId) {
    return { success: false, message: "Không tìm thấy cartId để tạo đơn hàng" };
  }

  const response = await tryRequests([
    () => post(`/orders`, payload),
    () => patch(`/carts/${userId}/checkout`, payload),
    () => patch(`/carts/${userId}/close`, payload),
  ]);

  if (!response) {
    return { success: false, message: "Failed to create order from open cart" };
  }

  if (payload.cartId) {
    await tryRequests([
      () => patch(`/carts/${userId}/close`, { cartId: payload.cartId, status: "close" }),
      () => patch(`/carts/${userId}/close`, { cartId: payload.cartId }),
    ]);
  }

  const data = (response as { data?: { orderId?: string; id?: string; _id?: string } })?.data;

  return {
    success: true,
    message: "Open cart checked out successfully",
    data: { orderId: data?.orderId || data?.id || data?._id },
  };
};

// Backward-compatible aliases while migrating callers from draft -> open.
export const getDraftCart = getOpenCart;
export const syncDraftCartItem = syncOpenCartItem;
export const updateDraftCartItem = updateOpenCartItem;
export const removeDraftCartItem = removeOpenCartItem;
export const clearDraftCart = clearOpenCart;
export const createOrderFromDraft = createOrderFromOpenCart;
