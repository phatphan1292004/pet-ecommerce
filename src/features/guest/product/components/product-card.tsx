"use client";

import Image from "next/image";
import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";
import { useCartStore } from "@/store";
import { useToast } from "@/hooks";
import { GoHeart } from "react-icons/go";
import { syncOpenCartItem } from "@/features/customer/cart/servers";

export interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  review?: number;
  image: string;
  slug?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { showSuccess, showWarning } = useToast();

  const formattedPrice = product.price.toLocaleString("vi-VN") + "₫";
  const formattedOriginalPrice =
    typeof product.originalPrice === "number"
      ? product.originalPrice.toLocaleString("vi-VN") + "₫"
      : "";
  const savings = product.originalPrice ? product.originalPrice - product.price : 0;
  const formattedSavings = savings > 0 ? `Tiết kiệm ${savings.toLocaleString("vi-VN")}` : "";
  const productLink = product.slug ? `/products/${product.slug}` : "#";

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug,
      quantity: 1,
    });

    showSuccess("Đã thêm sản phẩm vào giỏ hàng");

    const result = await syncOpenCartItem({
      productId: product._id,
      quantity: 1,
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug,
    });

    if (!result.success) {
      showWarning("Chưa đồng bộ được giỏ hàng lên hệ thống");
    }
  };

  return (
    <Link href={productLink}>
      <div className="relative flex cursor-pointer flex-col gap-2 rounded-xl border border-neutral-7 bg-white p-2.5 transition-shadow hover:shadow-md sm:p-3">
      {/* Discount Badge */}
      {product.discount && product.discount > 0 && (
        <div className="absolute top-2 right-2 bg-yellow-300 text-neutral-1 font-bold text-xs px-2 py-1 rounded z-10">
          -{product.discount}%
        </div>
      )}

      {/* Image */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-neutral-10">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-2"
        />
      </div>

      {/* Price section */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-primary-1 sm:text-base">{formattedPrice}</span>
          {(formattedOriginalPrice || formattedSavings) && (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {formattedOriginalPrice && (
                <span className="text-xs text-neutral-5 line-through sm:text-sm">
                  {formattedOriginalPrice}
                </span>
              )}
              {formattedSavings && (
                <span className="text-xs font-medium text-primary-1 sm:text-sm">{formattedSavings}</span>
              )}
            </div>
          )}
        </div>
        <button className="text-neutral-5 hover:text-primary-1 transition-colors">
          <GoHeart size={16} />
        </button>
      </div>

      {/* Name */}
      <p className="mt-2 min-h-10 line-clamp-2 text-xs leading-snug text-neutral-1 sm:text-sm">
        {product.name}
      </p>

      {/* Buy button */}
      <button
        onClick={handleAddToCart}
        className="mt-auto flex items-center justify-center gap-2 rounded-full border border-primary-5 bg-primary-6 py-2 text-xs font-semibold text-primary-1 transition-colors hover:bg-primary-5 sm:text-sm"
      >
        <FaShoppingCart size={14} />
        MUA
      </button>
      </div>
    </Link>
  );
}
