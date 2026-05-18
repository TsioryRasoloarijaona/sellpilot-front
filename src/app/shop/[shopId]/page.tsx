import { PublicChat } from "@/components/chat/public-chat";

export default async function PublicShopPage({ params }: { params: Promise<{ shopId: string }> }) {
  const { shopId } = await params;
  return <PublicChat shopId={shopId} />;
}
