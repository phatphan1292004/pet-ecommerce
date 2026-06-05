"use server";
import {
  loginWithEmail,
  sendPasswordReset as firebaseSendPasswordReset,
} from "@/integrations/firebase";
import { get } from "@/integrations/storeClient";
import { cookies } from "next/headers";
import { mergeGuestCartIntoUserCart } from "@/features/customer/cart/servers";

type RoleName = "ADMIN" | "STAFF" | "USER";

interface SignInSuccessResult {
  success: true;
  userId: string;
  email: string | null;
  role: RoleName;
  redirectTo: string;
}

interface SignInFailureResult {
  success: false;
  reason: "recaptcha" | "invalid-credentials" | "unknown";
  message: string;
}

type SignInResult = SignInSuccessResult | SignInFailureResult;

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
  if (
    normalized === "ADMIN" ||
    normalized === "STAFF" ||
    normalized === "USER"
  ) {
    return normalized;
  }

  return null;
};

const readRoleNameFromPayload = (payload: unknown): RoleName | null => {
  const record = toRecord(payload);
  return normalizeRoleName(record?.name);
};

const resolveRoleNameById = async (
  roleId: string,
): Promise<RoleName | null> => {
  const normalizedRoleId = roleId.trim();
  if (!normalizedRoleId) {
    return null;
  }

  const singularRoleName = readRoleNameFromPayload(
    unwrapDataEnvelope(await get(`/role/${normalizedRoleId}`)),
  );
  if (singularRoleName) {
    return singularRoleName;
  }

  const pluralRoleName = readRoleNameFromPayload(
    unwrapDataEnvelope(await get(`/roles/${normalizedRoleId}`)),
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

  const roleNameFromNestedRoleInfo = readRoleNameFromPayload(
    roleRecord?.roleInfo,
  );
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

const verifyRecaptchaToken = async (token: string): Promise<boolean> => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return false;
  }

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      secret,
      response: token,
    }),
  });

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as { success?: boolean };
  return data.success === true;
};

export const signIn = async (
  email: string,
  password: string,
  recaptchaToken: string,
): Promise<SignInResult> => {
  try {
    if (!recaptchaToken) {
      return {
        success: false,
        reason: "recaptcha",
        message: "Vui lòng xác minh reCAPTCHA.",
      };
    }

    const isRecaptchaValid = await verifyRecaptchaToken(recaptchaToken);
    if (!isRecaptchaValid) {
      return {
        success: false,
        reason: "recaptcha",
        message: "Xác minh reCAPTCHA không hợp lệ.",
      };
    }

    const userCredential = await loginWithEmail(email, password);
    if (!userCredential) {
      return {
        success: false,
        reason: "invalid-credentials",
        message: "Email hoặc mật khẩu không đúng.",
      };
    }
    const cookieStore = await cookies();
    const guestId = cookieStore.get("userId")?.value;
    const idToken = await userCredential.user.getIdToken();
    const firebaseUid = userCredential.user.uid;

    if (guestId && guestId.startsWith("guest-")) {
      try {
        await mergeGuestCartIntoUserCart(guestId, firebaseUid);
      } catch (err) {
        console.error("Failed to merge guest cart on login:", err);
      }
    }

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
  } catch (error) {
    const errorCode =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: unknown }).code)
        : "";

    if (
      errorCode === "auth/invalid-credential" ||
      errorCode === "auth/user-not-found" ||
      errorCode === "auth/wrong-password"
    ) {
      return {
        success: false,
        reason: "invalid-credentials",
        message: "Email hoặc mật khẩu không đúng.",
      };
    }

    return {
      success: false,
      reason: "unknown",
      message: "Đăng nhập thất bại. Vui lòng thử lại.",
    };
  }
};

export const sendPasswordReset = async (email: string) => {
  try {
    await firebaseSendPasswordReset(email);
    return { success: true };
  } catch (err) {
    console.error("Reset password error:", err);
    return { success: false };
  }
};
