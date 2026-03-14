import { getProductBySlug } from '@/features/guest/product/servers';
import ProductDetailPage from '@/features/guest/product/components/product-detail';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailPage product={product} />;
}
