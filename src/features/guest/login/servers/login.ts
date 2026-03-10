"use server";
import { loginWithEmail } from "@/integrations/firebase";
import { cookies } from "next/headers";

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await loginWithEmail(email, password);
    if (!userCredential) {
      return null;
    }
    const cookieStore = await cookies();
    const idToken = await userCredential.user.getIdToken();
    const firebaseUid = userCredential.user.uid;

    cookieStore.set("userId", firebaseUid, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    cookieStore.set("token", idToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return {
      success: true,
      userId: firebaseUid,
      email: userCredential.user.email,
    };
  } catch {
    return null;
  }
};
