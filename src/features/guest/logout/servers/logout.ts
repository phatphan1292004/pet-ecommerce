"use server";
import { cookies } from "next/headers";

export const logout = async () => {
  const cookieStore = await cookies(); 
  cookieStore.set("userId", "", { maxAge: 0, path: "/" });
  cookieStore.set("token", "", { maxAge: 0, path: "/" });
};