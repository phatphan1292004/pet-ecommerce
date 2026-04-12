"use server";
import { loginWithEmail } from "@/integrations/firebase";
import { get } from "@/integrations/storeClient";
import { cookies } from "next/headers";

type RoleName = "ADMIN" | "STAFF" | "USER";

interface SignInResult {
  success: boolean;
  userId: string;
  email: string | null;
  role: RoleName;
  redirectTo: string;
}

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
};

const unwrapDataEnvelope = (payload: unknown): unknown => {
  let current: unknown = payload;

  // API responses can be nested like { data: {...} } or { data: { data: {...} } }.
  for (let index = 0; index < 3; index += 1) {
    const currentRecord = toRecord(current);
    if (!currentRecord || currentRecord.data === undefined) {
      break;
    }

    current = currentRecord.data;
  }

  return current;
};

const normalizeRoleName = (roleValue: unknown): RoleName | null => {
  if (typeof roleValue !== "string") {
    return null;
  }

  const normalized = roleValue.trim().toUpperCase();
  if (normalized === "ADMIN" || normalized === "STAFF" || normalized === "USER") {
    return normalized;
  }

  return null;
};

const readRoleNameFromPayload = (payload: unknown): RoleName | null => {
  const record = toRecord(payload);
  return normalizeRoleName(record?.name);
};

const resolveRoleNameById = async (roleId: string): Promise<RoleName | null> => {
  const normalizedRoleId = roleId.trim();
  if (!normalizedRoleId) {
    return null;
  }

  const singularRoleName = readRoleNameFromPayload(
    unwrapDataEnvelope(await get(`/role/${normalizedRoleId}`))
  );
  if (singularRoleName) {
    return singularRoleName;
  }

  const pluralRoleName = readRoleNameFromPayload(
    unwrapDataEnvelope(await get(`/roles/${normalizedRoleId}`))
  );
  if (pluralRoleName) {
    return pluralRoleName;
  }

  return null;
};

const resolveRoleName = async (customer: unknown): Promise<RoleName> => {
  const customerRecord = toRecord(unwrapDataEnvelope(customer));
  if (!customerRecord) {
    return "USER";
  }

  const roleNameFromRoleInfo = readRoleNameFromPayload(customerRecord.roleInfo);
  if (roleNameFromRoleInfo) {
    return roleNameFromRoleInfo;
  }

  const role = customerRecord.role;

  // Case 1: API already returns role as string, for example "ADMIN".
  const directRoleName = normalizeRoleName(role);
  if (directRoleName) {
    return directRoleName;
  }

  const roleRecord = toRecord(role);

  // Case 2: role is populated object, for example { _id, name: "ADMIN" }.
  const roleNameFromObject = readRoleNameFromPayload(roleRecord);
  if (roleNameFromObject) {
    return roleNameFromObject;
  }

  const roleNameFromNestedRoleInfo = readRoleNameFromPayload(roleRecord?.roleInfo);
  if (roleNameFromNestedRoleInfo) {
    return roleNameFromNestedRoleInfo;
  }

  // Case 3: role contains only ObjectId; fetch role document to read name.
  const roleId =
    typeof role === "string"
      ? role
      : typeof roleRecord?._id === "string"
        ? roleRecord._id
        : typeof roleRecord?.id === "string"
          ? roleRecord.id
          : "";

  if (roleId.trim().length > 0) {
    const roleNameById = await resolveRoleNameById(roleId);
    if (roleNameById) {
      return roleNameById;
    }
  }

  return "USER";
};

const getRedirectTargetByRole = (role: RoleName) => {
  if (role === "ADMIN" || role === "STAFF") {
    return "/admin/dashboard";
  }

  return "/";
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await loginWithEmail(email, password);
    if (!userCredential) {
      return null;
    }
    const cookieStore = await cookies();
    const idToken = await userCredential.user.getIdToken();
    const firebaseUid = userCredential.user.uid;
    const customerResponse = await get(`/customers/${firebaseUid}`);
    const customer = unwrapDataEnvelope(customerResponse);
    const role = await resolveRoleName(customer);
    const redirectTo = getRedirectTargetByRole(role);

    cookieStore.set("userId", firebaseUid, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    cookieStore.set("token", idToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    cookieStore.set("role", role, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return {
      success: true,
      userId: firebaseUid,
      email: userCredential.user.email,
      role,
      redirectTo,
    } satisfies SignInResult;
  } catch {
    return null;
  }
};
