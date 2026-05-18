"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Palette, Plus, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { categoriesApi, shopsApi } from "@/lib/api";
import { mockCategories, mockShops } from "@/lib/mock-data";
import { getApiError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/form";
import { PageHeader } from "./dashboard-shell";

const colors = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-pink-500", "bg-cyan-500"];

export function CategoriesManager() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const { data: shops = mockShops } = useQuery({ queryKey: ["shops"], queryFn: shopsApi.listMine });
  const shopId = shops[0]?.id || mockShops[0].id;
  const { data = mockCategories } = useQuery({ queryKey: ["categories", shopId], queryFn: () => categoriesApi.list(shopId), enabled: Boolean(shopId) });

  const createMutation = useMutation({
    mutationFn: () => categoriesApi.create(shopId, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", shopId] });
      setName("");
      toast.success("Category created");
    },
    onError: (error) => toast.error(getApiError(error))
  });

  const deleteMutation = useMutation({
    mutationFn: (categoryId: string) => categoriesApi.delete(shopId, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", shopId] });
      toast.success("Category deleted");
    },
    onError: (error) => toast.error(getApiError(error))
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return toast.error("Category name is required");
    createMutation.mutate();
  }

  return (
    <>
      <PageHeader title="Categories" description="Keep catalogs easy to browse with simple category management and color badges." />
      <Card className="mb-6">
        <CardContent className="p-4">
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={submit}>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Create category..." />
            <Button disabled={createMutation.isPending}><Plus className="h-4 w-4" /> Create</Button>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((category, index) => (
          <Card key={category.id}>
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <span className={`h-10 w-10 rounded-2xl ${colors[index % colors.length]}`} />
                <div>
                  <p className="font-semibold">{category.name}</p>
                  <p className="text-sm text-muted-foreground">Smart routing enabled</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon"><Palette className="h-4 w-4" /></Button>
                <Button variant="destructive" size="icon" onClick={() => deleteMutation.mutate(category.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
