import { UserInfoPage } from "@/features/customer";
import { getUserInfo } from "@/features/customer/userinfo/servers/info";
import { getUserAddresses } from "@/features/customer/userinfo/servers/address";
import { redirect } from "next/navigation";
import { getFavoriteProducts } from "@/features/customer/userinfo/servers";

export default async function Page() {
  const userInfo = await getUserInfo();
  
  if (!userInfo) {
    redirect("/login");
  }

  const addresses = await getUserAddresses();
  const favoriteResult = await getFavoriteProducts();
  const favorites = favoriteResult.success ? favoriteResult.data : [];

  return <UserInfoPage userInfo={userInfo} addresses={addresses} favorites={favorites} />;
}
