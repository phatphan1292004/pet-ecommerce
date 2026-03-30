export interface OrderItem {
  _id?: string;
  productId?: string;
  name?: string;
  image?: string;
  price?: number;
  quantity?: number;
}

export interface Order {
  _id?: string;
  id?: string;
  status?: string;
  paymentMethod?: string;
  totalPrice?: number;
  finalPrice?: number;
  createdAt?: string;
  arrivalName?: string;
  arrivalPhone?: string;
  arrivalAddress?: string;
  note?: string;
  cart?: {
    id?: string;
    status?: string;
    totalPrice?: number;
    totalDiscount?: number;
    finalPrice?: number;
    products?: OrderItem[];
    createdAt?: string;
    updatedAt?: string;
  };
  products?: OrderItem[];
  items?: OrderItem[];
  cartItems?: OrderItem[];
}
