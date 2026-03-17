import Link from "next/link";

export default function CartEmptyState() {
  return (
    <div className="rounded-2xl border border-neutral-7 bg-neutral-10 p-10 text-center">
      <p className="text-lg font-medium text-neutral-2">Giỏ hàng của bạn đang trống</p>
      <p className="mt-2 text-neutral-4">Hãy thêm sản phẩm để tiếp tục mua sắm.</p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-full bg-primary-1 px-6 py-3 font-semibold text-white hover:bg-primary-2 transition-colors"
      >
        Tiếp tục mua hàng
      </Link>
    </div>
  );
}
