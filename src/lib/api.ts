// [Frontend - Customer] src/lib/api.ts
import { MenuItem } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = {
  // 1. Fetch Menu
  getMenu: async (): Promise<MenuItem[]> => {
    const res = await fetch(`${API_URL}/menu`);
    if (!res.ok) throw new Error("Failed to fetch menu");
    const data = await res.json();
    return data;
  },

  // 2. Place Order
  placeOrder: async (orderData: any) => {
    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to place order");
    }
    const data = await res.json();
    return data;
  },

  // 3. Get Order Status
  getOrderStatus: async (orderNumber: string) => {
    const res = await fetch(`${API_URL}/orders/status/${orderNumber}`);
    if (!res.ok) throw new Error("Failed to fetch order status");
    const data = await res.json();
    return data;
  },

  // 4. Get Trailer Settings
  getSettings: async () => {
    const res = await fetch(`${API_URL}/settings`);
    if (!res.ok) throw new Error("Failed to fetch settings");
    const data = await res.json();
    return data;
  },

  // 5. Get Stripe Checkout URL
  getStripeUrl: async (orderId: string) => {
    const res = await fetch(`${API_URL}/orders/${orderId}/checkout`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to initialize payment");
    const data = await res.json();
    return data;
  }, // <-- THIS COMMA WAS MISSING!

  // 6. Cancel abandoned Stripe order
  cancelUnpaidOrder: async (orderNumber: string) => {
    const res = await fetch(`${API_URL}/orders/cancel-unpaid/${orderNumber}`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Failed to cancel unpaid order");
    return res.json();
  }
};
