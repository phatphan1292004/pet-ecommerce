import AdminShell from "@/components/admin/admin-shell";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_ROLES = new Set(["ADMIN", "STAFF"]);

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const role = cookieStore.get("role")?.value?.trim().toUpperCase() ?? "";

  if (!userId || userId.startsWith("guest-")) {
    redirect("/login");
  }

  if (!ADMIN_ROLES.has(role)) {
    redirect("/");
  }

  return <AdminShell>{children}</AdminShell>;
}