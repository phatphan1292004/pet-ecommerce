"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Link from "next/link";
import ProductCard, { type Product } from "./product-card";

interface ProductSectionProps {
  title?: string;
  subtitle?: string;
  countdownTo?: string;
  products?: Product[];
  viewAllHref?: string;
}

export default function ProductSection({
  title = "CÓ PHẢI BẠN ĐANG TÌM ...",
  countdownTo,
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
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!countdownTo) return;
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [countdownTo]);

  const countdownParts = useMemo(() => {
    if (!countdownTo) return null;

    const endTime = new Date(countdownTo).getTime();
    if (Number.isNaN(endTime)) return null;

    const totalSeconds = Math.max(0, Math.floor((endTime - now) / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds, isEnded: totalSeconds <= 0 };
  }, [countdownTo, now]);

  return (
    <section className="w-full py-5 sm:py-6">
      <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-primary-6 px-3 py-3 sm:px-5">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-fit rounded-md bg-primary-1 px-3 py-1.5 text-xs font-bold tracking-wide text-white sm:px-4 sm:text-sm">
              {title}
            </span>
            {countdownParts ? (
              <div className="flex items-center gap-1">
                <span className="rounded-md border border-primary-5 bg-white px-2 py-1 text-xs font-semibold text-primary-1 sm:text-sm">
                  {String(countdownParts.days).padStart(2, "0")}
                </span>
                <span className="px-0.5 text-xs font-semibold text-primary-1 sm:text-sm">:</span>
                <span className="rounded-md border border-primary-5 bg-white px-2 py-1 text-xs font-semibold text-primary-1 sm:text-sm">
                  {String(countdownParts.hours).padStart(2, "0")}
                </span>
                <span className="px-0.5 text-xs font-semibold text-primary-1 sm:text-sm">:</span>
                <span className="rounded-md border border-primary-5 bg-white px-2 py-1 text-xs font-semibold text-primary-1 sm:text-sm">
                  {String(countdownParts.minutes).padStart(2, "0")}
                </span>
                <span className="px-0.5 text-xs font-semibold text-primary-1 sm:text-sm">:</span>
                <span className="rounded-md border border-primary-5 bg-white px-2 py-1 text-xs font-semibold text-primary-1 sm:text-sm">
                  {String(countdownParts.seconds).padStart(2, "0")}
                </span>
                {countdownParts.isEnded ? (
                  <span className="ml-1 text-xs font-semibold text-primary-1">Da ket thuc</span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

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

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {products.map((product) => (
            <div
              key={product._id}
              className="flex flex-col shrink-0 basis-1/2 px-1.5 lg:basis-1/3 xl:basis-1/4"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

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
