"use server";

import { cookies } from "next/headers";
import { get, patch } from "@/integrations/storeClient";
import type { Order } from "@/types/order";

interface ActionResult<T> {
  success: boolean;
  message: string;
  data: T;
}

interface GetOrdersByCustomerInput {
  status?: string;
  page?: number;
  limit?: number;
}

export const getOrdersByCustomer = async (
  input: GetOrdersByCustomerInput = {}
): Promise<ActionResult<Order[]>> => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return { success: false, message: "User not authenticated", data: [] };
  }

  const res = await get(`/orders/${userId}`, {
    status: input.status,
    page: input.page,
    limit: input.limit,
  });
  const payload = res?.data as { items?: Order[] } | Order[] | undefined;
  const data = Array.isArray(payload)
    ? (payload as Order[])
    : Array.isArray(payload?.items)
      ? (payload.items as Order[])
      : [];

  return {
    success: Boolean(res?.data),
    message: res?.message || "",
    data,
  };
};

export const getOrderById = async (orderId: string): Promise<ActionResult<Order | null>> => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return { success: false, message: "User not authenticated", data: null };
  }

  const res = await get(`/order/${orderId}`);
  const data = res?.data as Order | undefined;

  return {
    success: Boolean(res?.data),
    message: res?.message || "",
    data: data || null,
  };
};

interface UpdateOrderDeliveryInput {
  arrivalName: string;
  arrivalPhone: string;
  arrivalAddress: string;
}

export const updateOrderDeliveryInfo = async (
  orderId: string,
  input: UpdateOrderDeliveryInput
): Promise<ActionResult<Order | null>> => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return { success: false, message: "User not authenticated", data: null };
  }

  const res = await patch(`/order/${orderId}`, {
    firebaseUid: userId,
    arrivalName: input.arrivalName,
    arrivalPhone: input.arrivalPhone,
    arrivalAddress: input.arrivalAddress,
  });

  const data = res?.data as Order | undefined;
  return {
    success: Boolean(res?.data),
    message: res?.message || "",
    data: data || null,
  };
};
