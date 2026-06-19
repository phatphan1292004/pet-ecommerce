"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSearch,
  FiShield,
  FiShoppingBag,
  FiUser,
} from "react-icons/fi";
import {
  updateAdminUser,
  type AdminUser,
  type AdminUserAddress,
} from "@/features/admin/user/servers";
import { useToast } from "@/hooks";
import {
  getOrderStatusLabel,
  getOrderStatusStyles,
  getPaymentMethodLabel,
} from "@/features/admin/order/utils";

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

const toTimestamp = (value?: string) => {
  if (!value) {
    return 0;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const formatDate = (value?: string) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

const getAddressText = (address: AdminUserAddress) => {
  const parts = [address.address, address.ward, address.province]
    .map((item) => item?.trim())
    .filter((item): item is string => Boolean(item));

  return parts.length > 0 ? parts.join(", ") : "--";
};

const getOrderStatusKey = (status?: string) => {
  const normalized = (status || "").toLowerCase().replace(/\s+/g, "_").replace(/đ/g, "d");

  if (
    normalized.includes("pending") ||
    normalized.includes("cho_xac_nhan") ||
    normalized.includes("awaiting") ||
    normalized.includes("waiting")
  ) {
    return "pending";
  }

  if (normalized.includes("processing") || normalized.includes("confirmed")) {
    return "processing";
  }

  if (normalized.includes("delivering") || normalized.includes("shipping")) {
    return "delivering";
  }

  if (normalized.includes("delivered") || normalized.includes("completed")) {
    return "delivered";
  }

  if (normalized.includes("cancelled") || normalized.includes("canceled") || normalized.includes("huy")) {
    return "cancelled";
  }

  return "unknown";
};

export default function AdminUserDetailPage({ user }: AdminUserDetailPageProps) {
  const [currentUser, setCurrentUser] = useState<AdminUser>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showError, showSuccess } = useToast();

  const toInputDate = (value?: string) => {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const [form, setForm] = useState({
    displayName: user.displayName || "",
    email: user.email || "",
    phoneNumber: user.phoneNumber || "",
    photoURL: user.photoURL || "",
    birthDate: toInputDate(user.birthDate),
    gender: user.gender || "",
  });

  useEffect(() => {
    setCurrentUser(user);
    setForm({
      displayName: user.displayName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      photoURL: user.photoURL || "",
      birthDate: toInputDate(user.birthDate),
      gender: user.gender || "",
    });
  }, [user]);

  const displayName = getDisplayName(currentUser);
  const initials = getInitials(displayName);
  const roleLabel = getRoleLabel(currentUser);
  const photoURL = currentUser.photoURL?.trim();
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const addresses = useMemo(() => currentUser.addresses || [], [currentUser.addresses]);
  const orders = useMemo(() => currentUser.orders || [], [currentUser.orders]);

  const handleCancel = () => {
    setForm({
      displayName: currentUser.displayName || "",
      email: currentUser.email || "",
      phoneNumber: currentUser.phoneNumber || "",
      photoURL: currentUser.photoURL || "",
      birthDate: toInputDate(currentUser.birthDate),
      gender: currentUser.gender || "",
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!form.displayName.trim()) {
      showError("Tên hiển thị không được để trống");
      return;
    }

    if (!form.email.trim()) {
      showError("Email không được để trống");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      showError("Email không hợp lệ");
      return;
    }

    if (form.photoURL.trim() && !/^https?:\/\//i.test(form.photoURL.trim())) {
      showError("Link ảnh đại diện phải bắt đầu bằng http:// hoặc https://");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateAdminUser(currentUser.id, {
        displayName: form.displayName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        photoURL: form.photoURL,
        birthDate: form.birthDate || undefined,
        gender: form.gender || undefined,
      });

      if (result.success && result.data) {
        const updatedUser: AdminUser = {
          ...result.data,
          addresses: result.data.addresses ?? currentUser.addresses,
          orders: result.data.orders ?? currentUser.orders,
        };
        setCurrentUser(updatedUser);
        showSuccess(result.message || "Cập nhật thông tin người dùng thành công");
        setIsEditing(false);
      } else {
        showError(result.message || "Không thể cập nhật thông tin người dùng");
      }
    } catch (error) {
      console.error(error);
      showError("Đã xảy ra lỗi khi cập nhật thông tin");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredOrders = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return [...orders]
      .sort((firstOrder, secondOrder) => toTimestamp(secondOrder.createdAt) - toTimestamp(firstOrder.createdAt))
      .filter((order) => {
        const searchableValue = [
          order.id,
          order.arrivalName,
          order.arrivalPhone,
          order.arrivalAddress,
          order.paymentMethod,
        ]
          .join(" ")
          .toLowerCase();

        const matchesKeyword =
          normalizedKeyword.length === 0 || searchableValue.includes(normalizedKeyword);
        const matchesStatus =
          statusFilter === "all" || getOrderStatusKey(order.status) === statusFilter;

        return matchesKeyword && matchesStatus;
      });
  }, [keyword, orders, statusFilter]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <Link
          href="/admin/user"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-20 bg-white px-4 py-2 text-xs font-medium text-neutral-2 transition hover:border-primary-1 hover:text-primary-1 sm:text-sm"
        >
          <FiArrowLeft size={16} />
          Quay lại danh sách
        </Link>
      </div>

      <section className="grid gap-4 xl:grid-cols-[360px,minmax(0,1fr)]">
        <aside className="space-y-4">
          <article className="overflow-hidden rounded-3xl border border-neutral-20 bg-white shadow-sm">
            <div className="h-24 bg-[linear-gradient(120deg,#d3242c_0%,#e57c80_48%,#f6d3d5_100%)]" />

            <div className="-mt-10 px-4 pb-5 sm:px-5">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-primary-5 text-2xl font-semibold text-primary-1">
                {isEditing ? (
                  form.photoURL.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.photoURL.trim()} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )
                ) : photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoURL} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <div className="mt-3 space-y-2">
                {isEditing ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-4 font-semibold">Tên hiển thị</label>
                      <input
                        type="text"
                        value={form.displayName}
                        onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                        className="w-full rounded-xl border border-neutral-20 px-3 py-2 text-sm text-neutral-black outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1"
                        placeholder="Nhập tên hiển thị"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-4 font-semibold">Link ảnh đại diện</label>
                      <input
                        type="text"
                        value={form.photoURL}
                        onChange={(e) => setForm({ ...form, photoURL: e.target.value })}
                        className="w-full rounded-xl border border-neutral-20 px-3 py-2 text-sm text-neutral-black outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1"
                        placeholder="Nhập link ảnh đại diện"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl font-semibold text-neutral-black">{displayName}</h1>
                    <p className="break-all text-sm text-neutral-4">ID: {currentUser.id}</p>
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary-4 bg-primary-6 px-3 py-1 text-xs font-semibold text-primary-1">
                      <FiShield size={12} />
                      {roleLabel}
                    </span>
                  </>
                )}
              </div>

              <div className="mt-4 space-y-3 text-sm text-neutral-2">
                {isEditing ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-4 font-semibold flex items-center gap-1.5">
                        <FiMail size={13} /> Email
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-xl border border-neutral-20 px-3 py-2 text-sm text-neutral-black outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1"
                        placeholder="Nhập email"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-4 font-semibold flex items-center gap-1.5">
                        <FiPhone size={13} /> Số điện thoại
                      </label>
                      <input
                        type="text"
                        value={form.phoneNumber}
                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                        className="w-full rounded-xl border border-neutral-20 px-3 py-2 text-sm text-neutral-black outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-4 font-semibold flex items-center gap-1.5">
                        <FiCalendar size={13} /> Sinh nhật
                      </label>
                      <input
                        type="date"
                        value={form.birthDate}
                        onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                        className="w-full rounded-xl border border-neutral-20 px-3 py-2 text-sm text-neutral-black outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="flex items-center gap-2">
                      <FiMail size={14} className="text-neutral-4" />
                      <span className="truncate">{currentUser.email || "--"}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <FiPhone size={14} className="text-neutral-4" />
                      {currentUser.phoneNumber || "--"}
                    </p>
                    <p className="flex items-center gap-2">
                      <FiCalendar size={14} className="text-neutral-4" />
                      Sinh nhật: {formatDate(currentUser.birthDate)}
                    </p>
                  </>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-neutral-20 bg-neutral-10 p-3">
                  <p className="text-xs uppercase tracking-wide text-neutral-4">Đơn hàng</p>
                  <p className="mt-1 text-lg font-semibold text-neutral-black">{orders.length}</p>
                </div>
                <div className="rounded-xl border border-neutral-20 bg-neutral-10 p-3">
                  <p className="text-xs uppercase tracking-wide text-neutral-4">Tham gia</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-black">
                    {formatDate(currentUser.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-28 rounded-xl bg-primary-1 py-2 text-center text-sm font-semibold text-white transition hover:bg-primary-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSaving ? "Đang lưu..." : "Lưu"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="w-28 rounded-xl border border-neutral-20 bg-white py-2 text-center text-sm font-semibold text-neutral-2 transition hover:bg-neutral-10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-44 rounded-xl border border-primary-1 bg-white py-2 text-center text-sm font-semibold text-primary-1 transition hover:bg-primary-6"
                  >
                    Chỉnh sửa thông tin
                  </button>
                )}
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-2">
              Địa chỉ giao hàng
            </h2>

            <div className="mt-4 space-y-3">
              {addresses.length > 0 ? (
                addresses.map((address) => (
                  <div
                    key={address.id || getAddressText(address)}
                    className="rounded-xl border border-neutral-20 bg-neutral-10 px-3 py-2 text-sm text-neutral-2"
                  >
                    <p className="flex items-start gap-2">
                      <FiMapPin size={14} className="mt-0.5 text-neutral-4" />
                      <span>{getAddressText(address)}</span>
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-4">Chưa có địa chỉ nào.</p>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-2">
              Thông tin tài khoản
            </h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <dt className="text-neutral-4">Firebase UID</dt>
                <dd className="font-medium text-neutral-1">{currentUser.firebaseUid || "--"}</dd>
              </div>

              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <dt className="text-neutral-4">Giới tính</dt>
                <dd className="font-medium text-neutral-1">
                  {isEditing ? (
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="rounded-lg border border-neutral-20 px-2 py-1 text-sm text-neutral-black bg-white outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1"
                    >
                      <option value="">-- Chọn giới tính --</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  ) : (
                    currentUser.gender || "--"
                  )}
                </dd>
              </div>

              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <dt className="text-neutral-4">Mô tả vai trò</dt>
                <dd className="font-medium text-neutral-1">{currentUser.role?.description || "--"}</dd>
              </div>

              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <dt className="text-neutral-4">Ngày tạo</dt>
                <dd className="flex items-center gap-2 font-medium text-neutral-1">
                  <FiCalendar size={14} className="text-neutral-4" />
                  {formatDateTime(currentUser.createdAt)}
                </dd>
              </div>

              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <dt className="text-neutral-4">Cập nhật lần cuối</dt>
                <dd className="flex items-center gap-2 font-medium text-neutral-1">
                  <FiUser size={14} className="text-neutral-4" />
                  {formatDateTime(currentUser.updatedAt)}
                </dd>
              </div>
            </dl>
          </article>
        </aside>

        <article className="rounded-3xl border border-neutral-20 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-neutral-black">Lịch sử đơn hàng</h2>
              <p className="text-sm text-neutral-4">Tổng {orders.length} đơn hàng</p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-neutral-20 bg-neutral-10 px-3 py-1 text-xs font-medium text-neutral-3">
              <FiShoppingBag size={13} />
              {filteredOrders.length} kết quả
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr),220px]">
            <label className="relative block">
              <FiSearch
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-4"
              />
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm theo mã đơn, tên, số điện thoại"
                className="h-10 w-full rounded-lg border border-neutral-20 bg-neutral-10 pl-9 pr-3 text-sm text-neutral-2 outline-none focus:border-primary-1"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-lg border border-neutral-20 bg-neutral-10 px-3 text-sm text-neutral-2 outline-none focus:border-primary-1"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="processing">Đã xác nhận</option>
              <option value="delivering">Đang giao</option>
              <option value="delivered">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="mt-4 space-y-3">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid gap-3 rounded-xl border border-neutral-20 bg-neutral-10 p-3 md:grid-cols-[minmax(0,1fr),180px,160px] md:items-center"
                >
                  <div>
                    <p className="text-sm font-semibold text-neutral-1">Đơn hàng #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-4">
                      <FiClock size={13} />
                      {formatDateTime(order.createdAt)}
                    </p>
                    <p className="mt-1 text-sm text-neutral-2">
                      {order.arrivalName || "--"} · {order.arrivalPhone || "--"}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-neutral-4">{order.arrivalAddress || "--"}</p>
                    {order.note ? <p className="mt-1 text-xs text-neutral-4">Ghi chú: {order.note}</p> : null}
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-4">Thanh toán</p>
                    <p className="mt-1 text-sm font-medium text-neutral-1">
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </p>
                    <p className="mt-1 text-xs text-neutral-4">Mã giỏ: {order.cartId || "--"}</p>
                  </div>

                  <div className="md:text-right">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getOrderStatusStyles(order.status)}`}
                    >
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-neutral-20 bg-neutral-10 px-4 py-10 text-center text-sm text-neutral-4">
                Không có đơn hàng phù hợp bộ lọc.
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
