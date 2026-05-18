import type { Category, Order, Product, Shop } from "./types";

const now = new Date().toISOString();

export const mockShops: Shop[] = [
  { id: "urban-fit", owner_id: "owner_1", name: "Urban Fit", delivery: "Same-day delivery in metro areas", created_at: now, updated_at: now },
  { id: "luna-home", owner_id: "owner_1", name: "Luna Home", delivery: "2-4 day tracked delivery", created_at: now, updated_at: now },
  { id: "nomad-tech", owner_id: "owner_1", name: "Nomad Tech", delivery: "Free delivery over $80", created_at: now, updated_at: now }
];

export const mockProducts: Product[] = [
  {
    id: "prod_1",
    name: "Aero Runner Sneakers",
    price: 129,
    description: "Lightweight knit runners with cushioned soles.",
    available: true,
    category: "Footwear",
    stock: 42,
    delivery_time: "24 hours",
    brand: "Aero",
    variants: ["Black", "Pearl", "Violet"],
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=900&auto=format&fit=crop",
    created_at: now,
    updated_at: now
  },
  {
    id: "prod_2",
    name: "Cloud Cotton Hoodie",
    price: 89,
    description: "Structured hoodie with a brushed fleece interior.",
    available: true,
    category: "Apparel",
    stock: 18,
    delivery_time: "2 days",
    brand: "Northline",
    variants: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=900&auto=format&fit=crop",
    created_at: now,
    updated_at: now
  },
  {
    id: "prod_3",
    name: "Orbit Desk Lamp",
    price: 64,
    description: "Warm dimmable lamp for focused workspaces.",
    available: false,
    category: "Home",
    stock: 0,
    delivery_time: "3 days",
    brand: "Luma",
    variants: ["Graphite", "Cream"],
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=900&auto=format&fit=crop",
    created_at: now,
    updated_at: now
  }
];

export const mockCategories: Category[] = [
  { id: "cat_1", owner_id: "owner_1", shop_id: "urban-fit", name: "Footwear", created_at: now, updated_at: now },
  { id: "cat_2", owner_id: "owner_1", shop_id: "urban-fit", name: "Apparel", created_at: now, updated_at: now },
  { id: "cat_3", owner_id: "owner_1", shop_id: "urban-fit", name: "Home", created_at: now, updated_at: now }
];

export const mockOrders: Order[] = [
  {
    id: "ord_1", shop_id: "urban-fit", shop_name: "Urban Fit", status: "pending",
    customer_info: { name: "Maya Chen", phone: "+1 555 0199", city: "San Francisco", delivery_address: "42 Market St" },
    items: [{ product_id: "prod_1", product_name: "Aero Runner Sneakers", quantity: 2, unit_price: 129, total_price: 258 }],
    total_price: 258, created_at: now, updated_at: now
  },
  {
    id: "ord_2", shop_id: "urban-fit", shop_name: "Urban Fit", status: "delivered",
    customer_info: { name: "Jon Bell", phone: "+1 555 0144", city: "Brooklyn", delivery_address: "10 Pine Ave" },
    items: [{ product_id: "prod_2", product_name: "Cloud Cotton Hoodie", quantity: 1, unit_price: 89, total_price: 89 }],
    total_price: 89, created_at: now, updated_at: now
  },
  {
    id: "ord_3", shop_id: "luna-home", shop_name: "Luna Home", status: "processing",
    customer_info: { name: "Sara Lane", phone: "+1 555 0181", city: "Austin", delivery_address: "88 Sunset Blvd" },
    items: [{ product_id: "prod_1", product_name: "Aero Runner Sneakers", quantity: 3, unit_price: 129, total_price: 387 }],
    total_price: 387, created_at: now, updated_at: now
  }
];
