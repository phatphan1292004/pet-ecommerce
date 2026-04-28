"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Link from "next/link";
import ProductCard, { type Product } from "./product-card";

interface ProductSectionProps {
  title?: string;
  products?: Product[];
  viewAllHref?: string;
}

export default function ProductSection({
  title = "CÓ PHẢI BẠN ĐANG TÌM ...",
  products = [],
  viewAllHref = "/products",
}: ProductSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    slidesToScroll: 1,
    align: "start",
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="w-full py-5 sm:py-6">
      {/* Section Header */}
      <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-primary-6 px-3 py-3 sm:px-5">
        <span className="rounded-md bg-primary-1 px-3 py-1.5 text-xs font-bold tracking-wide text-white sm:px-4 sm:text-sm">
          {title}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={scrollPrev}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-7 bg-white text-neutral-4 shadow transition-colors hover:border-primary-1 hover:text-primary-1"
          >
            <FaChevronLeft size={12} />
          </button>
          <button
            onClick={scrollNext}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-7 bg-white text-neutral-4 shadow transition-colors hover:border-primary-1 hover:text-primary-1"
          >
            <FaChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Slider */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {products.map((product) => (
            <div
              key={product._id}
              className="shrink-0 basis-1/2 px-1.5 lg:basis-1/3 xl:basis-1/4"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* View All */}
      <div className="mt-6 flex justify-center">
        <Link
          href={viewAllHref}
          className="rounded-lg border border-primary-1 px-6 py-2.5 text-sm font-medium text-primary-1 transition-colors hover:bg-primary-6 sm:px-8 sm:py-3"
        >
          Tất cả sản phẩm
        </Link>
      </div>
    </section>
  );
}
