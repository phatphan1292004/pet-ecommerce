"use server";
import { cookies } from "next/headers";
import { get } from "@/integrations/storeClient";
import { UserInfo } from "@/types/user";

export const getUserInfo = async (): Promise<UserInfo | null> => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  const res = await get(`/customers/${userId}`);
  return res?.data ?? null;
};




