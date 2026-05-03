import Link from "next/link";
import { AdminProductCreateForm } from "@/features/admin/product/components";

export default function AdminProductCreatePage() {
  return (
    <section className="space-y-4 rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-black sm:text-lg">Thêm sản phẩm</h2>
          <p className="text-xs text-neutral-4 sm:text-sm">Tạo sản phẩm mới cho cửa hàng</p>
        </div>

        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-20 bg-white px-4 py-2 text-xs font-medium text-neutral-2 transition hover:border-primary-1 hover:text-primary-1 sm:text-sm"
        >
          Quay lại danh sách
        </Link>
      </div>

      <AdminProductCreateForm />
    </section>
  );
}
