import { UserInfoPage } from "@/features/customer";
import { getUserInfo } from "@/features/customer/userinfo/servers/info";
import { redirect } from "next/navigation";

export default async function Page() {
  const userInfo = await getUserInfo();
  
  if (!userInfo) {
    redirect("/login");
  }
  
  return <UserInfoPage userInfo={userInfo} />;
}
