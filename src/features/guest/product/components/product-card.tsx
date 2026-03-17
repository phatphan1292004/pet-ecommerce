"use client";

import Image from "next/image";
import Link from "next/link";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { useCartStore } from "@/store";
import { useToast } from "@/hooks";

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
  const { showSuccess } = useToast();

  const formattedPrice = product.price.toLocaleString("vi-VN") + "₫";
  const formattedOriginalPrice = product.originalPrice?.toLocaleString("vi-VN") + "₫";
  const savings = product.originalPrice ? product.originalPrice - product.price : 0;
  const formattedSavings = savings > 0 ? `Tiết kiệm ${savings.toLocaleString("vi-VN")}` : "";
  const productLink = product.slug ? `/products/${product.slug}` : "#";

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
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
  };

  return (
    <Link href={productLink}>
      <div className="bg-white rounded-xl p-3 flex flex-col gap-2 hover:shadow-md transition-shadow border border-neutral-7 relative cursor-pointer">
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
          <span className="text-primary-1 font-bold text-base">{formattedPrice}</span>
          {(formattedOriginalPrice || formattedSavings) && (
            <div className="flex items-center gap-2">
              {formattedOriginalPrice && (
                <span className="text-neutral-5 text-sm line-through">
                  {formattedOriginalPrice}
                </span>
              )}
              {formattedSavings && (
                <span className="text-primary-1 text-sm font-medium">{formattedSavings}</span>
              )}
            </div>
          )}
        </div>
        <button className="text-neutral-5 hover:text-primary-1 transition-colors">
          <FaHeart size={16} />
        </button>
      </div>

      {/* Name */}
      <p className="text-neutral-1 text-sm leading-snug line-clamp-2 min-h-10 mt-2">
        {product.name}
      </p>

      {/* Buy button */}
      <button
        onClick={handleAddToCart}
        className="flex items-center justify-center gap-2 bg-primary-6 hover:bg-primary-5 text-primary-1 font-semibold text-sm py-2 rounded-full transition-colors mt-auto border border-primary-5"
      >
        <FaShoppingCart size={14} />
        MUA
      </button>
      </div>
    </Link>
  );
}
