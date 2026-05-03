import { AdminProductsPage } from "@/features/admin/product/components";
import { getAdminProducts } from "@/features/admin/product/servers";

export default async function AdminProductsRoute() {
	const result = await getAdminProducts({ page: 1, limit: 20 });

	return (
		<AdminProductsPage
			initialProducts={result.data.items}
			initialMeta={result.data.meta}
			errorMessage={result.success ? "" : result.message}
		/>
	);
}
