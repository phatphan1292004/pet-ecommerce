export interface UserAddress {
  _id: string;
  firebaseUid: string;
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  province: string;
  ward: string;
  type: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
