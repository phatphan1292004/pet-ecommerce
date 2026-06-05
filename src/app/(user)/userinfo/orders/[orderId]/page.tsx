import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getOrderById, getOrdersByCustomer } from "@/features/customer/userinfo/servers/orders";
import OrderDetailClient from "@/features/customer/userinfo/components/order-detail-client";
import { cookies } from "next/headers";

type Props = { params: { orderId: string } | Promise<{ orderId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderId } = (await params) as { orderId: string };
  return { title: `Chi tiết đơn ${orderId}` };
}

export default async function OrderDetailPage({ params }: Props) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId || userId.startsWith("guest-")) {
    redirect("/login");
  }
  const { orderId } = (await params) as { orderId: string };
  const result = await getOrderById(orderId);
  let order = result.success ? result.data : null;

  if (!order) {
    const listResult = await getOrdersByCustomer();
    order = listResult.data.find((item) => item._id === orderId || item.id === orderId) || null;
  }

  if (!order) {
    notFound();
  }
  return <OrderDetailClient order={order} orderId={orderId} />;
}
