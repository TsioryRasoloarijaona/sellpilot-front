export type Owner = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type AuthResponse = {
  owner: Owner;
  token_type?: string;
  access_token?: string;
  token?: string;
};

export type Shop = {
  id: string;
  owner_id?: string;
  name: string;
  delivery: string;
  logo_url?: string | null;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  available: boolean;
  category: string;
  stock: number;
  delivery_time: string;
  brand: string;
  variants: string[];
  image: string;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  owner_id?: string;
  shop_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type CustomerInfo = {
  name: string;
  phone: string;
  city: string;
  delivery_address: string;
};

export type OrderItem = {
  product_id: string;
  product_name?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export type Order = {
  id: string;
  session_id?: string | null;
  shop_id: string;
  shop_name?: string | null;
  items: OrderItem[];
  total_price: number;
  status: OrderStatus;
  customer_info: CustomerInfo;
  created_at: string;
  updated_at: string;
};

export type PublicOrderCreate = {
  product_id: string;
  quantity: number;
  customer_name: string;
  customer_phone: string;
  city: string;
  address: string;
  payment_method?: string | null;
  session_id?: string | null;
};

export type ChatRequest = {
  message: string;
  session_id: string;
  shop_id?: string | null;
};

export type ChatResponse = {
  response: string;
  intent?: string | null;
  active_product?: string | null;
  session_id: string;
  confidence: number;
  steps?: string[];
  products?: Product[];
};

export type ShopPayload = Pick<Shop, "name" | "delivery">;

export type ProductCreatePayload = {
  name: string;
  price: number;
  description: string;
  available?: boolean;
  category: string;
  stock: number;
  delivery_time: string;
  brand: string;
  variants?: string[];
};

export type ProductPayload = ProductCreatePayload & {
  image?: string;
};

export type CategoryPayload = Pick<Category, "name">;

export type OrderPayload = Partial<Omit<Order, "id" | "created_at" | "updated_at">>;
export type OrderStatusPayload = { status: OrderStatus };

export type AssistantMessage = {
  id: string;
  conversation_id: string;
  role: "owner" | "assistant";
  content: string;
  created_at: string;
};

export type AssistantConversation = {
  id: string;
  owner_id: string;
  shop_id: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
};

export type AssistantConversationWithMessages = AssistantConversation & {
  messages: AssistantMessage[];
};

export type OwnerChatResponse = {
  response: string;
  intent?: string | null;
  selected_shop_id?: string | null;
  selected_shop_name?: string | null;
  current_shop_id?: string | null;
  current_shop_name?: string | null;
  steps?: string[];
};
