// [Frontend - Customer] src/components/cart-sheet.tsx
"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { useLanguage } from "@/providers/LanguageProvider"; 
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingBag, Minus, Plus, Trash2, Loader2, CreditCard, Banknote } from "lucide-react"; 
import { api } from "@/lib/api";
import { toast } from "sonner";

export function CartSheet() {
  const { items, addItem, decreaseQuantity, removeItem, getTotalPrice, getTotalItems, clearCart, setActiveOrder } = useCart();
  const { t } = useLanguage(); 
  const [isOpen, setIsOpen] = useState(false);
  
  const [isCashLoading, setIsCashLoading] = useState(false);
  const [isCardLoading, setIsCardLoading] = useState(false);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handleCheckout = async (method: "CASH" | "CARD") => {
    try {
      if (method === "CASH") setIsCashLoading(true);
      if (method === "CARD") setIsCardLoading(true);

      const formattedItems = items.map(item => ({
        name: item.name,
        quantity: item.quantity,
      }));

      const order = await api.placeOrder({
        totalAmount: totalPrice,
        items: formattedItems,
        paymentMethod: method, 
      });

      if (method === "CASH") {
        setActiveOrder(order.id, order.customerAccessToken);
        clearCart();
        toast.success(`${t.cart.success} #${order.orderNumber}`);
        setIsOpen(false);
      } else {
        toast.loading(t.cart.redirecting);
        // SECURITY FIX: Fetch the Stripe URL BEFORE clearing the cart!
        // If Stripe is down, the error is caught, and the customer's cart is perfectly safe.
        const { url } = await api.getStripeUrl(order.id, order.customerAccessToken);
        
        setActiveOrder(order.id, order.customerAccessToken);
        clearCart();
        window.location.assign(url);
      }

    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Checkout failed");
      }
    } finally {
      setIsCashLoading(false);
      setIsCardLoading(false);
    }
  };

  if (totalItems === 0) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:p-4">
        <div className="mx-auto max-w-6xl">
        <SheetTrigger 
          render={
            <Button className="h-14 w-full rounded-2xl px-4 text-base font-bold shadow-xl sm:px-6 sm:text-lg">
              <div className="flex items-center rounded-full bg-primary-foreground/20 px-3 py-1">
                <ShoppingBag className="h-5 w-5 mr-2" />
                <span>{totalItems}</span>
              </div>
              <span>{t.cart.viewCart}</span>
              <span>{totalPrice.toFixed(2)} RON</span>
            </Button>
          }
        />
        </div>
      </div>

      <SheetContent side="bottom" className="mx-auto flex h-[min(88vh,720px)] w-full max-w-2xl flex-col rounded-t-3xl p-0">
        <SheetHeader className="border-b p-5 text-left sm:p-6">
          <SheetTitle className="text-2xl font-black">{t.cart.yourOrder}</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-5 sm:p-6">
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.cartItemId} className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-4 font-bold text-lg">
                  <span className="min-w-0 break-words">{item.name}</span>
                  <span className="shrink-0">{(item.price * item.quantity).toFixed(2)} RON</span>
                </div>
                
                {/* REMOVED NOTES UI HERE */}
                
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center border rounded-full bg-muted/50">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => decreaseQuantity(item.cartItemId)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => addItem(item)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-destructive ml-auto" onClick={() => removeItem(item.cartItemId)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t bg-muted/10 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6">
          <div className="flex justify-between items-center mb-6 text-xl font-black">
            <span>{t.cart.total}</span>
            <span>{totalPrice.toFixed(2)} RON</span>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <Button 
              variant="outline"
              className="h-14 flex-1 rounded-2xl border-2 border-border text-base font-bold"
              onClick={() => handleCheckout("CASH")}
              disabled={isCashLoading || isCardLoading}
            >
              {isCashLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Banknote className="mr-2 h-5 w-5" />}
              {t.cart.payCash}
            </Button>
            
            <Button 
              className="h-14 flex-1 rounded-2xl bg-accent text-base font-bold text-accent-foreground hover:bg-accent/90"
              onClick={() => handleCheckout("CARD")}
              disabled={isCashLoading || isCardLoading}
            >
              {isCardLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
              {t.cart.payCard}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
