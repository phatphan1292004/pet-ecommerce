import Link from "next/link";
import { CartPaymentContent, CartProgress } from "@/features/customer/cart/components";

export default function CartPaymentPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-4 sm:text-sm">
          <Link href="/" className="hover:text-primary-1 transition-colors">
            Trang chủ
          </Link>
          <span>{">"}</span>
          <span className="text-neutral-1">Thanh toán</span>
        </div>
      </div>

      <section className="container mx-auto px-4 pb-12">
        <CartProgress currentStep={3} />

        <h1 className="mb-5 text-2xl font-bold uppercase text-neutral-1 sm:text-3xl">THANH TOÁN</h1>

        <CartPaymentContent />
      </section>
    </div>
  );
}
