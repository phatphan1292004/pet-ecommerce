export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  is_active: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  level: number;
  is_active: boolean;
  created_at: string;
  subcategories: Subcategory[];
}
