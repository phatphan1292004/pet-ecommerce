"use client";

import Link from "next/link";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { getSubCategories } from "@/features/guest/category";
import { Subcategory } from "@/types/category";

interface CategoryDropdownProps {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
}

export default function CategoryDropdown({
  categoryId,
  categoryName,
  categorySlug,
}: CategoryDropdownProps) {
  const [subcategories, setSubcategories] = useState<Subcategory[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const handleMouseEnter = async () => {
    if (fetched || loading) return;

    setLoading(true);
    try {
      const data = await getSubCategories(categoryId);
      setSubcategories(data);
      setFetched(true);
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group" onMouseEnter={handleMouseEnter}>
      <button className="flex items-center gap-1 text-neutral-1 hover:text-primary-1 transition-colors">
        {categoryName}
        <FaChevronDown size={16} />
      </button>
      <div className="absolute top-full left-0 mt-2 w-max bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {loading ? (
          <div className="px-4 py-2 text-neutral-4 text-sm">Đang tải...</div>
        ) : subcategories && subcategories.length > 0 ? (
          subcategories
            .filter((sub) => sub.is_active)
            .map((subcategory) => (
              <Link
                key={subcategory._id}
                href={`/category/${categorySlug}/${subcategory.slug}`}
                className="block px-4 py-2 hover:bg-neutral-10 text-neutral-1"
              >
                {subcategory.name}
              </Link>
            ))
        ) : (
          fetched && (
            <div className="px-4 py-2 text-neutral-4 text-sm">
              Không có danh mục
            </div>
          )
        )}
      </div>
    </div>
  );
}
