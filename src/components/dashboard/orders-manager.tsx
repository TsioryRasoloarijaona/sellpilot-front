"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ordersApi, shopsApi } from "@/lib/api";
import { mockOrders, mockProducts, mockShops } from "@/lib/mock-data";
import { formatDate, getApiError } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/form";
import { PageHeader } from "./dashboard-shell";

export function OrdersManager() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "delivered">("all");
  const { data: shops = mockShops } = useQuery({ queryKey: ["shops"], queryFn: shopsApi.listMine });
  const shopId = shops[0]?.id || mockShops[0].id;
  const { data } = useQuery({ queryKey: ["orders", shopId], queryFn: () => ordersApi.list(shopId), enabled: Boolean(shopId) });
  const orders = data?.orders || mockOrders;

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const matchesQuery = [order.customer_name, order.phone_number, order.delivery_address].join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === "all" || (filter === "delivered" ? order.delivered : !order.delivered);
      return matchesQuery && matchesFilter;
    });
  }, [orders, query, filter]);

  const mutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.update(shopId, orderId, { delivered: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", shopId] });
      toast.success("Order marked as delivered");
    },
    onError: (error) => toast.error(getApiError(error))
  });

  return (
    <>
      <PageHeader title="Orders" description="Search, filter, and update delivery status from a fast operations table." />
      <Card className="mb-5">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search customer, phone, address..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="flex gap-2">
            {(["all", "pending", "delivered"] as const).map((item) => (
              <Button key={item} variant={filter === item ? "primary" : "outline"} onClick={() => setFilter(item)} className="capitalize">{item}</Button>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
        <div className="hidden grid-cols-[1fr_0.8fr_1.2fr_1fr_0.5fr_0.8fr_0.9fr_0.8fr] gap-4 border-b px-5 py-3 text-xs font-medium uppercase tracking-widest text-muted-foreground xl:grid">
          <span>Customer</span><span>Phone</span><span>Address</span><span>Product</span><span>Qty</span><span>Status</span><span>Date</span><span>Action</span>
        </div>
        {filtered.map((order) => {
          const product = mockProducts.find((item) => item.id === order.product_id);
          return (
            <div key={order.id} className="grid gap-4 border-b p-4 last:border-0 xl:grid-cols-[1fr_0.8fr_1.2fr_1fr_0.5fr_0.8fr_0.9fr_0.8fr] xl:items-center">
              <p className="font-medium">{order.customer_name}</p>
              <p className="text-sm text-muted-foreground">{order.phone_number}</p>
              <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
              <p className="text-sm">{product?.name || order.product_id}</p>
              <p>{order.quantity}</p>
              <Badge variant={order.delivered ? "success" : "warning"}>{order.delivered ? "Delivered" : "Pending"}</Badge>
              <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
              <Button disabled={order.delivered || mutation.isPending} variant="outline" onClick={() => mutation.mutate(order.id)}>
                <CheckCircle2 className="h-4 w-4" /> Mark
              </Button>
            </div>
          );
        })}
      </div>
    </>
  );
}
