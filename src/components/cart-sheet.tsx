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

      // Cleaned up formatted items (NO MORE NOTES!)
      const formattedItems = items.map(item => ({
        name: item.name,
        quantity: item.quantity,
      }));

      const order = await api.placeOrder({
        totalAmount: totalPrice,
        items: formattedItems,
        paymentMethod: method, 
      });

      setActiveOrder(order.id);
      clearCart();

      if (method === "CASH") {
        toast.success(`${t.cart.success} #${order.orderNumber}`);
        setIsOpen(false);
      } else {
        toast.loading(t.cart.redirecting);
        const { url } = await api.getStripeUrl(order.id);
        window.location.href = url; 
      }

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCashLoading(false);
      setIsCardLoading(false);
    }
  };

  if (totalItems === 0) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-background/80 backdrop-blur-md border-t md:max-w-md md:mx-auto">
        <SheetTrigger 
          render={
            <Button className="w-full h-14 text-lg font-bold flex items-center justify-between px-6 shadow-xl rounded-2xl">
              <div className="flex items-center bg-primary-foreground/20 px-3 py-1 rounded-full">
                <ShoppingBag className="h-5 w-5 mr-2" />
                <span>{totalItems}</span>
              </div>
              <span>{t.cart.viewCart}</span>
              <span>{totalPrice.toFixed(2)} RON</span>
            </Button>
          }
        />
      </div>

      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl md:max-w-md md:mx-auto flex flex-col p-0">
        <SheetHeader className="p-6 border-b text-left">
          <SheetTitle className="text-2xl font-black">{t.cart.yourOrder}</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.cartItemId} className="flex flex-col gap-2">
                <div className="flex justify-between items-start font-bold text-lg">
                  <span>{item.name}</span>
                  <span>{(item.price * item.quantity).toFixed(2)} RON</span>
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

        <div className="p-6 border-t bg-muted/10 pb-10">
          <div className="flex justify-between items-center mb-6 text-xl font-black">
            <span>{t.cart.total}</span>
            <span>{totalPrice.toFixed(2)} RON</span>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline"
              className="flex-1 h-14 text-base font-bold rounded-2xl border-2" 
              onClick={() => handleCheckout("CASH")}
              disabled={isCashLoading || isCardLoading}
            >
              {isCashLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Banknote className="mr-2 h-5 w-5" />}
              {t.cart.payCash}
            </Button>
            
            <Button 
              className="flex-1 h-14 text-base font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white" 
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