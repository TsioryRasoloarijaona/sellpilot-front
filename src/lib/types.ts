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

export type Order = {
  id: string;
  customer_name: string;
  delivery_address: string;
  phone_number: string;
  quantity: number;
  product_id: string;
  delivered: boolean;
  created_at: string;
  updated_at: string;
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
