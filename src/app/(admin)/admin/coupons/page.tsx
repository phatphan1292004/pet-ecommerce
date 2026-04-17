import { CouponManagementPage } from "@/features/admin/coupon/components";
import { getAdminCoupons } from "@/features/admin/coupon/servers";

export default async function AdminCouponsPage() {
  const result = await getAdminCoupons({ page: 1, limit: 10 });
  return (
    <CouponManagementPage
      initialCoupons={result.data.items}
      initialMeta={result.data.meta}
      errorMessage={result.success ? "" : result.message}
    />
  );
}
