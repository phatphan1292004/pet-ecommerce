import { cookies } from "next/headers";
import { AdminChatPanel } from "@/features/chat";

export default async function AdminChatPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value || "";

  return (
    <AdminChatPanel
      currentUserId={userId}
      currentUserName="Nhân viên"
    />
  );
}
