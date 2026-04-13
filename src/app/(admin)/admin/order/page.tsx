import { getAdminOrders } from "@/features/admin/order/servers";
import { OrderManagementPage } from "@/features/admin/order/components";

export default async function OrderPage() {
  const result = await getAdminOrders({ page: 1, limit: 10 });

  return <OrderManagementPage initialOrders={result.data.items} initialMeta={result.data.meta} />;
}