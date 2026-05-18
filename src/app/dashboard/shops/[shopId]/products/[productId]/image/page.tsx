import { ProductImageUpload } from "@/components/dashboard/product-image-upload";

export default async function ProductImagePage({
  params
}: {
  params: Promise<{ shopId: string; productId: string }>;
}) {
  const { shopId, productId } = await params;
  return <ProductImageUpload shopId={shopId} productId={productId} />;
}
