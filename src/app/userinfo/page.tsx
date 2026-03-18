import { UserInfoPage } from "@/features/customer";
import { getUserInfo } from "@/features/customer/userinfo/servers/info";
import { getUserAddresses } from "@/features/customer/userinfo/servers/address";
import { redirect } from "next/navigation";

export default async function Page() {
  const userInfo = await getUserInfo();
  
  if (!userInfo) {
    redirect("/login");
  }

  const addresses = await getUserAddresses();
  
  return <UserInfoPage userInfo={userInfo} addresses={addresses} />;
}
