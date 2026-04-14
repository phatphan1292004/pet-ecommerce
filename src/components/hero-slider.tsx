"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useCallback } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const slides = [
  { src: "/slide_1_img.jpg", alt: "Slide 1" },
  { src: "/slide_3_img.jpg", alt: "Slide 3" },
];

export default function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide) => (
            <div key={slide.src} className="relative flex-[0_0_100%] min-w-0">
              <Image
                src={slide.src}
                alt={slide.alt}
                width={1920}
                height={600}
                className="h-47.5 w-full object-cover sm:h-70 lg:h-auto"
                priority
              />
            </div>
          ))}
        </div>
      </div>

      {/* Prev button */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-gray-700 shadow transition-colors hover:bg-white sm:flex"
      >
        <FaChevronLeft size={14} />
      </button>

      {/* Next button */}
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-gray-700 shadow transition-colors hover:bg-white sm:flex"
      >
        <FaChevronRight size={14} />
      </button>
    </div>
  );
}
