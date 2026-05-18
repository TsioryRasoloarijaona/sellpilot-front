"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, Copy, ExternalLink, MoreHorizontal, Pencil, Plus, QrCode, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { shopsApi } from "@/lib/api";
import { mockShops } from "@/lib/mock-data";
import { formatDate, getApiError, getPublicShopUrl } from "@/lib/utils";
import type { Shop } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/form";
import { EmptyState, PageHeader } from "./dashboard-shell";

export function ShopsManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Shop | null>(null);
  const [open, setOpen] = useState(false);
  const { data = mockShops, isLoading } = useQuery({ queryKey: ["shops"], queryFn: shopsApi.listMine });

  const deleteMutation = useMutation({
    mutationFn: shopsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
      toast.success("Shop deleted");
    },
    onError: (error) => toast.error(getApiError(error))
  });

  function copyUrl(shopId: string) {
    navigator.clipboard.writeText(getPublicShopUrl(shopId));
    toast.success("Public chat URL copied");
  }

  return (
    <>
      <PageHeader
        title="Shops"
        description="Create storefronts, manage delivery promises, and share public chat links."
        action={<Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" /> Create Shop</Button>}
      />
      {data.length === 0 && !isLoading ? (
        <EmptyState title="No shops yet" text="Create your first shop to publish a public AI assistant." action={<Button onClick={() => setOpen(true)}>Create Shop</Button>} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.map((shop) => (
            <Card key={shop.id} className="transition hover:-translate-y-1 hover:shadow-glow">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{shop.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{shop.delivery}</p>
                  </div>
                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-muted p-3">
                    <p className="text-muted-foreground">Products</p>
                    <p className="text-lg font-semibold">{Math.floor(Math.random() * 45) + 8}</p>
                  </div>
                  <div className="rounded-xl bg-muted p-3">
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-semibold">{formatDate(shop.created_at)}</p>
                  </div>
                </div>
                <div className="rounded-2xl border bg-background p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <Badge variant="success">Public chat ready</Badge>
                    <QRCodeSVG value={getPublicShopUrl(shop.id)} size={58} />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{getPublicShopUrl(shop.id)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => copyUrl(shop.id)}><Copy className="h-4 w-4" /> Copy URL</Button>
                  <Button asChild variant="outline"><Link href={`/shop/${shop.id}`}><ExternalLink className="h-4 w-4" /> Open Chat</Link></Button>
                  <Button asChild variant="primary"><Link href={`/dashboard/shops/${shop.id}`}><Boxes className="h-4 w-4" /> View Products</Link></Button>
                  <Button variant="secondary" onClick={() => { setEditing(shop); setOpen(true); }}><Pencil className="h-4 w-4" /> Edit</Button>
                  <Button variant="destructive" onClick={() => deleteMutation.mutate(shop.id)}><Trash2 className="h-4 w-4" /> Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {open ? <ShopDialog shop={editing} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function ShopDialog({ shop, onClose }: { shop: Shop | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState({ name: shop?.name || "", delivery: shop?.delivery || "" });
  const mutation = useMutation({
    mutationFn: () => (shop ? shopsApi.update(shop.id, values) : shopsApi.create(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
      toast.success(shop ? "Shop updated" : "Shop created");
      onClose();
    },
    onError: (error) => toast.error(getApiError(error))
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!values.name || !values.delivery) return toast.error("Shop name and delivery information are required");
    mutation.mutate();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{shop ? "Edit shop" : "Create shop"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <Field label="Shop name">
              <Input value={values.name} onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))} placeholder="Urban Fit" />
            </Field>
            <Field label="Delivery information">
              <Textarea value={values.delivery} onChange={(event) => setValues((prev) => ({ ...prev, delivery: event.target.value }))} placeholder="Same-day delivery in metro areas" />
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save shop"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
