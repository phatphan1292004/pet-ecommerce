import HeroSlider from "@/components/hero-slider";
import RetailBenefits from "@/components/retail-benefits";
import ProductSection from "@/features/guest/product/components/product-section";
import {
  getLatestProducts,
  getPopularProducts,
  getBestSellingProducts,
  getDiscountProgramProducts,
  getRecommendedProductsForCustomer,
} from "@/features/guest/product/servers";
import { cookies } from "next/headers";

const formatTimeline = (startDate?: string, endDate?: string): string => {
  if (!startDate || !endDate) {
    return "";
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
};

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value || "";
  const newProducts = await getLatestProducts();
  const popularProducts = await getPopularProducts();
  const bestSellingProducts = await getBestSellingProducts();
  const discountProgramData = await getDiscountProgramProducts();
  const recommendedProducts = await getRecommendedProductsForCustomer(userId, 12, 20);

  return (
    <div>
      <HeroSlider />
      <div className="container mx-auto px-4">
        {discountProgramData && (
          <ProductSection
          title={discountProgramData.name}
          subtitle={formatTimeline(discountProgramData.startDate, discountProgramData.endDate)}
          countdownTo={discountProgramData.endDate}
          products={discountProgramData.products}
          />
        )}
        {recommendedProducts && recommendedProducts.length > 0 && (
          <ProductSection products={recommendedProducts || []} />
        )}
        <ProductSection
          title="SẢN PHẨM MỚI"
          products={newProducts || []}
          viewAllHref="/category?productType=new"
        />
        <ProductSection
          title="SẢN PHẨM ƯA CHUỘNG"
          products={popularProducts || []}
          viewAllHref="/category?productType=popular"
        />
        <ProductSection
          title="SẢN PHẨM BÁN CHẠY"
          products={bestSellingProducts || []}
          viewAllHref="/category?productType=best-selling"
        />
        <RetailBenefits />
      </div>
    </div>
  );
}
