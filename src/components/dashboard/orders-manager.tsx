"use client";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Store } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ordersApi, shopsApi } from "@/lib/api";
import { mockOrders, mockShops } from "@/lib/mock-data";
import { formatCurrency, formatDate, getApiError } from "@/lib/utils";
import type { Order, OrderStatus, Shop } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/form";
import { EmptyState, PageHeader } from "./dashboard-shell";

const STATUS_FILTERS = ["all", "pending", "processing", "delivered", "cancelled"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function statusVariant(status: OrderStatus) {
  switch (status) {
    case "delivered": return "success";
    case "cancelled": return "danger";
    case "pending": return "warning";
    case "shipped": return "default";
    default: return "muted";
  }
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "shipped",
  shipped: "delivered"
};

function ShopOrdersSection({ shop, orders, filter, query }: {
  shop: Shop;
  orders: Order[];
  filter: StatusFilter;
  query: string;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      ordersApi.updateStatus(shop.id, orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", shop.id] });
      toast.success("Order status updated");
    },
    onError: (error) => toast.error(getApiError(error))
  });

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const searchable = [
        order.customer_info.name,
        order.customer_info.phone,
        order.customer_info.delivery_address,
        order.customer_info.city
      ].join(" ").toLowerCase();
      const matchesQuery = !query || searchable.includes(query.toLowerCase());
      const matchesFilter =
        filter === "all" ||
        (filter === "delivered" ? order.status === "delivered" : order.status === filter);
      return matchesQuery && matchesFilter;
    });
  }, [orders, query, filter]);

  if (!filtered.length) return null;

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <Store className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-semibold">{shop.name}</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{filtered.length}</span>
      </div>
      <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
        <div className="hidden grid-cols-[1.2fr_0.9fr_1.2fr_1.4fr_0.7fr_0.9fr_0.9fr_1fr] gap-4 border-b px-5 py-3 text-xs font-medium uppercase tracking-widest text-muted-foreground xl:grid">
          <span>Customer</span>
          <span>Phone</span>
          <span>City / Address</span>
          <span>Items</span>
          <span>Total</span>
          <span>Status</span>
          <span>Date</span>
          <span>Action</span>
        </div>
        {filtered.map((order) => {
          const next = NEXT_STATUS[order.status];
          const isDone = order.status === "delivered" || order.status === "cancelled";
          return (
            <div
              key={order.id}
              className="grid gap-4 border-b p-4 last:border-0 xl:grid-cols-[1.2fr_0.9fr_1.2fr_1.4fr_0.7fr_0.9fr_0.9fr_1fr] xl:items-center"
            >
              <p className="font-medium">{order.customer_info.name}</p>
              <p className="text-sm text-muted-foreground">{order.customer_info.phone}</p>
              <div>
                <p className="text-sm">{order.customer_info.city}</p>
                <p className="text-xs text-muted-foreground">{order.customer_info.delivery_address}</p>
              </div>
              <div className="space-y-0.5">
                {order.items.map((item, i) => (
                  <p key={i} className="text-sm">
                    {item.product_name || item.product_id} <span className="text-muted-foreground">×{item.quantity}</span>
                  </p>
                ))}
              </div>
              <p className="text-sm font-medium">{formatCurrency(order.total_price)}</p>
              <Badge variant={statusVariant(order.status)} className="capitalize">{order.status}</Badge>
              <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
              <Button
                disabled={isDone || mutation.isPending}
                variant="outline"
                size="sm"
                onClick={() => next && mutation.mutate({ orderId: order.id, status: next })}
              >
                {next ? `→ ${next}` : order.status}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OrdersManager() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  const { data: shops = mockShops } = useQuery({ queryKey: ["shops"], queryFn: shopsApi.listMine });

  const shopQueries = useQueries({
    queries: shops.map((shop) => ({
      queryKey: ["orders", shop.id],
      queryFn: () => ordersApi.list(shop.id),
      enabled: shops.length > 0
    }))
  });

  const shopGroups = shops.map((shop, i) => ({
    shop,
    orders: shopQueries[i]?.data?.orders ?? (shop.id === mockShops[0].id ? mockOrders : [])
  }));

  const hasAnyOrders = shopGroups.some((g) => g.orders.length > 0);

  return (
    <>
      <PageHeader title="Orders" description="All orders across your shops, grouped by store." />
      <Card className="mb-5">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search customer, phone, address..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((s) => (
              <Button key={s} variant={filter === s ? "primary" : "outline"} onClick={() => setFilter(s)} className="capitalize">{s}</Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {!hasAnyOrders ? (
        <EmptyState title="No orders yet" text="Orders placed through your shops will appear here, grouped by store." />
      ) : (
        shopGroups.map(({ shop, orders }) => (
          <ShopOrdersSection key={shop.id} shop={shop} orders={orders} filter={filter} query={query} />
        ))
      )}
    </>
  );
}
