import { AdminUsersPage } from "@/features/admin/user/components";
import { getAdminUsers } from "@/features/admin/user/servers";

export default async function UserPage() {
  const result = await getAdminUsers({ page: 1, limit: 20 });

  return (
    <AdminUsersPage
      initialUsers={result.data.items}
      initialMeta={result.data.meta}
      errorMessage={result.success ? "" : result.message}
    />
  );
}