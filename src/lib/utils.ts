import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDate(value?: string) {
  if (!value) return "Today";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function getPublicShopUrl(shopId: string) {
  if (typeof window === "undefined") return `https://sellpilot.ai/shop/${shopId}`;
  return `${window.location.origin}/shop/${shopId}`;
}

export function getApiError(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { detail?: unknown; message?: string } } }).response;
    const detail = response?.data?.detail;
    if (Array.isArray(detail)) return detail.map((item) => item.msg).join(", ");
    if (typeof detail === "string") return detail;
    if (response?.data?.message) return response.data.message;
  }
  return "Something went wrong. Please try again.";
}

export function uid(prefix = "sp") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
