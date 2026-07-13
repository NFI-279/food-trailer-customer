// [Frontend - Customer] src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { LanguageProvider } from "@/providers/LanguageProvider"; // <-- Import the provider!
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} bg-muted/20 text-slate-900`}>
        {/* The Language Provider MUST wrap the Query Provider and children! */}
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