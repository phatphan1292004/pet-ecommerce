import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  slug?: string;
  quantity: number;
}

interface AddToCartInput {
  _id: string;
  name: string;
  price: number;
  image: string;
  slug?: string;
  quantity?: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: AddToCartInput) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const recalculate = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    items,
    totalItems,
    totalPrice,
  };
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      addItem: (item) =>
        set((state) => {
          const quantityToAdd = Math.max(1, item.quantity ?? 1);
          const existingItem = state.items.find((cartItem) => cartItem._id === item._id);

          if (existingItem) {
            const updatedItems = state.items.map((cartItem) =>
              cartItem._id === item._id
                ? {
                    ...cartItem,
                    quantity: cartItem.quantity + quantityToAdd,
                  }
                : cartItem,
            );
            return recalculate(updatedItems);
          }

          const updatedItems = [
            ...state.items,
            {
              _id: item._id,
              name: item.name,
              price: item.price,
              image: item.image,
              slug: item.slug,
              quantity: quantityToAdd,
            },
          ];

          return recalculate(updatedItems);
        }),

      removeItem: (productId) =>
        set((state) => {
          const updatedItems = state.items.filter((item) => item._id !== productId);
          return recalculate(updatedItems);
        }),

      updateItemQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            const updatedItems = state.items.filter((item) => item._id !== productId);
            return recalculate(updatedItems);
          }

          const updatedItems = state.items.map((item) =>
            item._id === productId ? { ...item, quantity } : item,
          );
          return recalculate(updatedItems);
        }),

      clearCart: () =>
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        }),
    }),
    {
      name: "pet-ecommerce-cart",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
