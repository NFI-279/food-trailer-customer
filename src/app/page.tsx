// [Frontend - Customer] src/app/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCart } from "@/store/cart";
import { useLanguage } from "@/providers/LanguageProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UtensilsCrossed, Globe } from "lucide-react";
import { toast } from "sonner";
import { CartSheet } from "@/components/cart-sheet";
import { OrderTracker } from "@/components/order-tracker";

export default function MobileMenu() {
  const { addItem, activeOrderNumber } = useCart();
  const { t, toggleLanguage, language } = useLanguage(); 
  
  // 1. Fetch Menu (Notice we rename isLoading to isMenuLoading)
  const { data: menu, isLoading: isMenuLoading, isError, error } = useQuery({
    queryKey: ["customer-menu"],
    queryFn: api.getMenu,
  });

  // 2. Fetch Settings
  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ["trailer-settings"],
    queryFn: api.getSettings,
    refetchInterval: 3000, 
  });

  // 3. Early Returns (Order Tracker, Loading, Error)
  if (activeOrderNumber) {
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

  // 4. Check if trailer is closed!
  const isClosed = settings && !settings.isAcceptingOrders;
  const categories = ["Grill", "Sides", "Drinks", "Desserts"];

  return (
    <div className="pb-28">
      
      {/* 1. COMBINED STICKY HEADER & NAV BAR */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b">
        <header className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <UtensilsCrossed className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="font-black text-xl tracking-tight">{t.header}</h1>
          </div>

          <div onClick={toggleLanguage} className="h-10 px-3 flex items-center justify-center gap-1.5 border rounded-full cursor-pointer hover:bg-muted transition-colors">
            <Globe className="h-4 w-4 text-slate-600" />
            <span className="text-xs font-bold uppercase text-slate-600">{language}</span>
          </div>
        </header>

        {/* Quick Nav Category Pills */}
        <div className="flex overflow-x-auto gap-2 px-4 pb-3 pt-1 [&::-webkit-scrollbar]:hidden">
          {categories.map(cat => {
            const translatedCat = t.categories[cat as keyof typeof t.categories] || cat;
            return (
              <div 
                key={cat}
                onClick={() => {
                  // Smooth scroll to the category!
                  const element = document.getElementById(`category-${cat}`);
                  if (element) {
                    const y = element.getBoundingClientRect().top + window.scrollY - 140; // Offset for header
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
                className="whitespace-nowrap bg-muted hover:bg-slate-200 text-slate-800 px-4 py-1.5 rounded-full text-sm font-bold cursor-pointer transition-colors"
              >
                {translatedCat}
              </div>
            );
          })}
        </div>
      </div>

      {isClosed && (
        <div className="bg-destructive text-destructive-foreground p-3 text-center font-bold text-sm shadow-sm">
          {language === "ro" ? "Rulota este momentan ÎNCHISĂ." : "The trailer is currently CLOSED."}
        </div>
      )}

      {/* MENU LIST */}
      <div className="p-4 space-y-8">
        {categories.map(category => {
          const itemsInCategory = menu.filter(item => item.category === category);
          if (itemsInCategory.length === 0) return null;
          const translatedCategory = t.categories[category as keyof typeof t.categories] || category;

          return (
            // Add ID for the Quick Nav scrolling!
            <div key={category} id={`category-${category}`} className="space-y-3">
              <h2 className="text-xl font-black uppercase tracking-widest text-slate-800 border-b pb-1">
                {translatedCategory}
              </h2>
              
              <div className="grid gap-3">
                {itemsInCategory.map(item => (
                  <Card key={item.id} className="overflow-hidden border-slate-200 shadow-sm">
                    {/* 2. SOLD OUT STYLING: Apply grayscale and opacity if not available */}
                    <CardContent className={`p-0 flex h-28 ${!item.isAvailable ? "opacity-60 grayscale" : ""}`}>
                      <div className="w-28 bg-slate-100 shrink-0 flex items-center justify-center border-r">
                        <UtensilsCrossed className="h-8 w-8 text-slate-300" />
                      </div>
                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold leading-tight">{item.name}</h3>
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-black text-primary">{item.price.toFixed(2)} RON</span>
                          
                          {/* 3. SHOW SOLD OUT BADGE OR ADD BUTTON */}
                          {item.isAvailable ? (
                            <div 
                              className={`${isClosed ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer"} font-bold transition-colors py-1.5 px-4 rounded-full text-sm`}
                              onClick={() => {
                                if (isClosed) return; 
                                addItem(item);
                                toast.success(`${item.name} ${t.menu.added}`);
                              }}
                            >
                              {t.menu.add}
                            </div>
                          ) : (
                            <div className="bg-destructive text-destructive-foreground font-bold py-1.5 px-3 rounded-full text-xs">
                              {t.menu.soldOut}
                            </div>
                          )}

                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <CartSheet />
    </div>
  );
}