import { DiscountProgramManagementPage } from "@/features/admin/discount-program/components";
import { getAdminDiscountPrograms } from "@/features/admin/discount-program/servers";

export default async function AdminDiscountProgramsPage() {
	const result = await getAdminDiscountPrograms({ page: 1, limit: 10 });

	return (
		<DiscountProgramManagementPage
			initialPrograms={result.data.items}
			initialMeta={result.data.meta}
			errorMessage={result.success ? "" : result.message}
		/>
	);
}
