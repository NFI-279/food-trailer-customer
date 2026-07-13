// [Frontend - Customer] src/lib/translations.ts

export type Language = "en" | "ro";

export const translations = {
  en: {
    header: "TRAILER MENU",
    categories: {
      "Grill": "Grill",
      "Sides": "Sides",
      "Drinks": "Drinks",
      "Desserts": "Desserts"
    },
    menu: {
      add: "+ Add",
      added: "added to cart!",
      failed: "Failed to load menu.",
      soldOut: "SOLD OUT",
    },
    cart: {
      viewCart: "View Cart",
      yourOrder: "Your Order",
      note: "Note:",
      total: "Total",
      placeOrder: "Place Order",
      sending: "Sending to Kitchen...",
      success: "Success! Your Order Number is",
      checkoutAlert: "ORDER PLACED",
      payCash: "Pay with Cash",
      payCard: "Pay with Card",
      redirecting: "Redirecting to secure checkout...",
    },
    tracker: {
      checking: "Checking with the kitchen...",
      orderNum: "Order",
      pending: "ORDER RECEIVED",
      pendingDesc: "Your order is in line. The kitchen will start preparing it soon.",
      cooking: "COOKING...",
      cookingDesc: "Your food is being prepared. We will alert you when it's ready.",
      ready: "READY FOR PICKUP!",
      readyDesc: "Please come to the window to collect your food.",
      cancelled: "ORDER CANCELLED",
      cancelledDesc: "This order was cancelled. Please see the staff if you have questions.",
      newOrder: "Start New Order",
      unpaid: "AWAITING PAYMENT",
      unpaidDesc: "Please proceed to the trailer window to pay with cash.",
    }
  },
  ro: {
    header: "MENIU RULOTĂ",
    categories: {
      "Grill": "Grătar",
      "Sides": "Garnituri",
      "Drinks": "Băuturi",
      "Desserts": "Deserturi"
    },
    menu: {
      add: "+ Adaugă",
      added: "adăugat în coș!",
      failed: "Nu am putut încărca meniul.",
       soldOut: "STOC EPUIZAT", // <-- ADD THIS
    },
    cart: {
      viewCart: "Vezi Coșul",
      yourOrder: "Comanda Ta",
      note: "Notă:",
      total: "Total",
      placeOrder: "Trimite Comanda",
      sending: "Se trimite la bucătărie...",
      success: "Succes! Numărul comenzii este",
      checkoutAlert: "COMANDĂ PLASATĂ",
      payCash: "Plătește Cash",
      payCard: "Plătește cu Cardul",
      redirecting: "Te redirecționăm către plata securizată...",
    },
    tracker: {
      checking: "Verificăm la bucătărie...",
      orderNum: "Comanda",
      pending: "COMANDĂ PRIMITĂ",
      pendingDesc: "Comanda ta este la rând. Bucătăria va începe prepararea în curând.",
      cooking: "SE PREPARĂ...",
      cookingDesc: "Mâncarea ta este în pregătire. Te vom anunța când este gata.",
      ready: "GATA PENTRU RIDICARE!",
      readyDesc: "Te rugăm să vii la fereastră pentru a ridica mâncarea.",
      cancelled: "COMANDĂ ANULATĂ",
      cancelledDesc: "Această comandă a fost anulată. Te rugăm să discuți cu personalul.",
      newOrder: "Începe o Comandă Nouă",
      unpaid: "AȘTEAPTĂ PLATA",
      unpaidDesc: "Te rugăm să mergi la fereastra rulotei pentru a achita cash.",
    }
  }
};