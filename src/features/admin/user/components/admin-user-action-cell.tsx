"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  FiAlertTriangle,
  FiEye,
  FiLoader,
  FiLock,
  FiMoreVertical,
  FiUnlock,
  FiUserMinus,
  FiUserPlus,
} from "react-icons/fi";
import {
  downgradeAdminUserToUser,
  lockAdminUser,
  promoteAdminUserToStaff,
  type AdminUser,
} from "@/features/admin/user/servers";
import { useToast } from "@/hooks";

interface UserActionCellProps {
  user: AdminUser;
  onUserUpdated?: (updatedUser: AdminUser) => void;
}

const getRoleLabel = (user: AdminUser) => {
  const roleName = user.role?.name;
  if (!roleName) {
    return "USER";
  }

  return roleName.toUpperCase();
};

const getUserLockState = (user: AdminUser): boolean => {
  if (typeof user.isLocked === "boolean") {
    return user.isLocked;
  }

  if (typeof user.isActive === "boolean") {
    return !user.isActive;
  }

  const normalizedStatus = (user.status || "").trim().toLowerCase();
  if (normalizedStatus.length === 0) {
    return false;
  }

  return ["locked", "inactive", "disabled", "blocked", "suspended"].some((keyword) =>
    normalizedStatus.includes(keyword)
  );
};

const createUserWithNextLockState = (user: AdminUser, nextLocked: boolean): AdminUser => {
  const normalizedStatus = (user.status || "").trim().toLowerCase();

  let nextStatus = user.status;
  if (normalizedStatus.length === 0) {
    nextStatus = nextLocked ? "locked" : "active";
  } else if (nextLocked) {
    nextStatus = "locked";
  } else if (["locked", "inactive", "disabled", "blocked", "suspended"].includes(normalizedStatus)) {
    nextStatus = "active";
  }

  return {
    ...user,
    isLocked: nextLocked,
    isActive: !nextLocked,
    status: nextStatus,
  };
};

const createUserWithNextRole = (user: AdminUser, nextRole: "USER" | "STAFF"): AdminUser => ({
  ...user,
  role: {
    ...(user.role || {}),
    name: nextRole,
  },
});

export default function UserActionCell({ user, onUserUpdated }: UserActionCellProps) {
  const [isMutating, startMutationTransition] = useTransition();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const actionContainerRef = useRef<HTMLDivElement | null>(null);
  const { showError, showSuccess } = useToast();

  const roleLabel = getRoleLabel(user);
  const isLocked = getUserLockState(user);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (actionContainerRef.current?.contains(target)) {
        return;
      }

      setIsMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const runMutation = (request: () => Promise<{ success: boolean; message: string; data: AdminUser | null }>) => {
    if (isMutating) {
      return;
    }

    setActionError("");

    startMutationTransition(async () => {
      const result = await request();

      if (result.success) {
        if (result.data) {
          onUserUpdated?.(result.data);
        }
        showSuccess(result.message || "Cập nhật người dùng thành công");
        setIsMenuOpen(false);
        return;
      }

      const message = result.message || "Thao tác thất bại";
      setActionError(message);
      showError(message);
      setTimeout(() => setActionError(""), 3000);
    });
  };

  const handleToggleLock = () => {
    runMutation(async () => {
      const result = await lockAdminUser(user.id, !isLocked);

      if (result.success && !result.data) {
        const fallbackUser = createUserWithNextLockState(user, !isLocked);
        return {
          ...result,
          data: fallbackUser,
        };
      }

      return result;
    });
  };

  const handlePromoteToStaff = () => {
    runMutation(async () => {
      const result = await promoteAdminUserToStaff(user.id);

      if (result.success && !result.data) {
        return {
          ...result,
          data: createUserWithNextRole(user, "STAFF"),
        };
      }

      return result;
    });
  };

  const handleDowngradeToUser = () => {
    runMutation(async () => {
      const result = await downgradeAdminUserToUser(user.id);

      if (result.success && !result.data) {
        return {
          ...result,
          data: createUserWithNextRole(user, "USER"),
        };
      }

      return result;
    });
  };

  return (
    <div className="min-w-24 text-right sm:min-w-51.25" ref={actionContainerRef}>
      <div className="flex items-center justify-end gap-2">
        <Link
          href={`/admin/user/${user.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-2.5 text-xs font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100"
          title="Chi tiết"
        >
          <FiEye size={13} />
        </Link>

        <div className="relative">
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-neutral-20 bg-white px-2.5 py-2.5 text-neutral-4 transition hover:border-primary-4 hover:text-neutral-2 disabled:cursor-not-allowed disabled:opacity-60"
            title="Tùy chọn"
            aria-label="Tùy chọn"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            disabled={isMutating}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {isMutating ? <FiLoader className="animate-spin" size={13} /> : <FiMoreVertical size={13} />}
          </button>

          {isMenuOpen ? (
            <div
              className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-neutral-20 bg-white p-1 shadow-lg"
              role="menu"
              aria-label="Hành động người dùng"
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleToggleLock}
                disabled={isMutating}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-neutral-2 transition hover:bg-primary-6 hover:text-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLocked ? <FiUnlock size={14} /> : <FiLock size={14} />}
                {isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
              </button>

              {roleLabel === "USER" ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={handlePromoteToStaff}
                  disabled={isMutating}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-neutral-2 transition hover:bg-primary-6 hover:text-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiUserPlus size={14} />
                  Nâng quyền lên STAFF
                </button>
              ) : null}

              {roleLabel === "STAFF" ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleDowngradeToUser}
                  disabled={isMutating}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-neutral-2 transition hover:bg-primary-6 hover:text-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiUserMinus size={14} />
                  Hạ quyền xuống USER
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {actionError ? (
        <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-rose-600">
          <FiAlertTriangle size={12} />
          {actionError}
        </p>
      ) : null}
    </div>
  );
}