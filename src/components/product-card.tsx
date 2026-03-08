import Image from "next/image";
import { FaHeart, FaShoppingCart } from "react-icons/fa";

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = product.price.toLocaleString("vi-VN") + "₫";

  return (
    <div className="bg-white rounded-xl p-3 flex flex-col gap-2 hover:shadow-md transition-shadow border border-neutral-7">
      {/* Image */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-neutral-10">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-2"
        />
      </div>

      {/* Price + Wishlist */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-primary-1 font-bold text-base">{formattedPrice}</span>
        <button className="text-neutral-5 hover:text-primary-1 transition-colors">
          <FaHeart size={16} />
        </button>
      </div>

      {/* Name */}
      <p className="text-neutral-1 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
        {product.name}
      </p>

      {/* Buy button */}
      <button className="flex items-center justify-center gap-2 bg-primary-6 hover:bg-primary-5 text-primary-1 font-semibold text-sm py-2 rounded-full transition-colors mt-auto border border-primary-5">
        <FaShoppingCart size={14} />
        MUA
      </button>
    </div>
  );
}
