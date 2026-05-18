"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { shopsApi } from "@/lib/api";
import { mockShops } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PageHeader } from "./dashboard-shell";

export function ProductsManager() {
  const { data: shops = mockShops } = useQuery({ queryKey: ["shops"], queryFn: shopsApi.listMine });

  return (
    <>
      <PageHeader
        title="Products"
        description="Products are managed within individual shops. Select a shop to view and manage its products."
      />
      {shops.length === 0 ? (
        <EmptyState
          title="No shops yet"
          text="Create a shop first to start managing products."
          action={
            <Button asChild>
              <Link href="/dashboard/shops">Go to Shops</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {shops.map((shop) => (
            <Card
              key={shop.id}
              className="transition hover:-translate-y-1 hover:shadow-glow"
            >
              <CardHeader>
                <CardTitle>{shop.name}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {shop.delivery}
                </p>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Click to view and manage products in this shop.
                </p>
                <Button asChild className="w-full">
                  <Link href={`/dashboard/shops/${shop.id}`}>
                    View Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
