import { DashboardPageContent } from "@/features/admin/dashboard/components";
import { getAdminDashboard } from "@/features/admin/dashboard/servers";

export default async function DashboardPage() {
  const result = await getAdminDashboard();

  return (
    <DashboardPageContent
      dashboard={result.data}
      errorMessage={result.success ? "" : result.message}
    />
  );
}