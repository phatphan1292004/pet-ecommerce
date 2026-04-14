import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminUserDetailPage } from "@/features/admin/user/components";
import { getAdminUserById } from "@/features/admin/user/servers";

type Props = { params: { userId: string } | Promise<{ userId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = (await params) as { userId: string };

  return {
    title: `Chi tiet user ${userId}`,
  };
}

export default async function AdminUserDetailRoute({ params }: Props) {
  const { userId } = (await params) as { userId: string };
  const result = await getAdminUserById(userId);

  if (!result.data) {
    notFound();
  }

  return <AdminUserDetailPage user={result.data} />;
}
