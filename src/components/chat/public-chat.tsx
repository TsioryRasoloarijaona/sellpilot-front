"use client";

import Image from "next/image";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ClipboardList, LayoutGrid, MapPin, Package, Phone, RefreshCcw, Search, Send, ShoppingBag, Store, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { chatApi, productsApi, publicOrdersApi, shopsApi } from "@/lib/api";
import { mockProducts, mockShops } from "@/lib/mock-data";
import { formatCurrency, formatDate, getApiError, uid } from "@/lib/utils";
import type { Order, Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/form";

type ChatMessage = {
  id: string;
  role: "customer" | "ai";
  content: string;
  createdAt: Date;
  products?: Product[];
  error?: boolean;
};

type OrderForm = {
  customer_name: string;
  customer_phone: string;
  city: string;
  address: string;
  quantity: number;
  payment_method: string;
};

const EMPTY_FORM: OrderForm = {
  customer_name: "",
  customer_phone: "",
  city: "",
  address: "",
  quantity: 1,
  payment_method: ""
};

export function PublicChat({ shopId }: { shopId: string }) {
  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return "";
    const key = `sellpilot_session_${shopId}`;
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const fresh = uid("session");
    localStorage.setItem(key, fresh);
    return fresh;
  });
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [buyingProduct, setBuyingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<OrderForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<OrderForm>>({});
  const [showOrders, setShowOrders] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [celebrating, setCelebrating] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { data: shop = mockShops.find((item) => item.id === shopId) || mockShops[0] } = useQuery({ queryKey: ["shop", shopId], queryFn: () => shopsApi.get(shopId) });
  const { data: productData } = useQuery({ queryKey: ["products", shopId], queryFn: () => productsApi.list(shopId) });
  const products = productData?.products || mockProducts;

  const { data: ordersData, isFetching: ordersFetching, refetch: refetchOrders } = useQuery({
    queryKey: ["session-orders", shopId, sessionId],
    queryFn: () => publicOrdersApi.listBySession(shopId, sessionId),
    enabled: showOrders && Boolean(sessionId),
    staleTime: 0
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: (message: string) => chatApi.send({ message, session_id: sessionId, shop_id: shopId }),
    onSuccess: (response) => {
      const mentioned = detectProducts(response.response, products, response.active_product);
      setMessages((prev) => [
        ...prev,
        { id: uid("ai"), role: "ai", content: response.response, createdAt: new Date(), products: mentioned }
      ]);
    },
    onError: (error) => {
      setMessages((prev) => [
        ...prev,
        { id: uid("err"), role: "ai", content: getApiError(error), createdAt: new Date(), error: true }
      ]);
    }
  });

  const orderMutation = useMutation({
    mutationFn: () =>
      publicOrdersApi.create(shopId, {
        product_id: buyingProduct!.id,
        quantity: form.quantity,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        city: form.city,
        address: form.address,
        payment_method: form.payment_method || null,
        session_id: sessionId || null
      }),
    onSuccess: () => {
      toast.success("Order placed! The shop will contact you shortly.");
      closeDialog();
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 3000);
    },
    onError: (error) => toast.error(getApiError(error))
  });

  function send(event?: { preventDefault(): void }) {
    event?.preventDefault();
    const message = input.trim();
    if (!message || chatMutation.isPending || !sessionId) return;
    setMessages((prev) => [...prev, { id: uid("customer"), role: "customer", content: message, createdAt: new Date() }]);
    setInput("");
    chatMutation.mutate(message);
  }

  function openDialog(product: Product) {
    setBuyingProduct(product);
    setForm(EMPTY_FORM);
    setErrors({});
  }

  function closeDialog() {
    setBuyingProduct(null);
    setForm(EMPTY_FORM);
    setErrors({});
  }

  function setField<K extends keyof OrderForm>(key: K, value: OrderForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<OrderForm> = {};
    if (!form.customer_name.trim()) next.customer_name = "Required";
    if (!form.customer_phone.trim()) next.customer_phone = "Required";
    if (!form.city.trim()) next.city = "Required";
    if (!form.address.trim()) next.address = "Required";
    if (form.quantity < 1) next.quantity = 1;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submitOrder(event: { preventDefault(): void }) {
    event.preventDefault();
    if (!validate()) return;
    orderMutation.mutate();
  }

  const chatStatus = useMemo(() => (chatMutation.isError ? "Reconnecting" : "Online"), [chatMutation.isError]);

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white">
              {shop.logo_url ? (
                <Image src={shop.logo_url} alt={shop.name} fill className="object-cover" />
              ) : (
                <Store className="h-5 w-5" />
              )}
            </div>
            <div>
              <h1 className="font-semibold">{shop.name}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {chatStatus} · {shop.delivery}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              aria-label="Browse products"
              onClick={() => setShowProducts(true)}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="My orders"
              onClick={() => {
                setShowOrders(true);
                refetchOrders();
              }}
            >
              <ClipboardList className="h-4 w-4" />
            </Button>
            <Badge variant="success">AI assistant</Badge>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showOrders && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowOrders(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-card shadow-2xl"
            >
              <div className="flex h-14 shrink-0 items-center justify-between border-b px-5">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">My Orders</span>
                </div>
                <button
                  onClick={() => setShowOrders(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {ordersFetching ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
                    ))}
                  </div>
                ) : !ordersData?.orders.length ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                    <pip-mascot pose="sleep" size="200" no-shadow="" suppressHydrationWarning />
                    <p className="font-medium">No orders yet</p>
                    <p className="text-sm text-muted-foreground">Your orders will appear here after you place one.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ordersData.orders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProducts && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowProducts(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-card shadow-2xl"
            >
              <div className="flex h-14 shrink-0 items-center justify-between border-b px-5">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">All Products</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {products.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowProducts(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="shrink-0 border-b px-4 py-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search products…"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {(() => {
                  const visible = products.filter((p) =>
                    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                    p.category.toLowerCase().includes(productSearch.toLowerCase())
                  );
                  if (!visible.length) {
                    return (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                        <p className="font-medium">No products found</p>
                        <p className="text-sm text-muted-foreground">Try a different search term.</p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-3">
                      {visible.map((product) => (
                        <div key={product.id} className="overflow-hidden rounded-2xl border bg-background shadow-soft">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={400}
                              height={160}
                              className="h-36 w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-36 items-center justify-center bg-muted">
                              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <div className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate font-semibold">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.category} · {product.brand}</p>
                              </div>
                              <Badge variant={product.available ? "success" : "muted"}>
                                {product.available ? "In stock" : "Sold out"}
                              </Badge>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <div>
                                <p className="font-bold">{formatCurrency(product.price)}</p>
                                <p className="text-xs text-muted-foreground">{product.delivery_time}</p>
                              </div>
                              <p className="text-xs text-muted-foreground">{product.stock} left</p>
                            </div>
                            <Button
                              className="mt-3 w-full"
                              disabled={!product.available}
                              onClick={() => {
                                openDialog(product);
                                setShowProducts(false);
                              }}
                            >
                              <ShoppingBag className="h-4 w-4" /> Quick buy
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4">
        <div className="flex-1 space-y-5 py-6">
          {messages.length === 0 && !chatMutation.isPending && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-6 pt-10 text-center"
            >
              <pip-mascot pose="wave" size="220" speed="0.9" suppressHydrationWarning />
              <div>
                <h2 className="text-lg font-semibold">{shop.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">How can I help you today?</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "What is my order status?",
                  "What are all your products?",
                  "What about delivery?"
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setMessages([{ id: uid("customer"), role: "customer", content: q, createdAt: new Date() }]);
                      chatMutation.mutate(q);
                    }}
                    className="rounded-2xl border bg-card px-4 py-2.5 text-sm text-foreground shadow-soft transition hover:bg-muted"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={message.role === "customer" ? "flex justify-end" : "flex justify-start"}
              >
                <div className={`max-w-[88%] ${message.role === "customer" ? "sm:max-w-[70%]" : "sm:max-w-[78%]"}`}>
                  <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                    {message.role === "ai" ? <Image src="/cursor.svg" alt="AI" width={14} height={14} /> : null}
                    {message.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div
                    className={
                      message.role === "customer"
                        ? "rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-sm leading-6 text-white shadow-glow"
                        : `rounded-2xl border bg-card px-4 py-3 text-sm leading-6 shadow-soft ${message.error ? "border-red-300 text-red-600" : ""}`
                    }
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  {message.products?.length ? (
                    <ProductCards products={message.products} onBuy={openDialog} />
                  ) : null}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {chatMutation.isPending ? (
            <div className="flex justify-start items-end gap-2">
              <pip-mascot pose="think" size="100" no-shadow="" speed="1.2" suppressHydrationWarning />
              <div className="rounded-2xl border bg-card px-4 py-2.5 shadow-soft text-xs text-muted-foreground italic">
                thinking…
              </div>
            </div>
          ) : null}
          <AnimatePresence>
            {celebrating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="flex flex-col items-center gap-2 py-4"
              >
                <pip-mascot pose="celebrate" size="200" no-shadow="" speed="1.3" suppressHydrationWarning />
                <p className="text-sm font-medium text-violet-600 dark:text-violet-400">Order confirmed!</p>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} className="sticky bottom-0 border-t bg-background/85 py-4 backdrop-blur-xl">
          <div className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-soft">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) send(event);
              }}
              placeholder="Ask about products, sizes, delivery, or ordering..."
              className="max-h-36 min-h-12 flex-1 resize-none bg-transparent px-3 py-3 text-sm outline-none"
            />
            {chatMutation.isError ? (
              <Button type="button" variant="outline" size="icon" onClick={() => chatMutation.reset()}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
            ) : null}
            <Button size="icon" disabled={!input.trim() || chatMutation.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </section>

      <Dialog
        open={Boolean(buyingProduct)}
        onClose={closeDialog}
        title="Place your order"
        description={buyingProduct ? `${buyingProduct.name} — ${formatCurrency(buyingProduct.price)}` : undefined}
      >
        <form onSubmit={submitOrder} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full name" error={errors.customer_name} className="col-span-2">
              <Input
                placeholder="Maya Chen"
                value={form.customer_name}
                onChange={(e) => setField("customer_name", e.target.value)}
              />
            </Field>
            <Field label="Phone" error={errors.customer_phone}>
              <Input
                type="tel"
                placeholder="+1 555 0199"
                value={form.customer_phone}
                onChange={(e) => setField("customer_phone", e.target.value)}
              />
            </Field>
            <Field label="Quantity">
              <Input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => setField("quantity", Math.max(1, Number(e.target.value)))}
              />
            </Field>
            <Field label="City" error={errors.city}>
              <Input
                placeholder="San Francisco"
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
              />
            </Field>
            <Field label="Delivery address" error={errors.address} className="col-span-2">
              <Input
                placeholder="42 Market St"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
              />
            </Field>
            <Field label="Payment method" className="col-span-2">
              <Input
                placeholder="Cash on delivery, Mobile money… (optional)"
                value={form.payment_method}
                onChange={(e) => setField("payment_method", e.target.value)}
              />
            </Field>
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={closeDialog} disabled={orderMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={orderMutation.isPending}>
              {orderMutation.isPending ? "Placing…" : "Confirm order"}
            </Button>
          </div>
        </form>
      </Dialog>
    </main>
  );
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  shipped: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
};

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const statusClass = STATUS_STYLES[order.status] ?? "bg-muted text-muted-foreground";

  return (
    <div className="rounded-2xl border bg-background shadow-soft">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start justify-between gap-3 p-4 text-left"
      >
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">#{order.id.slice(-8).toUpperCase()}</p>
          <p className="mt-0.5 font-medium">{order.items.map((i) => i.product_name ?? "Product").join(", ")}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{formatCurrency(order.total_price)} · {formatDate(order.created_at)}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${statusClass}`}>{order.status}</span>
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t px-4 pb-4 pt-3 space-y-3 text-sm">
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Items</p>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1">
                    <span>{item.product_name ?? "Product"} × {item.quantity}</span>
                    <span className="font-medium">{formatCurrency(item.total_price)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span>{order.customer_info.name} · {order.customer_info.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{order.customer_info.delivery_address}, {order.customer_info.city}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function detectProducts(text: string, products: Product[], active?: string | null) {
  const lower = text.toLowerCase();
  const matched = products.filter((p) => lower.includes(p.name.toLowerCase()) || p.id === active);
  if (matched.length) return matched.slice(0, 3);
  if (lower.includes("product") || lower.includes("recommend") || lower.includes("sneaker")) return products.slice(0, 2);
  return [];
}

function ProductCards({ products, onBuy }: { products: Product[]; onBuy: (product: Product) => void }) {
  return (
    <div className="mt-3">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <pip-mascot pose="point" size="64" no-shadow="" speed="1.1" suppressHydrationWarning />
        <span>Here's what I found for you</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {products.map((product) => (
          <div key={product.id} className="overflow-hidden rounded-2xl border bg-card shadow-soft">
            <Image src={product.image} alt={product.name} width={420} height={220} className="h-32 w-full object-cover" />
            <div className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(product.price)} · {product.delivery_time}</p>
                </div>
                <Badge variant={product.available ? "success" : "muted"}>{product.available ? "In stock" : "Sold out"}</Badge>
              </div>
              <Button className="mt-3 w-full" disabled={!product.available} onClick={() => onBuy(product)}>
                <ShoppingBag className="h-4 w-4" /> Quick buy
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
