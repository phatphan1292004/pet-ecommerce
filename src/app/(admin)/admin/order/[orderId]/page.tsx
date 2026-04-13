import { notFound } from "next/navigation";
import type { Metadata } from "next";
import OrderDetailPage from "@/features/admin/order/components/order-detail-page";
import { getAdminOrderById } from "@/features/admin/order/servers";

type Props = { params: { orderId: string } | Promise<{ orderId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderId } = (await params) as { orderId: string };

  return {
    title: `Chi tiết đơn hàng ${orderId}`,
  };
}

export default async function AdminOrderDetailRoute({ params }: Props) {
  const { orderId } = (await params) as { orderId: string };
  const result = await getAdminOrderById(orderId);

  if (!result.success || !result.data) {
    notFound();
  }

  return <OrderDetailPage order={result.data} />;
}
