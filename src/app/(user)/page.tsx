import HeroSlider from "@/components/hero-slider";
import ProductSection from "@/features/guest/product/components/product-section";
import {
  getLatestProducts,
  getPopularProducts,
  getBestSellingProducts,
  getRecommendedProductsForCustomer,
} from "@/features/guest/product/servers";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value || '';
  const newProducts = await getLatestProducts();
  const popularProducts = await getPopularProducts();
  const bestSellingProducts = await getBestSellingProducts();
  const recommendedProducts = await getRecommendedProductsForCustomer(userId, 12, 20);

  return (
    <div>
      <HeroSlider />
      <div className="container mx-auto px-4">
        {recommendedProducts && recommendedProducts.length > 0 && (
          <ProductSection products={recommendedProducts || []} />
        )}
        <ProductSection title="SẢN PHẨM MỚI" products={newProducts || []} />
        <ProductSection
          title="SẢN PHẨM ƯA CHUỘNG"
          products={popularProducts || []}
        />
        <ProductSection
          title="SẢN PHẨM BÁN CHẠY"
          products={bestSellingProducts || []}
        />
      </div>
    </div>
  );
}
