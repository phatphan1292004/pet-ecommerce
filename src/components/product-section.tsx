"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Link from "next/link";
import ProductCard, { type Product } from "./product-card";

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Sữa Tắm Thơm Lâu Cho Chó Mèo YÚ Spa Chai 400ml",
    price: 480000,
    image: "/products/product-1.jpg",
  },
  {
    id: 2,
    name: "4.5KG - Thức ăn chó Nutrience SubZero Small Breed Prairie...",
    price: 1430000,
    image: "/products/product-2.jpg",
  },
  {
    id: 3,
    name: "1.3KG - Thức ăn cho chó con PEDIGREE - vị Gà, Trứng và Sữ...",
    price: 149000,
    image: "/products/product-3.jpg",
  },
  {
    id: 4,
    name: "Đồ chơi cần câu CattyMan lò xo lông vũ màu cam Petmall",
    price: 159000,
    image: "/products/product-4.jpg",
  },
  {
    id: 5,
    name: "Đồ chơi cần câu CattyMan lò xo lông vũ màu xanh trắng...",
    price: 159000,
    image: "/products/product-5.jpg",
  },
  {
    id: 6,
    name: "Hạt mềm Zenith cho mèo trưởng thành vị cá hồi 1.2KG",
    price: 320000,
    image: "/products/product-6.jpg",
  },
  {
    id: 7,
    name: "Vòng cổ chó mèo có chuông đính đá dễ thương nhiều màu",
    price: 85000,
    image: "/products/product-7.jpg",
  },
];

interface ProductSectionProps {
  title?: string;
  products?: Product[];
  viewAllHref?: string;
}

export default function ProductSection({
  title = "CÓ PHẢI BẠN ĐANG TÌM ...",
  products = SAMPLE_PRODUCTS,
  viewAllHref = "/products",
}: ProductSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    slidesToScroll: 5,
    align: "start",
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="w-full px-4 py-6">
      {/* Section Header */}
      <div className="bg-primary-6 rounded-lg px-5 py-3 mb-4 flex items-center justify-between">
        <span className="bg-primary-1 text-white font-bold text-sm px-4 py-1.5 rounded-md tracking-wide">
          {title}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={scrollPrev}
            className="w-8 h-8 rounded-full bg-white border border-neutral-7 shadow flex items-center justify-center text-neutral-4 hover:text-primary-1 hover:border-primary-1 transition-colors"
          >
            <FaChevronLeft size={12} />
          </button>
          <button
            onClick={scrollNext}
            className="w-8 h-8 rounded-full bg-white border border-neutral-7 shadow flex items-center justify-center text-neutral-4 hover:text-primary-1 hover:border-primary-1 transition-colors"
          >
            <FaChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Slider */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-[0_0_calc(20%-0.6rem)] min-w-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* View All */}
      <div className="flex justify-center mt-6">
        <Link
          href={viewAllHref}
          className="border border-primary-1 text-primary-1 hover:bg-primary-6 font-medium text-sm px-8 py-3 rounded-lg transition-colors"
        >
          Tất cả sản phẩm
        </Link>
      </div>
    </section>
  );
}
