import { create } from "zustand";
import {
  buildCheckoutPricingPayload,
  type CheckoutOrderPayload,
  type CheckoutPricingPayload,
} from "@/features/customer/cart/checkout-storage";

type CheckoutPricingInput = Parameters<typeof buildCheckoutPricingPayload>[0];

interface CheckoutState {
  pricing: CheckoutPricingPayload;
  shippingData: CheckoutOrderPayload | null;
  setPricing: (input: CheckoutPricingInput) => void;
  setShippingData: (payload: CheckoutOrderPayload) => void;
  clearShippingData: () => void;
  clearCheckout: () => void;
}

const defaultPricing = buildCheckoutPricingPayload({
  subtotal: 0,
  shippingFee: 0,
  couponDiscount: 0,
});

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  pricing: defaultPricing,
  shippingData: null,

  setPricing: (input) =>
    set(() => ({
      pricing: buildCheckoutPricingPayload(input),
    })),

  setShippingData: (payload) =>
    set(() => ({
      shippingData: payload,
    })),

  clearShippingData: () =>
    set(() => ({
      shippingData: null,
    })),

  clearCheckout: () =>
    set(() => ({
      pricing: defaultPricing,
      shippingData: null,
    })),
}));
