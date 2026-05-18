"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ImagePlus, Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { productsApi } from "@/lib/api";
import { getApiError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/form";
import { PageHeader } from "@/components/dashboard/dashboard-shell";

export function ProductImageUpload({ shopId, productId }: { shopId: string; productId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const backHref = `/dashboard/shops/${shopId}`;

  const { data: productData, isLoading } = useQuery({
    queryKey: ["product", shopId, productId],
    queryFn: async () => {
      const list = await productsApi.list(shopId);
      const product = list.products.find((item) => item.id === productId);
      if (!product) throw new Error("Product not found");
      return { shop: list.shop, product };
    }
  });

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error("Select an image to upload");
      return productsApi.uploadImage(shopId, productId, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", shopId] });
      queryClient.invalidateQueries({ queryKey: ["product", shopId, productId] });
      toast.success("Product image uploaded");
      router.push(backHref);
    },
    onError: (error: unknown) => toast.error(getApiError(error))
  });

  function handleFile(selected?: File) {
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      toast.error("Please select an image file");
      return;
    }
    uploadMutation.mutate();
  }

  const product = productData?.product;

  return (
    <>
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to products
          </Link>
        </Button>
      </div>
      <PageHeader
        title="Upload product image"
        description={
          product
            ? `Add an image for "${product.name}".`
            : "Add an image for your new product."
        }
      />
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImagePlus className="h-5 w-5" />
            Product image
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form className="space-y-5" onSubmit={submit}>
              {preview ? (
                <div className="flex justify-center">
                  <Image
                    src={preview}
                    alt="Preview"
                    width={240}
                    height={240}
                    unoptimized
                    className="h-60 w-60 rounded-2xl border object-cover"
                  />
                </div>
              ) : null}
              <Field label="Image file">
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-muted file:px-4 file:py-2 file:text-sm file:font-medium"
                  onChange={(event) => handleFile(event.target.files?.[0])}
                />
              </Field>
              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="ghost" asChild>
                  <Link href={backHref}>Skip for now</Link>
                </Button>
                <Button type="submit" disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Upload image
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  );
}
