import HeroSlider from "@/components/hero-slider";
import ProductSection from "@/components/product-section";

export default function Home() {
  return (
    <div>
      <HeroSlider />
      <div className="container mx-auto">
        <ProductSection />
      </div>
    </div>
  );
}
