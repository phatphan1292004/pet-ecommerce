import ReportsPageContent from "@/features/admin/reports/components/reports-page-content";
import { getAdminStatistics } from "@/features/admin/reports/servers/statistics";

export default async function ReportsOrdersPage() {
  const result = await getAdminStatistics();

  return (
    <ReportsPageContent
      data={result.data}
      errorMessage={result.success ? "" : result.message}
      view="orders"
    />
  );
}
