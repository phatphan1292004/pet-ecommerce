export interface CheckoutPricingPayload {
  subtotal: number;
  shippingFee: number;
  couponCode?: string;
  couponDiscount: number;
  grandTotal: number;
}

export interface CheckoutOrderPayload {
  arrivalName: string;
  arrivalPhone: string;
  arrivalAddress: string;
  note?: string;
  coupon?: string;
  couponCode?: string;
  couponDiscount?: number;
  subtotal?: number;
  shippingFee?: number;
  grandTotal?: number;
}

const toFiniteNumber = (value: unknown, fallback = 0): number => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return numericValue;
};

export const buildCheckoutPricingPayload = (input: {
  subtotal: number;
  shippingFee?: number;
  couponCode?: string;
  couponDiscount?: number;
}): CheckoutPricingPayload => {
  const subtotal = Math.max(0, toFiniteNumber(input.subtotal));
  const shippingFee = Math.max(0, toFiniteNumber(input.shippingFee));
  const couponDiscount = Math.max(0, toFiniteNumber(input.couponDiscount));
  const couponCode = input.couponCode?.trim().toUpperCase() || undefined;

  return {
    subtotal,
    shippingFee,
    couponCode,
    couponDiscount,
    grandTotal: Math.max(0, subtotal + shippingFee - couponDiscount),
  };
};
