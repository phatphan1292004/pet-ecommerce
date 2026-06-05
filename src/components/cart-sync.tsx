"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getOpenCart } from "@/features/customer/cart/servers";
import { useCartStore } from "@/store";

// Helper to get client-side cookie value
const getCookie = (name: string): string => {
  if (typeof document === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
};

export default function CartSync() {
  const pathname = usePathname();
  const setItems = useCartStore((state) => state.setItems);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const userId = getCookie("userId");

    // Only sync cart from server if userId cookie value has changed
    // (e.g. from guest to logged in user, or when logging out)
    if (userId !== lastUserIdRef.current) {
      const syncCart = async () => {
        try {
          const response = await getOpenCart();
          if (response.success && response.data) {
            setItems(response.data.items);
            lastUserIdRef.current = userId;
          }
        } catch (error) {
          console.error("Failed to sync cart:", error);
        }
      };

      void syncCart();
    }
  }, [pathname, setItems]);

  return null;
}
