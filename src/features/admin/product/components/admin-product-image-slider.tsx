"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useCallback, useMemo } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface AdminProductImageSliderProps {
  images: string[];
  name?: string;
}

export default function AdminProductImageSlider({
  images,
  name,
}: AdminProductImageSliderProps) {
  const slides = useMemo(() => {
    if (Array.isArray(images) && images.length > 0) {
      return images;
    }

    return ["/logo.png"];
  }, [images]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative w-200 overflow-hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((src, index) => (
            <div key={`${src}-${index}`} className="relative flex-[0_0_100%] min-w-0">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-10">
                <Image
                  src={src}
                  alt={`${name || "Sản phẩm"} ${index + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 320px"
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow transition-colors hover:bg-white sm:flex"
        aria-label="Ảnh trước"
      >
        <FaChevronLeft size={12} />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow transition-colors hover:bg-white sm:flex"
        aria-label="Ảnh tiếp"
      >
        <FaChevronRight size={12} />
      </button>
    </div>
  );
}
