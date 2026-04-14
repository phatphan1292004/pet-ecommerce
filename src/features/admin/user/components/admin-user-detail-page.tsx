import Link from "next/link";
import {
  FiArrowLeft,
  FiCalendar,
  FiMail,
  FiPhone,
  FiShield,
  FiUser,
} from "react-icons/fi";
import type { AdminUser } from "@/features/admin/user/servers";

interface AdminUserDetailPageProps {
  user: AdminUser;
}

const formatDateTime = (value?: string) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDisplayName = (user: AdminUser) => {
  if (user.displayName && user.displayName.trim().length > 0) {
    return user.displayName.trim();
  }

  if (user.email && user.email.trim().length > 0) {
    return user.email.split("@")[0] || user.email;
  }

  return "Nguoi dung";
};

const getInitials = (name: string) => {
  const parts = name
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "ND";
  }

  return parts.map((item) => item.charAt(0).toUpperCase()).join("");
};

const getRoleLabel = (user: AdminUser) => user.role?.name?.toUpperCase() || "USER";

export default function AdminUserDetailPage({ user }: AdminUserDetailPageProps) {
  const displayName = getDisplayName(user);
  const initials = getInitials(displayName);
  const roleLabel = getRoleLabel(user);
  const photoURL = user.photoURL?.trim();

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/user"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-20 bg-white px-4 py-2 text-xs font-medium text-neutral-2 transition hover:border-primary-1 hover:text-primary-1 sm:text-sm"
        >
          <FiArrowLeft size={16} />
          Quay lai danh sach
        </Link>
      </div>

      <section className="rounded-3xl border border-neutral-20 bg-[linear-gradient(118deg,#fff_0%,#fff7f7_35%,#fdfefe_100%)] p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-neutral-20 bg-primary-5 text-base font-semibold text-primary-1 sm:h-16 sm:w-16 sm:text-lg">
              {photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoURL} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-4">Chi tiet user</p>
              <h1 className="text-xl font-semibold text-neutral-black sm:text-2xl">{displayName}</h1>
              <p className="mt-1 break-all text-xs text-neutral-4 sm:text-sm">ID: {user.id}</p>
            </div>
          </div>

          <span className="inline-flex self-start items-center gap-1 rounded-full border border-primary-4 bg-primary-6 px-3 py-1 text-xs font-semibold text-primary-1 sm:self-auto">
            <FiShield size={12} />
            {roleLabel}
          </span>
        </div>
      </section>

      <section className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-2">Thong tin lien he</h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <dt className="text-neutral-4">Email</dt>
              <dd className="flex items-center gap-2 font-medium text-neutral-1">
                <FiMail size={14} className="text-neutral-4" />
                {user.email || "--"}
              </dd>
            </div>

            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <dt className="text-neutral-4">So dien thoai</dt>
              <dd className="flex items-center gap-2 font-medium text-neutral-1">
                <FiPhone size={14} className="text-neutral-4" />
                {user.phoneNumber || "--"}
              </dd>
            </div>

            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <dt className="text-neutral-4">Gioi tinh</dt>
              <dd className="font-medium text-neutral-1">{user.gender || "--"}</dd>
            </div>

            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <dt className="text-neutral-4">Ngay sinh</dt>
              <dd className="font-medium text-neutral-1">{user.birthDate || "--"}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-2">Thong tin tai khoan</h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <dt className="text-neutral-4">Firebase UID</dt>
              <dd className="font-medium text-neutral-1">{user.firebaseUid || "--"}</dd>
            </div>

            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <dt className="text-neutral-4">Vai tro</dt>
              <dd className="font-medium text-neutral-1">{roleLabel}</dd>
            </div>

            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <dt className="text-neutral-4">Mo ta vai tro</dt>
              <dd className="font-medium text-neutral-1">{user.role?.description || "--"}</dd>
            </div>

            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <dt className="text-neutral-4">Ngay tao</dt>
              <dd className="flex items-center gap-2 font-medium text-neutral-1">
                <FiCalendar size={14} className="text-neutral-4" />
                {formatDateTime(user.createdAt)}
              </dd>
            </div>

            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <dt className="text-neutral-4">Cap nhat lan cuoi</dt>
              <dd className="flex items-center gap-2 font-medium text-neutral-1">
                <FiUser size={14} className="text-neutral-4" />
                {formatDateTime(user.updatedAt)}
              </dd>
            </div>
          </dl>
        </article>
      </section>
    </div>
  );
}
