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
      <body className="bg-muted/20 font-sans antialiased text-foreground">
        <LanguageProvider> 
          <QueryProvider>
            <div className="relative mx-auto min-h-screen w-full max-w-[1440px] bg-background shadow-2xl">
              {children}
            </div>
          </QueryProvider>
          <Toaster position="top-center" richColors />
        </LanguageProvider>
      </body>
    </html>
  );
}