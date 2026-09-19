// [Frontend - Customer] src/components/order-tracker.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCart } from "@/store/cart";
import { useLanguage } from "@/providers/LanguageProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, CheckCircle2, Loader2, Clock, XCircle, Banknote, ShieldCheck, Circle } from "lucide-react";
import { toast } from "sonner";
import { OrderAccessError } from "@/lib/api";

function OrderTrackerContent() {
  const { activeOrderId, activeOrderToken, setActiveOrder } = useCart();
  const { t } = useLanguage();
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isTimeout, setIsTimeout] = useState(false); // <-- NEW: Stripe Timeout State
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const isStripeSuccess = searchParams.get("success") === "true";
  const isStripeCanceled = searchParams.get("canceled") === "true";

  const { data: order, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["order-status", activeOrderId, activeOrderToken],
    queryFn: () => api.getOrderStatus(activeOrderId!, activeOrderToken),
    enabled: !!activeOrderId,
    refetchInterval: 3000, 
    retry: (failureCount, queryError) => (
      !(queryError instanceof OrderAccessError) && failureCount < 2
    ),
  });

  const isReady = order?.status === "COMPLETED";
  const isCancelled = order?.status === "CANCELLED";
  const timeline = [
    { label: "Received", status: "PENDING", icon: Clock },
    { label: "Preparing", status: "PREPARING", icon: ChefHat },
    { label: "Ready", status: "COMPLETED", icon: CheckCircle2 },
  ];
  const currentStep = order.status === "UNPAID" ? 0 : order.status === "PREPARING" ? 1 : order.status === "COMPLETED" ? 2 : -1;

  // EFFECT: Stripe Canceled cleanup
  useEffect(() => {
    const handleCancel = async () => {
      if (isStripeCanceled && activeOrderId && !isCanceling) {
        setIsCanceling(true);
        try {
          await api.cancelUnpaidOrder(activeOrderId, activeOrderToken);
        } catch (e) {
          const message = e instanceof Error ? e.message : "Unable to cancel the unpaid order.";
          setCancelError(message);
          toast.error(message);
        } finally {
          setActiveOrder(null);
          router.replace("/");
        }
      }
    };
    handleCancel();
  }, [isStripeCanceled, activeOrderId, activeOrderToken, router, setActiveOrder, isCanceling]);

  // EFFECT: Stripe Success cleanup
  useEffect(() => {
    if (isStripeSuccess && order && order.status !== "UNPAID") {
      router.replace("/"); 
    }
  }, [isStripeSuccess, order, router]);

  // EFFECT: Auto-clear finished orders after 15 minutes
  useEffect(() => {
    if ((isReady || isCancelled) && order?.updatedAt) {
      const completedTime = new Date(order.updatedAt).getTime();
      const now = new Date().getTime();
      if ((now - completedTime) / (1000 * 60) > 15) {
        setActiveOrder(null);
      }
    }
  }, [isReady, isCancelled, order?.updatedAt, setActiveOrder]);

  // EFFECT: Stripe Timeout Escape Hatch (15 seconds)
  useEffect(() => {
    if (order?.status === "UNPAID" && isStripeSuccess) {
      const timer = setTimeout(() => setIsTimeout(true), 15000);
      return () => clearTimeout(timer);
    }
  }, [order?.status, isStripeSuccess]);

  if (isLoading || isCanceling) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold">{t.tracker.checking}</p>
      </div>
    );
  }

  if (isError || !order) {
    const message = error instanceof Error ? error.message : "Unable to access this order.";
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100">
        <Card className="w-full max-w-sm shadow-xl">
          <CardContent className="p-6 text-center space-y-4">
            <XCircle className="h-12 w-12 mx-auto text-destructive" />
            <h2 className="text-xl font-black">Order unavailable</h2>
            <p className="text-muted-foreground">{cancelError || message}</p>
            <Button className="w-full" onClick={() => setActiveOrder(null)}>Start New Order</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- STRIPE VERIFYING STATE ---
  if (order.status === "UNPAID" && isStripeSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-accent p-6 transition-colors duration-500">
        <Card className="w-full max-w-sm shadow-2xl border-none overflow-hidden">
          <div className="bg-primary py-12 text-center text-primary-foreground">
            <ShieldCheck className="h-24 w-24 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-black uppercase tracking-widest">Verifying Payment</h2>
          </div>
          <CardContent className="space-y-4 bg-card pb-8 pt-8 text-center">
            <h3 className="text-xl font-bold text-card-foreground">Waiting for Bank...</h3>
            
            {/* NEW: If it takes too long, show the escape hatch message! */}
            {isTimeout ? (
              <div className="bg-amber-100 text-amber-800 p-4 rounded-xl text-sm font-bold">
                Verification is taking longer than usual. Please do NOT pay again. Show this screen to the staff!
              </div>
            ) : (
              <p className="font-medium text-muted-foreground">
                Please do not close this screen. We are securely confirming your payment with Stripe.
              </p>
            )}

            <Loader2 className="mx-auto mt-4 h-8 w-8 animate-spin text-accent" />
            <Button variant="outline" className="w-full mt-6" onClick={() => refetch()}>
              Refresh Status
            </Button>
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
    <div className={`flex min-h-screen items-center justify-center p-4 transition-colors duration-500 sm:p-6 ${bgColor}`}>
      <Card className="w-full max-w-lg overflow-hidden border-border/80 shadow-2xl">
        <div className={`p-7 text-center text-white transition-colors duration-500 sm:p-10 ${cardBg}`}>
          {icon}
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-white/75">{t.tracker.orderNum}</p>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            #{order.orderNumber}
          </h2>
        </div>
        <CardContent className="space-y-6 bg-card p-6 text-center sm:p-8">
          <div>
            <h3 className="text-2xl font-black text-card-foreground sm:text-3xl">{title}</h3>
            <p className="mt-2 font-medium text-muted-foreground">{desc}</p>
          </div>
          {order.status !== "CANCELLED" && (
            <div className="grid grid-cols-3 gap-2 pt-2" aria-label="Order progress">
              {timeline.map(({ label, status, icon: StepIcon }, index) => {
                const active = index <= currentStep;
                return (
                  <div key={status} className="relative space-y-2">
                    {index < timeline.length - 1 && <span className={`absolute left-1/2 top-4 hidden h-0.5 w-full sm:block ${index < currentStep ? "bg-primary" : "bg-muted"}`} />}
                    <div className={`relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded-full ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {active ? <StepIcon className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                    </div>
                    <p className={`text-xs font-bold ${active ? "text-foreground" : "text-muted-foreground"}`}>{label}</p>
                  </div>
                );
              })}
            </div>
          )}
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <OrderTrackerContent />
    </Suspense>
  );
}
