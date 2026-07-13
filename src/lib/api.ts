import { MenuItem } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = {
  getMenu: async (): Promise<MenuItem[]> => {
    const res = await fetch(`${API_URL}/menu`);
    if (!res.ok) throw new Error("Failed to fetch menu");
    //const data: MenuItem[] = await res.json();
    
    const data = await res.json();
    return data;
  },

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
    
    return res.json();
  },

  getOrderStatus: async (orderNumber: string) => {
    const res = await fetch(`${API_URL}/orders/status/${orderNumber}`);
    if (!res.ok) throw new Error("Failed to fetch order status");
    return res.json();
  },

  getSettings: async () => {
    const res = await fetch(`${API_URL}/settings`);
    if (!res.ok) throw new Error("Failed to fetch settings");
    return res.json();
  },

  getStripeUrl: async (orderId: string, customerAppUrl: string) => {
    const res = await fetch(`${API_URL}/orders/${orderId}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerAppUrl }),
    });
    if (!res.ok) throw new Error("Failed to initialize payment");
    const data = await res.json();
    return data;
  }
};