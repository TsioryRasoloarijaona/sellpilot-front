import axios from "axios";
import type {
  AssistantConversation,
  AssistantConversationWithMessages,
  AssistantMessage,
  AuthResponse,
  Category,
  CategoryPayload,
  ChatRequest,
  ChatResponse,
  Order,
  OrderPayload,
  OrderStatus,
  Owner,
  OwnerChatResponse,
  Product,
  ProductCreatePayload,
  ProductPayload,
  PublicOrderCreate,
  Shop,
  ShopPayload
} from "./types";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;
  const token = sessionStorage.getItem("sellpilot_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  register: async (payload: { email: string; password: string }) => {
    await api.post<Owner>("/api/auth/register", payload);
    return authApi.login(payload);
  },
  login: async (payload: { email: string; password: string }) => {
    const { data } = await api.post<AuthResponse>("/api/auth/login", payload);
    return data;
  },
  logout: () => api.post<void>("/api/auth/logout"),
  me: async () => {
    const { data } = await api.get<AuthResponse["owner"]>("/api/auth/me");
    return data;
  }
};

export const shopsApi = {
  listMine: async () => {
    const { data } = await api.get<Shop[]>("/api/shops/me");
    return data;
  },
  get: async (shopId: string) => {
    const { data } = await api.get<Shop>(`/api/shops/${shopId}`);
    return data;
  },
  create: async (payload: ShopPayload) => {
    const { data } = await api.post<Shop>("/api/shops", payload);
    return data;
  },
  update: async (shopId: string, payload: Partial<ShopPayload>) => {
    const { data } = await api.patch<Shop>(`/api/shops/${shopId}`, payload);
    return data;
  },
  delete: (shopId: string) => api.delete(`/api/shops/${shopId}`),
  uploadLogo: async (shopId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.put<Shop>(`/api/shops/${shopId}/logo`, form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  }
};

export const productsApi = {
  list: async (shopId: string) => {
    const { data } = await api.get<{ shop: Shop; products: Product[] }>(`/api/shops/${shopId}/products`);
    return data;
  },
  create: async (shopId: string, payload: ProductCreatePayload) => {
    const { data } = await api.post<Product>(`/api/shops/${shopId}/products`, payload);
    return data;
  },
  update: async (shopId: string, productId: string, payload: Partial<ProductPayload>) => {
    const { data } = await api.patch<Product>(`/api/shops/${shopId}/products/${productId}`, payload);
    return data;
  },
  delete: (shopId: string, productId: string) => api.delete(`/api/shops/${shopId}/products/${productId}`),
  uploadImage: async (shopId: string, productId: string, image: File) => {
    const form = new FormData();
    form.append("image", image);
    const { data } = await api.patch<Product>(`/api/shops/${shopId}/products/${productId}/image`, form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  },
  import: async (shopId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post<Record<string, unknown>>(`/api/shops/${shopId}/products/import`, form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  }
};

export const categoriesApi = {
  list: async (shopId: string) => {
    const { data } = await api.get<Category[]>(`/api/shops/${shopId}/categories`);
    return data;
  },
  create: async (shopId: string, payload: CategoryPayload) => {
    const { data } = await api.post<Category>(`/api/shops/${shopId}/categories`, payload);
    return data;
  },
  update: async (shopId: string, categoryId: string, payload: CategoryPayload) => {
    const { data } = await api.patch<Category>(`/api/shops/${shopId}/categories/${categoryId}`, payload);
    return data;
  },
  delete: (shopId: string, categoryId: string) => api.delete(`/api/shops/${shopId}/categories/${categoryId}`)
};

export const ordersApi = {
  list: async (shopId: string) => {
    const { data } = await api.get<{ shop: Shop; orders: Order[] }>(`/api/shops/${shopId}/orders`);
    return data;
  },
  update: async (shopId: string, orderId: string, payload: OrderPayload) => {
    const { data } = await api.patch<Order>(`/api/shops/${shopId}/orders/${orderId}`, payload);
    return data;
  },
  updateStatus: async (shopId: string, orderId: string, status: OrderStatus) => {
    const { data } = await api.patch<Order>(`/api/shops/${shopId}/orders/${orderId}/status`, { status });
    return data;
  }
};

export const chatApi = {
  send: async (payload: ChatRequest) => {
    const { data } = await api.post<ChatResponse>("/api/chat", payload);
    return data;
  }
};

export const assistantApi = {
  listConversations: async () => {
    const { data } = await api.get<AssistantConversation[]>("/api/assistant/conversations");
    return data;
  },
  createConversation: async (payload: { title?: string; shop_id?: string } = {}) => {
    const { data } = await api.post<AssistantConversation>("/api/assistant/conversations", payload);
    return data;
  },
  getConversation: async (id: string) => {
    const { data } = await api.get<AssistantConversationWithMessages>(`/api/assistant/conversations/${id}`);
    return data;
  },
  updateConversation: async (id: string, payload: { title: string }) => {
    const { data } = await api.patch<AssistantConversation>(`/api/assistant/conversations/${id}`, payload);
    return data;
  },
  deleteConversation: (id: string) => api.delete(`/api/assistant/conversations/${id}`),
  appendMessage: async (conversationId: string, payload: { role: "owner" | "assistant"; content: string }) => {
    const { data } = await api.post<AssistantMessage>(`/api/assistant/conversations/${conversationId}/messages`, payload);
    return data;
  }
};

export const ownerChatApi = {
  send: async (message: string) => {
    const { data } = await api.post<OwnerChatResponse>("/api/owner/chat", { message });
    return data;
  }
};

export const publicOrdersApi = {
  create: async (shopId: string, payload: PublicOrderCreate) => {
    const { data } = await api.post<Record<string, unknown>>(`/api/shops/${shopId}/orders/public`, payload);
    return data;
  },
  listBySession: async (shopId: string, sessionId: string) => {
    const { data } = await api.get<{ shop: Shop; orders: Order[] }>(`/api/shops/${shopId}/orders/session/${sessionId}`);
    return data;
  }
};
