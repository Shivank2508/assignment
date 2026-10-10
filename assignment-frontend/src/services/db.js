import ordersData from "../data/orders_10000.json";

// Formats IDs and ensures string matching compatibility
const orders = ordersData.map(order => ({
  ...order,
  id: typeof order.id === "number" ? `ORD-${order.id}` : order.id
}));

export function getMockOrders() {
  return orders;
}

export const STATUSES = [
  "delivered",
  "shipped",
  "processing",
  "pending",
  "returned",
  "cancelled"
];

export const PRIORITIES = ["urgent", "high", "medium", "low"];

export const CATEGORIES = [
  "books",
  "clothing",
  "home",
  "toys",
  "office",
  "beauty",
  "sports",
  "electronics"
];
