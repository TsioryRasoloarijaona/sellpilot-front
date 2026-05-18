"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Bot, DollarSign, Package, ShoppingBag, Store } from "lucide-react";
import { shopsApi } from "@/lib/api";
import { mockProducts, mockShops } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "./dashboard-shell";

const trend = [
  { day: "Mon", orders: 18, chats: 42 },
  { day: "Tue", orders: 24, chats: 55 },
  { day: "Wed", orders: 22, chats: 60 },
  { day: "Thu", orders: 31, chats: 75 },
  { day: "Fri", orders: 43, chats: 96 },
  { day: "Sat", orders: 38, chats: 88 },
  { day: "Sun", orders: 52, chats: 112 }
];

export function DashboardHome() {
  const { data: shops = mockShops, isLoading } = useQuery({
    queryKey: ["shops"],
    queryFn: shopsApi.listMine
  });

  const stats = [
    { label: "Total Shops", value: shops.length, icon: Store },
    { label: "Total Products", value: 184, icon: Package },
    { label: "Total Orders", value: 1268, icon: ShoppingBag },
    { label: "Revenue", value: formatCurrency(84200), icon: DollarSign },
    { label: "AI Conversations", value: "9.4k", icon: Bot }
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Your commerce control room for shops, products, orders, and AI conversations." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
            <Card>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{isLoading ? "..." : stat.value}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-violet-500/15 text-violet-500">
                  <stat.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Orders over time</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="orders" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="orders" stroke="#6366f1" fill="url(#orders)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chat activity</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="chats" radius={[8, 8, 0, 0]} fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Best selling products</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {mockProducts.map((product, index) => (
            <div key={product.id} className="flex items-center justify-between rounded-xl border p-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-sm font-semibold">{index + 1}</span>
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.category} · {product.stock} in stock</p>
                </div>
              </div>
              <p className="font-semibold">{formatCurrency(product.price * (index + 19))}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
