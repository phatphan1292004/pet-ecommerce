"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoCloseOutline, IoSearchOutline } from "react-icons/io5";

interface SearchSuggestion {
  _id: string;
  name: string;
  image: string;
  price: number;
  slug?: string;
}

interface SearchDropdownProps {
  onClose: () => void;
}

const API_BASE =
  process.env.PET_ECOMMERCE_API || "http://localhost:9000";

export default function SearchDropdown({ onClose }: SearchDropdownProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/products/search?q=${encodeURIComponent(q)}&page=1&limit=5`
      );
      if (!res.ok) throw new Error("fetch failed");
      const json = await res.json();
      const items: SearchSuggestion[] = Array.isArray(json.data)
        ? json.data.slice(0, 5)
        : [];
      setSuggestions(items);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const navigateToSearch = useCallback(
    (q: string) => {
      if (!q.trim()) return;
      onClose();
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    },
    [router, onClose]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        const item = suggestions[activeIndex];
        onClose();
        router.push(`/products/${item.slug ?? item._id}`);
      } else {
        navigateToSearch(query);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const showDropdown = query.trim().length >= 2;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-[calc(100%+12px)] z-50 w-[calc(100vw-2rem)] max-w-sm"
    >
      {/* Input box */}
      <div className="flex items-center gap-2 rounded-lg border border-neutral-20 bg-white px-4 py-2.5 shadow-lg focus-within:border-primary-3">
        <IoSearchOutline size={18} className="shrink-0 text-neutral-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tìm kiếm sản phẩm..."
          className="flex-1 bg-transparent text-sm text-neutral-1 outline-none placeholder:text-neutral-5"
          aria-label="Tìm kiếm sản phẩm"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-activedescendant={
            activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
          }
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="text-neutral-5 transition-colors hover:text-neutral-3"
            aria-label="Xóa từ khóa"
          >
            <IoCloseOutline size={18} />
          </button>
        ) : null}
      </div>

      {/* Suggestions dropdown */}
      {showDropdown && (
        <div
          id="search-suggestions"
          role="listbox"
          className="mt-1 overflow-hidden rounded-lg border border-neutral-20 bg-white shadow-xl"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-4 text-sm text-neutral-5">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-20 border-t-primary-3" />
              Đang tìm...
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((item, idx) => (
                <button
                  key={item._id}
                  id={`suggestion-${idx}`}
                  role="option"
                  aria-selected={idx === activeIndex}
                  type="button"
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${idx === activeIndex
                      ? "bg-primary-6 text-primary-1"
                      : "hover:bg-neutral-10"
                    }`}
                  onClick={() => {
                    onClose();
                    router.push(`/products/${item.slug ?? item._id}`);
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-neutral-10 bg-neutral-10">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="line-clamp-1 text-sm font-medium text-neutral-1">
                      {item.name}
                    </span>
                    <span className="text-xs font-semibold text-primary-1">
                      {item.price.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </button>
              ))}

              {/* Footer: "Xem tất cả kết quả" */}
              <button
                type="button"
                className="flex w-full items-center justify-center gap-1.5 border-t border-neutral-10 px-4 py-2.5 text-sm font-medium text-primary-3 transition-colors hover:bg-primary-6"
                onClick={() => navigateToSearch(query)}
              >
                <IoSearchOutline size={15} />
                Xem tất cả kết quả cho &ldquo;{query}&rdquo;
              </button>
            </>
          ) : (
            <div className="px-4 py-4 text-center text-sm text-neutral-5">
              Không tìm thấy sản phẩm phù hợp
            </div>
          )}
        </div>
      )}
    </div>
  );
}
