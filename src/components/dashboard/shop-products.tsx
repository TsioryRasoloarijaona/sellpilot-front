"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Filter, ImagePlus, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { FormEvent, useRef, useMemo, useState } from "react";
import { toast } from "sonner";
import { productsApi, shopsApi } from "@/lib/api";
import { mockProducts } from "@/lib/mock-data";
import { formatCurrency, getApiError } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/form";
import { EmptyState, PageHeader } from "@/components/dashboard/dashboard-shell";

// Helper to validate and fix image URLs
function getValidImageUrl(url: string): string {
  if (!url) return "https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=200&h=200&fit=crop";
  try {
    // If it's already a valid URL, return as-is
    new URL(url);
    return url;
  } catch {
    // If it looks like a URL but is invalid, try to fix it
    if (url.includes("unsplash") || url.includes("http")) {
      return "https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=200&h=200&fit=crop";
    }
    // If it's just a data URL or blob, return it as-is
    if (url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    // Default fallback
    return "https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=200&h=200&fit=crop";
  }
}

export function ShopProducts({ shopId }: { shopId: string }) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  // Fetch shop details
  const { data: shop } = useQuery({
    queryKey: ["shop", shopId],
    queryFn: () => shopsApi.get(shopId)
  });

  // Fetch products for this shop
  const { data } = useQuery({
    queryKey: ["products", shopId],
    queryFn: () => productsApi.list(shopId),
    enabled: Boolean(shopId)
  });

  const products = data?.products || mockProducts;

  const categories: string[] = ["All", ...Array.from(new Set(products.map((item: Product) => item.category))) as string[]];
  const filtered = useMemo(
    () =>
      products.filter(
        (product: Product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) &&
          (category === "All" || product.category === category)
      ),
    [products, query, category]
  );

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => productsApi.delete(shopId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", shopId] });
      toast.success("Product deleted");
    },
    onError: (error: unknown) => toast.error(getApiError(error))
  });

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/shops">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{shop?.name || "Shop"}</h1>
          <p className="text-sm text-muted-foreground">{shop?.delivery}</p>
        </div>
      </div>

      <PageHeader
        title="Products"
        description="Manage products in this shop."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4" /> Import CSV / XLSX
            </Button>
            <Button onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </div>
        }
      />

      <Card className="mb-5">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search products..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <Filter className="mt-3 h-4 w-4 text-muted-foreground" />
            {categories.map((item) => (
              <Button
                key={item}
                variant={item === category ? "primary" : "outline"}
                onClick={() => setCategory(item)}
              >
                {item}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No products found"
          text="Adjust filters or add your first product to this shop."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
          <div className="hidden grid-cols-[1.5fr_0.7fr_0.7fr_0.8fr_0.8fr_0.8fr] gap-4 border-b px-5 py-3 text-xs font-medium uppercase tracking-widest text-muted-foreground lg:grid">
            <span>Product</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Brand</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {filtered.map((product: Product) => (
            <div
              key={product.id}
              className="grid gap-4 border-b p-4 last:border-0 lg:grid-cols-[1.5fr_0.7fr_0.7fr_0.8fr_0.8fr_0.8fr] lg:items-center"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={getValidImageUrl(product.image)}
                  alt={product.name}
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] rounded-xl object-cover"
                />
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.category} · {product.delivery_time}
                  </p>
                </div>
              </div>
              <p className="font-medium">{formatCurrency(product.price)}</p>
              <Badge variant={product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "danger"}>
                {product.stock} units
              </Badge>
              <p className="text-sm text-muted-foreground">{product.brand}</p>
              <Badge variant={product.available ? "success" : "muted"}>
                {product.available ? "Available" : "Unavailable"}
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" asChild title="Upload image">
                  <Link href={`/dashboard/shops/${shopId}/products/${product.id}/image`}>
                    <ImagePlus className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setEditing(product);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteMutation.mutate(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {open ? (
        <ProductDialog shopId={shopId} product={editing} onClose={() => setOpen(false)} />
      ) : null}
      {importOpen ? (
        <ImportDialog shopId={shopId} onClose={() => setImportOpen(false)} />
      ) : null}
    </>
  );
}

const IMPORT_COLUMNS = [
  { name: "name",          type: "text",    required: true,  note: "max 160 chars" },
  { name: "price",         type: "number",  required: true,  note: "≥ 0" },
  { name: "description",   type: "text",    required: true,  note: "" },
  { name: "category",      type: "text",    required: true,  note: "max 100 chars" },
  { name: "stock",         type: "integer", required: true,  note: "≥ 0" },
  { name: "delivery_time", type: "text",    required: true,  note: "e.g. 2-3 days" },
  { name: "brand",         type: "text",    required: true,  note: "max 120 chars" },
  { name: "available",     type: "boolean", required: false, note: "true / false (default: true)" },
  { name: "variants",      type: "text",    required: false, note: "comma-separated, e.g. S,M,L" },
];

function ImportDialog({ shopId, onClose }: { shopId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const mutation = useMutation({
    mutationFn: (f: File) => productsApi.import(shopId, f),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["products", shopId] });
      toast.success("Products imported successfully");
    },
    onError: (error: unknown) => toast.error(getApiError(error))
  });

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    setFile(picked);
    setResult(null);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!file) return toast.error("Please select a CSV or XLSX file");
    mutation.mutate(file);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 p-4">
      <Card className="mx-auto my-8 w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Import Products</CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload a CSV or XLSX file to bulk-import products into this shop.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={submit}>
            {/* Column reference */}
            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Required column headers
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Column</th>
                      <th className="pb-2 pr-4 font-medium">Type</th>
                      <th className="pb-2 pr-4 font-medium">Required</th>
                      <th className="pb-2 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {IMPORT_COLUMNS.map((col) => (
                      <tr key={col.name} className="border-b last:border-0">
                        <td className="py-1.5 pr-4 font-mono text-xs font-semibold">{col.name}</td>
                        <td className="py-1.5 pr-4 text-muted-foreground">{col.type}</td>
                        <td className="py-1.5 pr-4">
                          {col.required ? (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              required
                            </span>
                          ) : (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                              optional
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 text-xs text-muted-foreground">{col.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                The first row must be the header row with exact column names as shown above.
              </p>
            </div>

            {/* File picker */}
            <div
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/30 p-8 transition hover:border-primary hover:bg-muted/40"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              {file ? (
                <p className="text-sm font-medium">{file.name}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Click to select a file</p>
              )}
              <p className="text-xs text-muted-foreground">Supported: .csv, .xlsx</p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                className="hidden"
                onChange={handleFile}
              />
            </div>

            {result ? (
              <div className="rounded-xl bg-muted p-3 text-sm">
                <p className="font-medium text-green-600">Import complete</p>
                <pre className="mt-1 overflow-x-auto text-xs text-muted-foreground">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                {result ? "Close" : "Cancel"}
              </Button>
              {!result ? (
                <Button disabled={!file || mutation.isPending}>
                  {mutation.isPending ? "Importing..." : "Import"}
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductDialog({
  shopId,
  product,
  onClose
}: {
  shopId: string;
  product: Product | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = Boolean(product);
  const [values, setValues] = useState({
    name: product?.name || "",
    price: product?.price || 0,
    description: product?.description || "",
    category: product?.category || "",
    stock: product?.stock || 0,
    brand: product?.brand || "",
    delivery_time: product?.delivery_time || "",
    variants: product?.variants.join(", ") || "",
    available: product?.available ?? true
  });

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: values.name,
        price: values.price,
        description: values.description,
        category: values.category,
        stock: values.stock,
        brand: values.brand,
        delivery_time: values.delivery_time,
        available: values.available,
        variants: values.variants
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      };
      return isEditing
        ? productsApi.update(shopId, product!.id, payload)
        : productsApi.create(shopId, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products", shopId] });
      onClose();
      if (isEditing) {
        toast.success("Product updated");
        return;
      }
      toast.success("Product created");
      router.push(`/dashboard/shops/${shopId}/products/${data.id}/image`);
    },
    onError: (error: unknown) => toast.error(getApiError(error))
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (
      !values.name ||
      !values.description ||
      !values.category ||
      !values.brand ||
      !values.delivery_time
    ) {
      toast.error("Please complete the required product fields");
      return;
    }
    mutation.mutate();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 p-4">
      <Card className="mx-auto my-8 w-full max-w-3xl">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit product" : "Add product"}</CardTitle>
          {!isEditing ? (
            <p className="text-sm text-muted-foreground">
              Enter product details first. You will upload the image on the next step.
            </p>
          ) : null}
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
            <Field label="Name">
              <Input
                value={values.name}
                onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
              />
            </Field>
            <Field label="Price">
              <Input
                type="number"
                step="0.01"
                value={values.price}
                onChange={(e) => setValues((p) => ({ ...p, price: parseFloat(e.target.value) }))}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <Textarea
                  value={values.description}
                  onChange={(e) => setValues((p) => ({ ...p, description: e.target.value }))}
                />
              </Field>
            </div>
            <Field label="Category">
              <Input
                value={values.category}
                onChange={(e) => setValues((p) => ({ ...p, category: e.target.value }))}
              />
            </Field>
            <Field label="Brand">
              <Input
                value={values.brand}
                onChange={(e) => setValues((p) => ({ ...p, brand: e.target.value }))}
              />
            </Field>
            <Field label="Stock">
              <Input
                type="number"
                value={values.stock}
                onChange={(e) => setValues((p) => ({ ...p, stock: parseInt(e.target.value) }))}
              />
            </Field>
            <Field label="Delivery Time">
              <Input
                value={values.delivery_time}
                onChange={(e) => setValues((p) => ({ ...p, delivery_time: e.target.value }))}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Variants (comma-separated)">
                <Input
                  value={values.variants}
                  onChange={(e) => setValues((p) => ({ ...p, variants: e.target.value }))}
                  placeholder="e.g., Small, Medium, Large"
                />
              </Field>
            </div>
            {isEditing ? (
              <div className="md:col-span-2">
                <Button type="button" variant="outline" asChild className="w-full">
                  <Link href={`/dashboard/shops/${shopId}/products/${product!.id}/image`}>
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Update product image
                  </Link>
                </Button>
              </div>
            ) : null}
            <div className="md:col-span-2">
              <Field label="Available">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={values.available}
                    onChange={(e) => setValues((p) => ({ ...p, available: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Product is available</span>
                </div>
              </Field>
            </div>
            <div className="flex justify-end gap-2 md:col-span-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : isEditing ? "Update product" : "Continue to image upload"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
