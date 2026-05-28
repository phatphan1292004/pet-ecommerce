import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/toast-provider";

const primaryFont = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PetSpots - Pet E-commerce",
  description: "PetSpots Vietnam - Món ăn và thức uống cho thú cưng",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${primaryFont.variable} ${primaryFont.className} antialiased`}>
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
