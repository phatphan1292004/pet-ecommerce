import HeroSlider from "@/components/hero-slider";
import ProductSection from "@/components/product-section";
import { getLatestProducts } from "@/features/guest/product/servers";

export default async function Home() {
  const newProducts = await getLatestProducts();

  return (
    <div>
      <HeroSlider />
      <div className="container mx-auto">
        <ProductSection />
        <ProductSection 
          title="SẢN PHẨM MỚI"
          products={newProducts || []}
        />
      </div>
    </div>
  );
}
