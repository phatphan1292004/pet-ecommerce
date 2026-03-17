import Image from "next/image";
import Link from "next/link";
import { IoCloseOutline } from "react-icons/io5";
import type { CartItem } from "@/store";

interface CartItemsTableProps {
  items: CartItem[];
  updateItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  formatCurrency: (value: number) => string;
}

export default function CartItemsTable({
  items,
  updateItemQuantity,
  removeItem,
  formatCurrency,
}: CartItemsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-7">
      <div className="hidden grid-cols-[1fr_180px_140px_70px] items-center bg-neutral-10 px-6 py-4 text-sm font-semibold text-neutral-2 md:grid">
        <span>Sản phẩm</span>
        <span className="text-left">Số lượng</span>
        <span className="text-left">Giá</span>
        <span className="text-right">&nbsp;</span>
      </div>

      <div className="divide-y divide-neutral-7">
        {items.map((item) => (
          <div
            key={item._id}
            className="grid grid-cols-1 gap-4 px-4 py-5 md:grid-cols-[1fr_180px_140px_70px] md:items-center md:gap-0 md:px-6"
          >
            <div className="flex items-center gap-4">
              <div className="relative h-25 w-25 shrink-0 overflow-hidden rounded-lg bg-neutral-10">
                <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
              </div>
              <div>
                <Link
                  href={item.slug ? `/products/${item.slug}` : "#"}
                  className="line-clamp-2 font-semibold text-neutral-1 hover:text-primary-1 transition-colors"
                >
                  {item.name}
                </Link>
              </div>
            </div>

            <div className="flex justify-start">
              <div className="inline-flex items-center overflow-hidden rounded-lg border border-neutral-7">
                <button
                  onClick={() => updateItemQuantity(item._id, Math.max(1, item.quantity - 1))}
                  className="px-3 py-2 text-lg text-neutral-4 hover:text-primary-1 transition-colors"
                  aria-label="Giảm số lượng"
                >
                  -
                </button>
                <span className="min-w-10 border-x border-neutral-7 px-3 py-2 text-center text-neutral-2">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateItemQuantity(item._id, item.quantity + 1)}
                  className="px-3 py-2 text-lg text-neutral-4 hover:text-primary-1 transition-colors"
                  aria-label="Tăng số lượng"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-left text-lg font-bold text-neutral-1">
              {formatCurrency(item.price * item.quantity)}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => removeItem(item._id)}
                className="rounded-md border border-primary-1 p-2 text-primary-1 hover:bg-primary-1 hover:text-white transition-colors"
                aria-label="Xóa sản phẩm"
              >
                <IoCloseOutline size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
