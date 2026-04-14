import HeroSlider from "@/components/hero-slider";
import ProductSection from "@/features/guest/product/components/product-section";
import { getLatestProducts } from "@/features/guest/product/servers";

export default async function Home() {
  const newProducts = await getLatestProducts();

  return (
    <div>
      <HeroSlider />
      <div className="container mx-auto px-4">
        <ProductSection />
        <ProductSection title="SẢN PHẨM MỚI" products={newProducts || []} />
      </div>
    </div>
  );
}