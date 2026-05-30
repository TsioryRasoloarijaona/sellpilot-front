"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { getApiError } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const copy = useMemo(
    () =>
      mode === "login"
        ? { title: "Welcome back", subtitle: "Sign in to manage shops, products, orders, and AI conversations.", action: "Login" }
        : { title: "Create your workspace", subtitle: "Start building your AI sales assistant in minutes.", action: "Register" },
    [mode]
  );

  const mutation = useMutation({
    mutationFn: mode === "login" ? authApi.login : authApi.register,
    onSuccess: (data) => {
      const owner = data.owner ?? data;
      const token = data.access_token || data.token;
      setAuth(owner, token);
      toast.success(mode === "login" ? "Logged in successfully" : "Account created");
      router.push(params.get("next") || "/dashboard");
    },
    onError: (error) => toast.error(getApiError(error))
  });

  function validate() {
    const next: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Enter a valid email address.";
    if (values.password.length < (mode === "register" ? 8 : 1)) {
      next.password = mode === "register" ? "Password must be at least 8 characters." : "Enter your password.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    mutation.mutate(values);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-7 flex justify-center">
          <Logo />
        </div>
        <Card className="shadow-md">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">{copy.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <Field label="Email" error={errors.email}>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={values.email}
                    onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
                  />
                </div>
              </Field>
              <Field label="Password" error={errors.password}>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="px-9"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    placeholder="••••••••"
                    value={values.password}
                    onChange={(event) => setValues((prev) => ({ ...prev, password: event.target.value }))}
                  />
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    className="absolute right-3 top-3.5 text-muted-foreground"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              <Button className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {copy.action}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "login" ? "New to SellPilot?" : "Already have an account?"}{" "}
              <Link className="font-medium text-primary hover:underline" href={mode === "login" ? "/auth/register" : "/auth/login"}>
                {mode === "login" ? "Create an account" : "Login"}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
