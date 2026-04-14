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
      <div className="hidden grid-cols-[1fr_180px_140px_70px] items-center bg-neutral-10 px-6 py-4 text-sm font-semibold text-neutral-1 md:grid">
        <span>Sản phẩm</span>
        <span className="text-left">Số lượng</span>
        <span className="text-left">Giá</span>
        <span className="text-right">&nbsp;</span>
      </div>

      <div className="divide-y divide-neutral-7">
        {items.map((item) => (
          <div key={item._id} className="px-4 py-4 md:px-6 md:py-5">
            <div className="flex gap-3 md:hidden">
              <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-lg bg-neutral-10">
                <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={item.slug ? `/products/${item.slug}` : "#"}
                  className="line-clamp-2 text-sm font-semibold text-neutral-1 transition-colors hover:text-primary-1"
                >
                  {item.name}
                </Link>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center overflow-hidden rounded-lg border border-neutral-7">
                    <button
                      onClick={() => updateItemQuantity(item._id, Math.max(1, item.quantity - 1))}
                      className="px-3 py-2 text-lg text-neutral-4 transition-colors hover:text-primary-1"
                      aria-label="Giảm số lượng"
                    >
                      -
                    </button>
                    <span className="min-w-10 border-x border-neutral-7 px-3 py-2 text-center text-neutral-1">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateItemQuantity(item._id, item.quantity + 1)}
                      className="px-3 py-2 text-lg text-neutral-4 transition-colors hover:text-primary-1"
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item._id)}
                    className="rounded-md border border-primary-1 p-2 text-primary-1 transition-colors hover:bg-primary-1 hover:text-white"
                    aria-label="Xóa sản phẩm"
                  >
                    <IoCloseOutline size={16} />
                  </button>
                </div>

                <p className="mt-3 text-lg font-bold text-neutral-1">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>

            <div className="hidden grid-cols-[1fr_180px_140px_70px] items-center gap-0 md:grid">
              <div className="flex items-center gap-4">
                <div className="relative h-25 w-25 shrink-0 overflow-hidden rounded-lg bg-neutral-10">
                  <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                </div>
                <div>
                  <Link
                    href={item.slug ? `/products/${item.slug}` : "#"}
                    className="line-clamp-2 font-semibold text-neutral-1 transition-colors hover:text-primary-1"
                  >
                    {item.name}
                  </Link>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="inline-flex items-center overflow-hidden rounded-lg border border-neutral-7">
                  <button
                    onClick={() => updateItemQuantity(item._id, Math.max(1, item.quantity - 1))}
                    className="px-3 py-2 text-lg text-neutral-4 transition-colors hover:text-primary-1"
                    aria-label="Giảm số lượng"
                  >
                    -
                  </button>
                  <span className="min-w-10 border-x border-neutral-7 px-3 py-2 text-center text-neutral-1">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateItemQuantity(item._id, item.quantity + 1)}
                    className="px-3 py-2 text-lg text-neutral-4 transition-colors hover:text-primary-1"
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
                  className="rounded-md border border-primary-1 p-2 text-primary-1 transition-colors hover:bg-primary-1 hover:text-white"
                  aria-label="Xóa sản phẩm"
                >
                  <IoCloseOutline size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
