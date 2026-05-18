"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Bot, Check, MessageSquareText, Play, ShieldCheck, Sparkles, Store, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const features = [
  { icon: Bot, title: "AI sales assistant", text: "Answers questions, recommends products, and guides checkout from one conversation." },
  { icon: Store, title: "Multi-shop workspace", text: "Run separate catalogs, delivery rules, and public chat links from one dashboard." },
  { icon: BarChart3, title: "Revenue intelligence", text: "Track orders, conversation quality, product demand, and winning channels." },
  { icon: ShieldCheck, title: "Owner-ready controls", text: "Secure auth, clean product management, and order operations built for teams." }
];

const steps = ["Create your shop", "Add products", "Share your chat link", "Let AI close more orders"];
const prices = [
  { name: "Starter", price: "$0", lines: ["1 shop", "100 AI conversations", "Basic analytics"] },
  { name: "Growth", price: "$49", lines: ["5 shops", "5k conversations", "Product cards and QR links"], highlight: true },
  { name: "Scale", price: "$149", lines: ["Unlimited shops", "Advanced analytics", "Priority support"] }
];

export function LandingPage() {
  return (
    <main className="overflow-hidden">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo className="text-lg" />
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <Link href="/auth/login" className="hover:text-foreground">Login</Link>
            <Link href="/auth/register" className="hover:text-foreground">Register</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/auth/register">Start Free</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground shadow-sm">
              <Sparkles className="h-4 w-4 text-violet-500" />
              AI commerce that feels human
            </div>
            <h1 className="text-5xl font-semibold tracking-normal sm:text-6xl lg:text-7xl">
              Turn Conversations Into <span className="gradient-text">Sales</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              SellPilot gives every shop a premium AI shopping assistant that answers product questions,
              recommends the right items, and helps customers place orders from a public chat link.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/auth/register">Start Free <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#chat-preview"><Play className="h-4 w-4" /> Watch Demo</a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            id="chat-preview"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="rounded-[2rem] border bg-card p-4 shadow-glow">
              <div className="rounded-3xl border bg-background">
                <div className="flex items-center justify-between border-b p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Urban Fit</p>
                      <p className="text-xs text-emerald-500">Online now</p>
                    </div>
                  </div>
                  <MessageSquareText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-4 p-4">
                  <div className="max-w-[80%] rounded-2xl bg-muted p-3 text-sm">Hi. Do you have sneakers for daily running?</div>
                  <div className="ml-auto max-w-[80%] rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 p-3 text-sm text-white">Yes. Show me lightweight options under $150.</div>
                  <div className="max-w-[88%] rounded-2xl bg-muted p-3 text-sm">
                    I recommend Aero Runner Sneakers. They are lightweight, available in three colors, and can arrive in 24 hours.
                  </div>
                  <div className="rounded-2xl border bg-card p-3">
                    <div
                      className="h-28 rounded-xl bg-cover bg-center"
                      style={{ backgroundImage: "url(https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=900&auto=format&fit=crop)" }}
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Aero Runner Sneakers</p>
                        <p className="text-sm text-muted-foreground">$129 · In stock</p>
                      </div>
                      <Button size="sm">Buy</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">Features</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Everything a modern shop owner expects.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="transition hover:-translate-y-1 hover:shadow-glow">
              <CardHeader>
                <feature.icon className="h-6 w-6 text-violet-500" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">{feature.text}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y bg-card/50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Launch a storefront assistant in minutes.</h2>
          </div>
          <div className="grid gap-4">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-4 rounded-2xl border bg-background p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-semibold text-white">{index + 1}</span>
                <span className="font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {["SellPilot feels like adding a senior sales rep to every product page.", "The public chat link made Instagram DMs manageable again.", "Setup took an afternoon and the dashboard already feels enterprise-ready."].map((quote, index) => (
            <Card key={quote}>
              <CardContent className="pt-5">
                <p className="leading-7 text-muted-foreground">"{quote}"</p>
                <p className="mt-5 font-semibold">Founder {index + 1}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">Pricing that scales with conversations.</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {prices.map((plan) => (
            <Card key={plan.name} className={plan.highlight ? "border-violet-400 shadow-glow" : ""}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-4xl font-semibold">{plan.price}<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.lines.map((line) => (
                  <div key={line} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-500" />
                    {line}
                  </div>
                ))}
                <Button className="mt-4 w-full" variant={plan.highlight ? "primary" : "outline"}>Choose {plan.name}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Logo />
          <p>© 2026 SellPilot. Built for conversational commerce.</p>
        </div>
      </footer>
    </main>
  );
}
