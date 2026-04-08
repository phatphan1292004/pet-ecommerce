import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ToastProvider } from "@/components/toast-provider";
import { getCategories } from "@/features/guest/category";
import { getBrands } from "@/features/guest/brand";

const primaryFont = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ODeli - Pet E-commerce",
  description: "ODeli Vietnam - Món ăn và thức uống cho thú cưng",
};

export default async function RootLayout({
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
    <html lang="vi">
      <body
        className={`${primaryFont.variable} ${primaryFont.className} antialiased flex flex-col min-h-screen`}
      >
        <ToastProvider />
        <Header isLoggedIn={isLoggedIn} categories={categories} brands={brands} />
        <main className="flex-1 bg-white">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
