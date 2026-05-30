"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, BarChart3, Bot, Check, MessageSquareText,
  ShieldCheck, Sparkles, Store, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const features = [
  {
    icon: Bot,
    title: "AI sales assistant",
    text: "Answers questions, recommends products, and guides checkout from one conversation."
  },
  {
    icon: Store,
    title: "Multi-shop workspace",
    text: "Run separate catalogs, delivery rules, and public chat links from one dashboard."
  },
  {
    icon: BarChart3,
    title: "Revenue intelligence",
    text: "Track orders, conversation quality, product demand, and winning channels."
  },
  {
    icon: ShieldCheck,
    title: "Owner-ready controls",
    text: "Secure auth, clean product management, and order operations built for teams."
  }
];

const steps = [
  { n: 1, label: "Create your shop", sub: "Set up a storefront with your product catalog in minutes." },
  { n: 2, label: "Add your products", sub: "Upload items, prices, variants, and availability." },
  { n: 3, label: "Share your chat link", sub: "One URL gives customers a live AI shopping assistant." },
  { n: 4, label: "Watch orders roll in", sub: "The AI handles questions and guides checkout for you." }
];

const prices = [
  {
    name: "Starter",
    price: "$0",
    lines: ["1 shop", "100 AI conversations / mo", "Basic analytics"],
    highlight: false
  },
  {
    name: "Growth",
    price: "$49",
    lines: ["5 shops", "5 000 conversations / mo", "Product cards & QR links", "Priority support"],
    highlight: true
  },
  {
    name: "Scale",
    price: "$149",
    lines: ["Unlimited shops", "Unlimited conversations", "Advanced analytics", "Custom AI persona"],
    highlight: false
  }
];

const testimonials = [
  { quote: "SellPilot feels like adding a senior sales rep to every product page.", author: "Camille D.", role: "Fashion founder" },
  { quote: "The public chat link made Instagram DMs manageable again.", author: "Marcus T.", role: "Sneaker reseller" },
  { quote: "Setup took an afternoon and the dashboard feels enterprise-ready.", author: "Aiko M.", role: "Electronics store" }
];

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export function LandingPage() {
  return (
    <main className="overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo className="text-base" />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-foreground">Features</a>
            <a href="#how-it-works" className="transition hover:text-foreground">How it works</a>
            <a href="#pricing" className="transition hover:text-foreground">Pricing</a>
            <Link href="/auth/login" className="transition hover:text-foreground">Login</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" variant="brand" className="hidden sm:inline-flex">
              <Link href="/auth/register">Start free <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-bg">
        <div className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-6xl items-center gap-16 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <motion.div {...fadeUp} transition={{ duration: 0.6 }} className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI commerce that feels human
            </div>
            <h1 className="text-[2.75rem] font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
              Turn Conversations<br />
              Into <span className="gradient-text">Revenue</span>
            </h1>
            <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
              SellPilot gives every shop a premium AI shopping assistant that answers product
              questions, recommends the right items, and helps customers place orders from
              a single public chat link.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="brand">
                <Link href="/auth/register">Get started free <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-5 text-sm text-muted-foreground">
              {["No credit card required", "Setup in 5 min", "Cancel anytime"].map((s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />{s}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Chat preview */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative mx-auto w-full max-w-sm"
          >
            <div className="rounded-3xl border bg-card p-3 shadow-glow">
              <div className="overflow-hidden rounded-2xl border bg-background">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white">
                      <Store className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Urban Fit</p>
                      <p className="text-[11px] text-emerald-500">● Online now</p>
                    </div>
                  </div>
                  <MessageSquareText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-3 p-4 text-sm">
                  <div className="max-w-[78%] rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5">
                    Do you have running sneakers under $150?
                  </div>
                  <div className="ml-auto max-w-[78%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2.5 text-white">
                    Yes! Here are my top picks — lightweight and fast delivery.
                  </div>
                  <div className="overflow-hidden rounded-2xl border bg-card">
                    <div
                      className="h-24 bg-cover bg-center"
                      style={{ backgroundImage: "url(https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=900&auto=format&fit=crop)" }}
                    />
                    <div className="flex items-center justify-between p-3">
                      <div>
                        <p className="font-semibold">Aero Runner</p>
                        <p className="text-xs text-muted-foreground">$129 · In stock</p>
                      </div>
                      <Button size="sm" variant="brand" className="h-7 px-3 text-xs">Buy now</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -bottom-6 -right-6 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 max-w-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Features</p>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Everything a modern shop owner needs.</h2>
          <p className="mt-3 text-muted-foreground">One platform to manage your stores, AI, and revenue — no duct tape required.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className="h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <CardHeader>
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <f.icon className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-sm">{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">{f.text}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">How it works</p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Live in minutes, not weeks.</h2>
            <p className="mt-3 text-muted-foreground">No developers needed. Set up your AI storefront in four simple steps.</p>
          </div>
          <div className="grid gap-3">
            {steps.map((step) => (
              <div key={step.n} className="flex items-start gap-4 rounded-xl border bg-card p-4 shadow-soft">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-brand text-sm font-bold text-white">
                  {step.n}
                </span>
                <div>
                  <p className="font-medium">{step.label}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Testimonials</p>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Trusted by founders who sell.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.author} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <Zap className="mb-3 h-4 w-4 text-primary" />
                <p className="text-sm leading-relaxed text-muted-foreground">"{t.quote}"</p>
                <div className="mt-4">
                  <p className="text-sm font-semibold">{t.author}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Pricing</p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Scales with your business.</h2>
            <p className="mt-3 text-muted-foreground">Start free, upgrade when you're ready.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {prices.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "relative",
                  plan.highlight && "border-primary shadow-glow"
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full gradient-brand px-3 py-0.5 text-[11px] font-semibold text-white shadow-glow-sm">
                      Most popular
                    </span>
                  </div>
                )}
                <CardHeader className="pt-7">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{plan.name}</p>
                  <p className="mt-1 text-4xl font-bold tracking-tight">
                    {plan.price}
                    <span className="text-base font-normal text-muted-foreground">/mo</span>
                  </p>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {plan.lines.map((line) => (
                    <div key={line} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {line}
                    </div>
                  ))}
                  <Button
                    asChild
                    className="mt-4 w-full"
                    variant={plan.highlight ? "brand" : "outline"}
                  >
                    <Link href="/auth/register">Get {plan.name}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo />
          <p>© 2026 SellPilot · Built for conversational commerce.</p>
        </div>
      </footer>
    </main>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
