# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript check (no emit)
```

There is no test suite configured.

## Architecture

**SellPilot** is a SaaS frontend for e-commerce shop owners. It has two distinct surfaces:
- **Public shop** (`/shop/[shopId]`) — AI-powered customer chat interface for a specific shop
- **Owner dashboard** (`/dashboard/**`) — authenticated CRUD management for shops, products, orders, categories, and analytics

### Route Map

```
/                        → Landing page (public)
/auth/login|register     → Auth forms
/shop/[shopId]           → Customer-facing AI chat (public)
/dashboard               → Home stats
/dashboard/shops         → Shops CRUD + per-shop products
/dashboard/products      → Products across shops
/dashboard/orders        → Orders manager
/dashboard/categories    → Categories manager
/dashboard/analytics     → Charts (Recharts)
/dashboard/settings      → Owner settings
```

### Data Layer

**API** (`src/lib/api.ts`): Single Axios instance pointed at `NEXT_PUBLIC_API_URL` (default `localhost:8000`). A request interceptor injects the Bearer token from `sessionStorage`. Exported client groups: `authApi`, `shopsApi`, `productsApi`, `categoriesApi`, `ordersApi`, `chatApi`, `publicOrdersApi`.

**Server state**: React Query with 30 s staleTime, 1 retry, no refetch-on-window-focus. Mutations call `queryClient.invalidateQueries` to refresh caches.

**Client state**: Zustand auth store (`src/store/auth-store.ts`) with localStorage persistence. Stores `owner` and `isAuthenticated`. Token lives in both `sessionStorage` (Axios interceptor) and a cookie (middleware reads it).

### Auth Flow

1. Login/register → API → store token in sessionStorage + `SameSite=Lax` cookie + Zustand
2. `middleware.ts` guards `/dashboard/**`: redirects unauthenticated requests to `/auth/login?next=<path>`
3. After login, redirect to `?next` param or `/dashboard`

### Component Conventions

- **Manager components** (e.g., `ShopsManager`, `ProductsManager`): own local modal/edit state, use React Query hooks, submit via mutations.
- **`DashboardShell`**: shared sidebar layout wrapping all dashboard pages.
- **`src/lib/utils.ts`**: `cn()` (Tailwind class merge), `formatCurrency()`, `formatDate()`, `getApiError()`, `getPublicShopUrl()`, `uid()`.
- **`src/lib/types.ts`**: canonical TypeScript types for all domain models.
- **`src/lib/mock-data.ts`**: fallback data used when API is unavailable.
- Toast notifications via **Sonner**; theming via **next-themes** (light/dark).
