"use client";

import Image from "next/image";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, RefreshCcw, Send, ShoppingBag, Store } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { chatApi, productsApi, shopsApi } from "@/lib/api";
import { mockProducts, mockShops } from "@/lib/mock-data";
import { formatCurrency, getApiError, uid } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ChatMessage = {
  id: string;
  role: "customer" | "ai";
  content: string;
  createdAt: Date;
  products?: Product[];
  error?: boolean;
};

export function PublicChat({ shopId }: { shopId: string }) {
  const [sessionId, setSessionId] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Hi. I am your AI shopping assistant. Tell me what you are looking for and I will help you find the right product.",
      createdAt: new Date(),
      products: mockProducts.slice(0, 2)
    }
  ]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { data: shop = mockShops.find((item) => item.id === shopId) || mockShops[0] } = useQuery({ queryKey: ["shop", shopId], queryFn: () => shopsApi.get(shopId) });
  const { data: productData } = useQuery({ queryKey: ["products", shopId], queryFn: () => productsApi.list(shopId) });
  const products = productData?.products || mockProducts;

  useEffect(() => {
    const key = `sellpilot_session_${shopId}`;
    const existing = localStorage.getItem(key);
    const next = existing || uid("session");
    localStorage.setItem(key, next);
    setSessionId(next);
  }, [shopId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const mutation = useMutation({
    mutationFn: (message: string) => chatApi.send({ message, session_id: sessionId, shop_id: shopId }),
    onSuccess: (response) => {
      const mentioned = detectProducts(response.response, products, response.active_product);
      setMessages((prev) => [
        ...prev,
        {
          id: uid("ai"),
          role: "ai",
          content: response.response,
          createdAt: new Date(),
          products: mentioned
        }
      ]);
    },
    onError: (error) => {
      setMessages((prev) => [
        ...prev,
        {
          id: uid("err"),
          role: "ai",
          content: getApiError(error),
          createdAt: new Date(),
          error: true
        }
      ]);
    }
  });

  function send(event?: FormEvent) {
    event?.preventDefault();
    const message = input.trim();
    if (!message || mutation.isPending || !sessionId) return;
    setMessages((prev) => [...prev, { id: uid("customer"), role: "customer", content: message, createdAt: new Date() }]);
    setInput("");
    mutation.mutate(message);
  }

  const status = useMemo(() => (mutation.isError ? "Reconnecting" : "Online"), [mutation.isError]);

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold">{shop.name}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {status} · {shop.delivery}
              </div>
            </div>
          </div>
          <Badge variant="success">AI assistant</Badge>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4">
        <div className="flex-1 space-y-5 py-6">
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
                    {message.role === "ai" ? <Bot className="h-3.5 w-3.5" /> : null}
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
                  {message.products?.length ? <ProductCards products={message.products} /> : null}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {mutation.isPending ? (
            <div className="flex justify-start">
              <div className="rounded-2xl border bg-card px-4 py-3 shadow-soft">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:240ms]" />
                </div>
              </div>
            </div>
          ) : null}
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
            {mutation.isError ? (
              <Button type="button" variant="outline" size="icon" onClick={() => mutation.reset()}><RefreshCcw className="h-4 w-4" /></Button>
            ) : null}
            <Button size="icon" disabled={!input.trim() || mutation.isPending}><Send className="h-4 w-4" /></Button>
          </div>
        </form>
      </section>
    </main>
  );
}

function detectProducts(text: string, products: Product[], active?: string | null) {
  const lower = text.toLowerCase();
  const matched = products.filter((product) => lower.includes(product.name.toLowerCase()) || product.id === active);
  if (matched.length) return matched.slice(0, 3);
  if (lower.includes("product") || lower.includes("recommend") || lower.includes("sneaker")) return products.slice(0, 2);
  return [];
}

function ProductCards({ products }: { products: Product[] }) {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
            <Button className="mt-3 w-full" disabled={!product.available}><ShoppingBag className="h-4 w-4" /> Quick buy</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
