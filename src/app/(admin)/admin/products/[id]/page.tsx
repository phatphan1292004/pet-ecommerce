import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminProductDetailPage } from "@/features/admin/product/components";
import { getAdminProductById } from "@/features/admin/product/servers";

type Props = { params: { id: string } | Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = (await params) as { id: string };

	return {
		title: `Chi tiet san pham ${id}`,
	};
}

export default async function AdminProductDetailRoute({ params }: Props) {
	const { id } = (await params) as { id: string };
	const result = await getAdminProductById(id);

	if (!result.data) {
		notFound();
	}

	return <AdminProductDetailPage product={result.data} />;
}
