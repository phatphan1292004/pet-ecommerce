import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminProductEditForm } from "@/features/admin/product/components";
import { getAdminProductById } from "@/features/admin/product/servers";

type Props = { params: { id: string } | Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = (await params) as { id: string };

  return {
    title: `Chinh sua san pham ${id}`,
  };
}

export default async function AdminProductEditRoute({ params }: Props) {
  const { id } = (await params) as { id: string };
  const result = await getAdminProductById(id);

  if (!result.data) {
    notFound();
  }

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-black sm:text-lg">
            Chỉnh sửa sản phẩm
          </h2>
          <p className="text-xs text-neutral-4 sm:text-sm">Cập nhật thông tin sản phẩm</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/products/${id}`}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-20 bg-white px-4 py-2 text-xs font-medium text-neutral-2 transition hover:border-primary-1 hover:text-primary-1 sm:text-sm"
          >
            Quay lại chi tiết
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-20 bg-white px-4 py-2 text-xs font-medium text-neutral-2 transition hover:border-primary-1 hover:text-primary-1 sm:text-sm"
          >
            Danh sách sản phẩm
          </Link>
        </div>
      </div>

      <AdminProductEditForm product={result.data} variant="page" />
    </section>
  );
}
