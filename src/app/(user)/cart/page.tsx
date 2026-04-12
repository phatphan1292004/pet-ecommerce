import Link from "next/link";
import { getOpenCart } from "@/features/customer/cart/servers";
import CartPageContent from "@/features/customer/cart/components/cart-page-content";

export default async function CartPage() {
  const openCartResponse = await getOpenCart();
  const initialItems = openCartResponse.success && openCartResponse.data
    ? openCartResponse.data.items
    : [];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-neutral-4">
          <Link href="/" className="hover:text-primary-1 transition-colors">
            Trang chủ
          </Link>
          <span>{">"}</span>
          <span className="text-neutral-1">Giỏ hàng</span>
        </div>
      </div>

      <CartPageContent initialItems={initialItems} />
    </div>
  );
}
