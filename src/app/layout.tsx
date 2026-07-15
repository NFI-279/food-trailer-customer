// [Frontend - Customer] src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Food Trailer Menu",
  description: "Order fresh food directly from your phone!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Removed inter.className, Tailwind uses standard sans-serif by default! */}
      <body className="font-sans antialiased bg-muted/20 text-slate-900">
        <LanguageProvider> 
          <QueryProvider>
            <div className="max-w-md mx-auto min-h-screen bg-background shadow-2xl relative">
              {children}
            </div>
          </QueryProvider>
          <Toaster position="top-center" richColors />
        </LanguageProvider>
      </body>
    </html>
  );
}