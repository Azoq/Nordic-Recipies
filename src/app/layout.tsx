import type { Metadata, Viewport } from "next";
import { LocaleProvider } from "@/lib/locale-context";
import { ShoppingListProvider } from "@/lib/shopping-list";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nordic Recipes",
  description: "Authentic recipes in Swedish, Norwegian, Danish, and English",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nordic Recipes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-stone-900 antialiased">
        <LocaleProvider>
          <ShoppingListProvider>{children}</ShoppingListProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
