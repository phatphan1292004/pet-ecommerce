"use client";

import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import ProductCard, {
  type Product as ProductCardData,
} from "@/features/guest/product/components/product-card";
import type { FavoriteProduct } from "../servers/favorite";

interface FavoritesTabProps {
  favorites: FavoriteProduct[];
}

const toProductCardData = (favorite: FavoriteProduct): ProductCardData => ({
  _id: favorite.id,
  name: favorite.name,
  slug: favorite.slug,
  price: favorite.price,
  originalPrice: favorite.originalPrice,
  discount: favorite.discount,
  image: favorite.image,
});

export default function FavoritesTab({ favorites }: FavoritesTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-neutral-1 sm:text-lg">SẢN PHẨM YÊU THÍCH</h3>
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-6 px-3 py-1 text-sm font-medium text-primary-1">
          <FaHeart size={12} />
          {favorites.length} sản phẩm
        </span>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-7 py-16 text-neutral-5">
          <FaHeart size={40} className="text-neutral-20" />
          <p className="text-base">Ban chua co san pham yeu thich nao.</p>
          <Link
            href="/products"
            className="rounded-md bg-primary-1 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-2"
          >
            Kham pha san pham
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map((favorite) => (
            <ProductCard key={favorite.id} product={toProductCardData(favorite)} />
          ))}
        </div>
      )}
    </div>
  );
}
