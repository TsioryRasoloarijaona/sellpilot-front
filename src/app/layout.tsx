import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "SellPilot | AI commerce conversations",
  description: "AI-powered e-commerce chatbot platform for modern shop owners.",
  icons: {
    icon: [
      { url: "/cursor.svg", type: "image/svg+xml" },
      { url: "/cursor-256.png", sizes: "256x256", type: "image/png" },
      { url: "/cursor-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: "/cursor-1024.png"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/pip-mascot.js" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
