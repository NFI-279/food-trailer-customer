// [Frontend - Customer] src/lib/api.ts
import { MenuItem } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class OrderAccessError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "OrderAccessError";
  }
}

function requireOrderCapabilityToken(token: string | null | undefined) {
  if (!token?.trim()) {
    throw new OrderAccessError("This order session is missing its access token.", 401);
  }
  return token;
}

async function getErrorMessage(res: Response, fallback: string) {
  try {
    const data = await res.json();
    return typeof data?.message === "string" ? data.message : fallback;
  } catch {
    return fallback;
  }
}

async function protectedOrderRequest(
  url: string,
  token: string | null | undefined,
  init?: RequestInit,
) {
  const capabilityToken = requireOrderCapabilityToken(token);
  const res = await fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      "x-order-token": capabilityToken,
    },
  });
  if (!res.ok) {
    const fallback = res.status === 401 || res.status === 403
      ? "This order access token is invalid or expired."
      : "The order request failed.";
    throw new OrderAccessError(await getErrorMessage(res, fallback), res.status);
  }
  return res;
}

export const api = {
  // 1. Fetch Menu
  getMenu: async (): Promise<MenuItem[]> => {
    const res = await fetch(`${API_URL}/menu`);
    if (!res.ok) throw new Error("Failed to fetch menu");
    const data = await res.json();
    return data;
  },

  // 2. Place Order
  placeOrder: async (orderData: unknown) => {
    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to place order"));
    const data = await res.json();
    if (typeof data?.id !== "string" || typeof data?.customerAccessToken !== "string" || !data.customerAccessToken.trim()) {
      throw new Error("The order response did not include a valid access token.");
    }
    return data;
  },

  // 3. Get Order Status
  getOrderStatus: async (id: string, token: string | null | undefined) => {
    const res = await protectedOrderRequest(`${API_URL}/orders/status/${encodeURIComponent(id)}`, token);
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
  getStripeUrl: async (orderId: string, token: string | null | undefined) => {
    const res = await protectedOrderRequest(`${API_URL}/orders/${encodeURIComponent(orderId)}/checkout`, token, {
      method: "POST",
    });
    const data = await res.json();
    return data;
  }, // <-- THIS COMMA WAS MISSING!

  // 6. Cancel abandoned Stripe order
  cancelUnpaidOrder: async (id: string, token: string | null | undefined) => {
    const res = await protectedOrderRequest(`${API_URL}/orders/${encodeURIComponent(id)}/cancel-unpaid`, token, {
      method: "PATCH",
    });
    return res.json();
  }
};
