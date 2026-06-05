import { cookies } from "next/headers";
import Header from "@/components/header";
import Footer from "@/components/footer";
import FloatingChatButtons from "@/components/floating-chat-buttons";
import { getCategories } from "@/features/guest/category";
import { getBrands } from "@/features/guest/brand";
import { getUserInfo } from "@/features/customer/userinfo/servers/info";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const role = cookieStore.get("role")?.value?.trim().toUpperCase() ?? "";
  const isLoggedIn = !!userId && !userId.startsWith("guest-");
  const isAdmin = role === "ADMIN" || role === "STAFF";
  const categories = await getCategories();
  const brands = await getBrands();
  const userInfo = await getUserInfo();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        categories={categories}
        brands={brands}
      />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <FloatingChatButtons
        currentUserId={userId}
        currentUserName={userInfo?.displayName}
      />
      <Footer />
    </div>
  );
}