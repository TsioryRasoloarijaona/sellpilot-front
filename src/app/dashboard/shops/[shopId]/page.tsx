import { ShopProducts } from "@/components/dashboard/shop-products";

export default async function ShopDetailsPage({ params }: { params: Promise<{ shopId: string }> }) {
  const { shopId } = await params;
  return <ShopProducts shopId={shopId} />;
}
