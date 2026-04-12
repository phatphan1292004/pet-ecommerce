import { cookies } from "next/headers";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { getCategories } from "@/features/guest/category";
import { getBrands } from "@/features/guest/brand";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const isLoggedIn = !!userId;
  const categories = await getCategories();
  const brands = await getBrands();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header isLoggedIn={isLoggedIn} categories={categories} brands={brands} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}