"use server";

import { get, patch, put } from "@/integrations/storeClient";

export interface AdminUserRole {
  id?: string;
  name?: string;
  description?: string;
}

export interface AdminUserAddress {
  id?: string;
  address?: string;
  ward?: string;
  province?: string;
  district?: string;
}

export interface AdminUserOrder {
  id: string;
  customerId?: string;
  cartId?: string;
  status?: string;
  paymentMethod?: string;
  arrivalName?: string;
  arrivalPhone?: string;
  arrivalAddress?: string;
  arrivalTime?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUser {
  id: string;
  firebaseUid?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
  birthDate?: string;
  gender?: string;
  status?: string;
  isLocked?: boolean;
  isActive?: boolean;
  role?: AdminUserRole;
  addresses?: AdminUserAddress[];
  orders?: AdminUserOrder[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUserMutationResult {
  success: boolean;
  message: string;
  data: AdminUser | null;
}

export interface AdminUsersMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminUsersResult {
  success: boolean;
  message: string;
  data: {
    items: AdminUser[];
    meta: AdminUsersMeta;
  };
}

export interface AdminUserDetailResult {
  success: boolean;
  message: string;
  data: AdminUser | null;
}

interface GetAdminUsersInput {
  page?: number;
  limit?: number;
  keyword?: string;
  role?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toPositiveInteger = (value: unknown, fallback: number): number => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback;
  }

  return Math.floor(numeric);
};

const toNonNegativeInteger = (value: unknown, fallback: number): number => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return fallback;
  }

  return Math.floor(numeric);
};

const getFirstString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
};

const getFirstBoolean = (...values: unknown[]): boolean | undefined => {
  for (const value of values) {
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "number") {
      if (value === 1) {
        return true;
      }

      if (value === 0) {
        return false;
      }
    }

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "locked", "inactive", "disabled", "blocked"].includes(normalized)) {
        return true;
      }

      if (["false", "0", "active", "enabled", "unlocked"].includes(normalized)) {
        return false;
      }
    }
  }

  return undefined;
};

const createDefaultMeta = (page: number, limit: number, totalItems = 0): AdminUsersMeta => {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

const normalizeRole = (value: unknown): AdminUserRole | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const id = getFirstString(value.id, value._id);
  const name = getFirstString(value.name);
  const description = getFirstString(value.description);

  if (!id && !name && !description) {
    return undefined;
  }

  return {
    id,
    name,
    description,
  };
};

const normalizeAddress = (value: unknown): AdminUserAddress | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = getFirstString(value.id, value._id);
  const address = getFirstString(value.address, value.street);
  const ward = getFirstString(value.ward);
  const province = getFirstString(value.province, value.city);
  const district = getFirstString(value.district);

  if (!id && !address && !ward && !province && !district) {
    return null;
  }

  return {
    id,
    address,
    ward,
    province,
    district,
  };
};

const normalizeAddresses = (value: unknown): AdminUserAddress[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeAddress(item))
    .filter((item): item is AdminUserAddress => Boolean(item));
};

const normalizeOrder = (value: unknown): AdminUserOrder | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = getFirstString(value.id, value._id, value.orderId);

  if (!id) {
    return null;
  }

  return {
    id,
    customerId: getFirstString(value.customerId),
    cartId: getFirstString(value.cartId),
    status: getFirstString(value.status),
    paymentMethod: getFirstString(value.paymentMethod),
    arrivalName: getFirstString(value.arrivalName),
    arrivalPhone: getFirstString(value.arrivalPhone),
    arrivalAddress: getFirstString(value.arrivalAddress),
    arrivalTime: getFirstString(value.arrivalTime),
    note: getFirstString(value.note),
    createdAt: getFirstString(value.createdAt),
    updatedAt: getFirstString(value.updatedAt),
  };
};

const normalizeOrders = (value: unknown): AdminUserOrder[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeOrder(item))
    .filter((item): item is AdminUserOrder => Boolean(item));
};

const normalizeUser = (value: unknown): AdminUser | null => {
  if (!isRecord(value)) {
    return null;
  }

  const firebaseUid = getFirstString(value.firebaseUid);
  const id = getFirstString(value.id, value._id, firebaseUid);

  if (!id) {
    return null;
  }

  const role = normalizeRole(value.role);
  const addresses = normalizeAddresses(value.addresses);
  const orders = normalizeOrders(value.orders);

  return {
    id,
    firebaseUid,
    displayName: getFirstString(value.displayName),
    email: getFirstString(value.email),
    phoneNumber: getFirstString(value.phoneNumber),
    photoURL: getFirstString(
      value.photoURL,
      value.photoUrl,
      value.avatarUrl,
      value.avatar,
      value.profileImage
    ),
    birthDate: getFirstString(value.birthDate, value.dateOfBirth),
    gender: getFirstString(value.gender),
    status: getFirstString(value.status, value.accountStatus),
    isLocked: getFirstBoolean(value.isLocked, value.locked, value.blocked),
    isActive: getFirstBoolean(value.isActive, value.active, value.enabled),
    role,
    addresses,
    orders,
    createdAt: getFirstString(value.createdAt),
    updatedAt: getFirstString(value.updatedAt),
  };
};

const normalizeUserCollection = (value: unknown): AdminUser[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeUser(item))
      .filter((item): item is AdminUser => Boolean(item));
  }

  if (!isRecord(value)) {
    return [];
  }

  if (Array.isArray(value.items)) {
    return normalizeUserCollection(value.items);
  }

  if (isRecord(value.data) && Array.isArray(value.data.items)) {
    return normalizeUserCollection(value.data.items);
  }

  if (Array.isArray(value.users)) {
    return normalizeUserCollection(value.users);
  }

  return [];
};

const normalizeUserDetail = (value: unknown): AdminUser | null => {
  const directUser = normalizeUser(value);
  if (directUser) {
    return directUser;
  }

  if (!isRecord(value)) {
    return null;
  }

  if (isRecord(value.user)) {
    return normalizeUser(value.user);
  }

  if (isRecord(value.data)) {
    return normalizeUser(value.data);
  }

  return null;
};

const normalizeMeta = (
  value: unknown,
  fallbackPage: number,
  fallbackLimit: number,
  itemCount: number
): AdminUsersMeta => {
  if (!isRecord(value)) {
    return createDefaultMeta(fallbackPage, fallbackLimit, itemCount);
  }

  const page = toPositiveInteger(value.page, fallbackPage);
  const limit = toPositiveInteger(value.limit, fallbackLimit);
  const totalItems = toNonNegativeInteger(value.totalItems, itemCount);
  const defaultMeta = createDefaultMeta(page, limit, totalItems);

  return {
    page,
    limit,
    totalItems,
    totalPages: toPositiveInteger(value.totalPages, defaultMeta.totalPages),
    hasNextPage:
      typeof value.hasNextPage === "boolean"
        ? value.hasNextPage
        : defaultMeta.hasNextPage,
    hasPrevPage:
      typeof value.hasPrevPage === "boolean"
        ? value.hasPrevPage
        : defaultMeta.hasPrevPage,
  };
};

const pickMetaSource = (value: unknown): unknown => {
  if (!isRecord(value)) {
    return undefined;
  }

  if (value.meta) {
    return value.meta;
  }

  if (isRecord(value.data) && value.data.meta) {
    return value.data.meta;
  }

  return undefined;
};

export const getAdminUsers = async (
  input: GetAdminUsersInput = {}
): Promise<AdminUsersResult> => {
  const page = toPositiveInteger(input.page, 1);
  const limit = Math.min(toPositiveInteger(input.limit, 10), 100);

  const query: Record<string, string | number> = {
    page,
    limit,
  };

  if (input.keyword && input.keyword.trim().length > 0) {
    query.keyword = input.keyword.trim();
  }

  if (input.role && input.role.trim().length > 0) {
    query.role = input.role.trim();
  }

  const response = await get("/admin/users", query);
  const payload = response?.data;
  const items = normalizeUserCollection(payload);
  const meta = normalizeMeta(pickMetaSource(payload), page, limit, items.length);

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot fetch users",
    data: {
      items,
      meta,
    },
  };
};

export const getAdminUserById = async (
  userId: string
): Promise<AdminUserDetailResult> => {
  if (!userId || userId.trim().length === 0) {
    return {
      success: false,
      message: "Invalid user id",
      data: null,
    };
  }

  const response = await get(`/admin/users/${userId.trim()}`);
  const user = normalizeUserDetail(response?.data);

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot fetch user detail",
    data: user,
  };
};

const runUserMutation = async (
  userId: string,
  endpoint: string,
  fallbackMessage: string,
  payload?: Record<string, unknown>
): Promise<AdminUserMutationResult> => {
  if (!userId || userId.trim().length === 0) {
    return {
      success: false,
      message: "Invalid user id",
      data: null,
    };
  }

  const response = await patch(endpoint, payload);
  const user = normalizeUserDetail(response?.data);

  return {
    success: Boolean(response?.success),
    message: response?.message || fallbackMessage,
    data: user,
  };
};

export const lockAdminUser = async (
  userId: string,
  nextLocked: boolean
): Promise<AdminUserMutationResult> => {
  return runUserMutation(
    userId,
    `/admin/users/${userId.trim()}/lock`,
    "Cannot update lock state",
    { isLocked: nextLocked }
  );
};

export const promoteAdminUserToStaff = async (
  userId: string
): Promise<AdminUserMutationResult> => {
  return runUserMutation(
    userId,
    `/admin/users/${userId.trim()}/promote-staff`,
    "Cannot promote user to staff"
  );
};

export const downgradeAdminUserToUser = async (
  userId: string
): Promise<AdminUserMutationResult> => {
  return runUserMutation(
    userId,
    `/admin/users/${userId.trim()}/downgrade-staff`,
    "Cannot downgrade staff to user"
  );
};

export interface UpdateAdminUserInput {
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
  birthDate?: string;
  gender?: string;
}

export const updateAdminUser = async (
  userId: string,
  data: UpdateAdminUserInput
): Promise<AdminUserMutationResult> => {
  if (!userId || userId.trim().length === 0) {
    return {
      success: false,
      message: "Invalid user id",
      data: null,
    };
  }

  try {
    const res = await put(`/admin/users/${userId.trim()}`, {
      displayName: data.displayName?.trim(),
      email: data.email?.trim(),
      phoneNumber: data.phoneNumber?.trim(),
      photoURL: data.photoURL?.trim() || undefined,
      birthDate: data.birthDate?.trim() || undefined,
      gender: data.gender?.trim() || undefined,
    });

    if (res?.data || res?.success) {
      return {
        success: true,
        message: res?.message || "User updated successfully",
        data: normalizeUserDetail(res?.data),
      };
    }

    return {
      success: false,
      message: res?.message || "Cannot update user",
      data: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error updating user:", message);
    return { success: false, message, data: null };
  }
};
