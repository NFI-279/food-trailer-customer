// [Frontend - Customer] src/components/order-tracker.tsx
"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCart } from "@/store/cart";
import { useLanguage } from "@/providers/LanguageProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, CheckCircle2, Loader2, Clock, XCircle, Banknote, ShieldCheck } from "lucide-react";

function OrderTrackerContent() {
  const { activeOrderNumber, setActiveOrder } = useCart();
  const { t } = useLanguage();
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const isStripeSuccess = searchParams.get("success") === "true";
  const isStripeCanceled = searchParams.get("canceled") === "true";

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-status", activeOrderNumber],
    queryFn: () => api.getOrderStatus(activeOrderNumber!),
    enabled: !!activeOrderNumber,
    refetchInterval: 3000, 
  });

  const isReady = order?.status === "COMPLETED";
  const isCancelled = order?.status === "CANCELLED";

  // EFFECT 1: Stripe Canceled cleanup
  useEffect(() => {
    if (isStripeCanceled && activeOrderNumber) {
      api.cancelUnpaidOrder(activeOrderNumber).catch(console.error);
      setActiveOrder(null);
      router.replace("/");
    }
  }, [isStripeCanceled, activeOrderNumber, router, setActiveOrder]);

  // EFFECT 2: Stripe Success cleanup
  useEffect(() => {
    if (isStripeSuccess && order && order.status !== "UNPAID") {
      router.replace("/"); 
    }
  }, [isStripeSuccess, order, router]);

  // EFFECT 3: Auto-clear finished orders after 15 minutes!
  useEffect(() => {
    if ((isReady || isCancelled) && order?.updatedAt) {
      const completedTime = new Date(order.updatedAt).getTime();
      const now = new Date().getTime();
      const minutesPassed = (now - completedTime) / (1000 * 60);
      
      if (minutesPassed > 15) {
        setActiveOrder(null);
      }
    }
  }, [isReady, isCancelled, order?.updatedAt, setActiveOrder]);

  if (isLoading || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold">{t.tracker.checking}</p>
      </div>
    );
  }

  // --- METICULOUS UX: The Stripe "Verifying" State ---
  if (order.status === "UNPAID" && isStripeSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-indigo-500 transition-colors duration-500">
        <Card className="w-full max-w-sm shadow-2xl border-none overflow-hidden">
          <div className="py-12 text-center text-white bg-indigo-600">
            <ShieldCheck className="h-24 w-24 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-black uppercase tracking-widest">
              Verifying Payment
            </h2>
          </div>
          <CardContent className="pt-8 pb-8 text-center space-y-4 bg-white">
            <h3 className="text-xl font-bold text-slate-800">Waiting for Bank...</h3>
            <p className="text-slate-500 font-medium">
              Please do not close this screen. We are securely confirming your payment with Stripe.
            </p>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500 mt-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // DEFAULT STATE: PENDING
  let bgColor = "bg-blue-400";
  let cardBg = "bg-blue-500";
  let icon = <Clock className="h-24 w-24 mx-auto mb-4 animate-pulse" />;
  let title = t.tracker.pending;
  let desc = t.tracker.pendingDesc;

  if (order.status === "UNPAID") {
    bgColor = "bg-slate-500";
    cardBg = "bg-slate-600";
    icon = <Banknote className="h-24 w-24 mx-auto mb-4 animate-bounce" />;
    title = t.tracker.unpaid;
    desc = t.tracker.unpaidDesc;
  } 
  else if (order.status === "PREPARING") {
    bgColor = "bg-amber-400";
    cardBg = "bg-amber-500";
    icon = <ChefHat className="h-24 w-24 mx-auto mb-4 animate-bounce" />;
    title = t.tracker.cooking;
    desc = t.tracker.cookingDesc;
  } 
  else if (order.status === "COMPLETED") {
    bgColor = "bg-green-500";
    cardBg = "bg-green-600";
    icon = <CheckCircle2 className="h-24 w-24 mx-auto mb-4 animate-in zoom-in duration-500" />;
    title = t.tracker.ready;
    desc = t.tracker.readyDesc;
  } 
  else if (order.status === "CANCELLED") {
    bgColor = "bg-red-500";
    cardBg = "bg-red-600";
    icon = <XCircle className="h-24 w-24 mx-auto mb-4" />;
    title = t.tracker.cancelled;
    desc = t.tracker.cancelledDesc;
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 ${bgColor}`}>
      <Card className="w-full max-w-sm shadow-2xl border-none overflow-hidden">
        <div className={`py-12 text-center text-white transition-colors duration-500 ${cardBg}`}>
          {icon}
          <h2 className="text-3xl font-black uppercase tracking-widest">
            {t.tracker.orderNum} #{order.orderNumber}
          </h2>
        </div>
        <CardContent className="pt-8 pb-8 text-center space-y-6 bg-white">
          <div>
            <h3 className="text-2xl font-black text-slate-800">{title}</h3>
            <p className="text-slate-500 font-medium mt-2">{desc}</p>
          </div>
          {(isReady || isCancelled) && (
            <Button className="w-full h-14 text-lg font-bold rounded-2xl" onClick={() => setActiveOrder(null)}>
              {t.tracker.newOrder}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function OrderTracker() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <OrderTrackerContent />
    </Suspense>
  );
}