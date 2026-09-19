// [Frontend - Customer] src/app/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCart } from "@/store/cart";
import { useLanguage } from "@/providers/LanguageProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UtensilsCrossed, Globe, Loader2, Flame, Utensils, Coffee, IceCream, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { CartSheet } from "@/components/cart-sheet";
import { OrderTracker } from "@/components/order-tracker";

// Helper to choose the right icon and color based on category
function getCategoryVisuals(category: string) {
  switch (category) {
    case "Grill":
      return { icon: Flame, bg: "bg-gradient-to-br from-secondary to-muted", text: "text-accent" };
    case "Sides":
      return { icon: Utensils, bg: "bg-gradient-to-br from-muted to-secondary", text: "text-accent" };
    case "Drinks":
      return { icon: Coffee, bg: "bg-gradient-to-br from-muted to-card", text: "text-primary" };
    case "Desserts":
      return { icon: IceCream, bg: "bg-gradient-to-br from-secondary to-card", text: "text-accent" };
    default:
      return { icon: UtensilsCrossed, bg: "bg-slate-100", text: "text-slate-400" };
  }
}

function getSafeImageUrl(value: string | undefined) {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value, window.location.origin);
    const approvedOrigins = [
      new URL(process.env.NEXT_PUBLIC_API_URL || window.location.origin).origin,
      ...(process.env.NEXT_PUBLIC_IMAGE_ORIGINS || "").split(",").map(origin => origin.trim()).filter(Boolean),
    ];
    if ((url.protocol === "https:" || approvedOrigins.includes(url.origin)) && approvedOrigins.includes(url.origin)) {
      return url.toString();
    }
    if (url.origin === window.location.origin && value.startsWith("/")) return url.toString();
  } catch {
    return null;
  }
  return null;
}

function MenuImage({ src, alt, visuals }: { src: string | undefined; alt: string; visuals: ReturnType<typeof getCategoryVisuals> }) {
  const [hasFailed, setHasFailed] = useState(false);
  const imageUrl = getSafeImageUrl(src);
  const Icon = visuals.icon;

  if (!imageUrl || hasFailed) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${visuals.bg}`} aria-label={`${alt} image unavailable`}>
        {hasFailed ? <ImageOff className={`h-8 w-8 ${visuals.text} opacity-60`} /> : <Icon className={`h-10 w-10 ${visuals.text} opacity-70`} />}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      onError={() => setHasFailed(true)}
    />
  );
}

function MobileMenuContent() {
  const { addItem, activeOrderId, setActiveOrder } = useCart();
  const { t, toggleLanguage, language } = useLanguage(); 
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    const urlOrderId = searchParams.get("orderId");
    if (urlOrderId && !activeOrderId) {
      setActiveOrder(urlOrderId);
    }
  }, [searchParams, activeOrderId, setActiveOrder]);
  
  const { data: menu, isLoading: isMenuLoading, isError } = useQuery({
    queryKey: ["customer-menu"],
    queryFn: api.getMenu,
  });

  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ["trailer-settings"],
    queryFn: api.getSettings,
    refetchInterval: 3000, 
  });

  if (!mounted) return null;

  if (activeOrderId) {
    return <OrderTracker />;
  }

  if (isMenuLoading || isSettingsLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    );
  }

  if (isError || !menu) {
    return <div className="p-8 text-center text-red-500 font-bold">{t.menu.failed}</div>;
  }
  if (menu.length === 0) {
    return <div className="p-8 text-center text-muted-foreground font-bold">{t.menu.empty}</div>;
  }

  const isClosed = settings && !settings.isAcceptingOrders;
  const categories = ["Grill", "Sides", "Drinks", "Desserts"];

  return (
    <div className="pb-28">
      {/* HEADER */}
      <div className="sticky top-0 z-10 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary shadow-sm">
              <UtensilsCrossed className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-foreground">{t.header}</h1>
          </div>
          <button type="button" onClick={toggleLanguage} className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-bold uppercase text-muted-foreground">{language}</span>
          </button>
        </header>

        <nav className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 pb-3 pt-1 sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden" aria-label="Menu categories">
          {categories.map(cat => {
            const translatedCat = t.categories[cat as keyof typeof t.categories] || cat;
            return (
              <div 
                key={cat}
                onClick={() => {
                  const element = document.getElementById(`category-${cat}`);
                  if (element) {
                    const y = element.getBoundingClientRect().top + window.scrollY - 140;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
                className="whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-foreground shadow-sm transition-colors hover:border-accent hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {translatedCat}
              </div>
            );
          })}
        </nav>
      </div>

      {isClosed && (
        <div className="bg-destructive p-3 text-center text-sm font-bold text-destructive-foreground shadow-sm">
          {language === "ro" ? "Rulota este momentan ÎNCHISĂ." : "The trailer is currently CLOSED."}
        </div>
      )}

      {/* MENU LIST */}
      <main className="mx-auto w-full max-w-7xl space-y-10 p-4 pb-32 sm:p-6 lg:p-8">
        {categories.map(category => {
          const itemsInCategory = menu.filter(item => item.category === category);
          if (itemsInCategory.length === 0) return null;
          const translatedCategory = t.categories[category as keyof typeof t.categories] || category;

          return (
            <section key={category} id={`category-${category}`} className="scroll-mt-36 space-y-4">
              <div className="flex items-end justify-between border-b border-border pb-2">
                <h2 className="text-xl font-black uppercase tracking-widest text-foreground">
                {translatedCategory}
                </h2>
                <span className="text-xs font-semibold text-muted-foreground">{itemsInCategory.length} items</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {itemsInCategory.map(item => {
                  
                  // GET THE SMART VISUALS!
                  const visuals = getCategoryVisuals(item.category);

                  return (
                  <Card key={item.id} className={`group flex h-full overflow-hidden border-border/80 shadow-sm transition-shadow hover:shadow-md ${!item.isAvailable ? "opacity-60 grayscale" : ""}`}>
                    <CardContent className="flex h-full flex-col p-0">
                      <div className={`h-40 w-full shrink-0 overflow-hidden border-b ${visuals.bg} sm:h-44`}>
                        <MenuImage src={item.imageUrl} alt={item.name} visuals={visuals} />
                      </div>
                      <div className="flex flex-1 flex-col justify-between gap-4 p-4">
                        <div className="space-y-1">
                          <h3 className="text-base font-bold leading-tight">{item.name}</h3>
                          {item.description && <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>}
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="shrink-0 font-black text-primary">{item.price.toFixed(2)} RON</span>
                          {item.isAvailable ? (
                            <button
                              type="button"
                              disabled={isClosed}
                              onClick={() => {
                                if (isClosed) return; 
                                addItem(item);
                                toast.success(`${item.name} ${t.menu.added}`);
                              }}
                              className={`${isClosed ? "cursor-not-allowed bg-muted text-muted-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"} min-h-11 rounded-full px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                            >
                              {t.menu.add}
                            </button>
                          ) : (
                            <span className="rounded-full bg-destructive px-3 py-2 text-xs font-bold text-destructive-foreground">
                              {t.menu.soldOut}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )})}
              </div>
            </section>
          );
        })}
      </main>

      {!isClosed && <CartSheet />}
    </div>
  );
}

export default function MobileMenu() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <MobileMenuContent />
    </Suspense>
  );
}
