"use client";

import Link from "next/link";
import { CartProgress, CartShippingContent } from "@/features/customer/cart/components";

export default function CartShippingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-neutral-4">
          <Link href="/" className="hover:text-primary-1 transition-colors">
            Trang chủ
          </Link>
          <span>{">"}</span>
          <span className="text-neutral-1">Đặt hàng</span>
        </div>
      </div>

      <section className="container mx-auto px-4 pb-12">
        <CartProgress currentStep={2} />

        <h1 className="mb-5 text-3xl font-bold uppercase text-neutral-1">GIAO HÀNG</h1>

        <CartShippingContent />
      </section>
    </div>
  );
}
