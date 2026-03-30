export const checkoutStorageKey = "pet-ecommerce-checkout-shipping";

export interface CheckoutOrderPayload {
  arrivalName: string;
  arrivalPhone: string;
  arrivalAddress: string;
  note?: string;
}
