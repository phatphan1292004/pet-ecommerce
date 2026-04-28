import HeroSlider from "@/components/hero-slider";
import ProductSection from "@/features/guest/product/components/product-section";
import {
  getLatestProducts,
  getPopularProducts,
  getBestSellingProducts,
} from "@/features/guest/product/servers";

export default async function Home() {
  const newProducts = await getLatestProducts();
  const popularProducts = await getPopularProducts();
  const bestSellingProducts = await getBestSellingProducts();

  return (
    <div>
      <HeroSlider />
      <div className="container mx-auto px-4">
        <ProductSection products={newProducts || []} />
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
