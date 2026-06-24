import { apiRequest, authRequest } from "./apiconfig";

// Public - No authentication needed (customers can create orders)
export const createOrderAPI = (payload) =>
  apiRequest("/orders", { method: "POST", body: payload });

// Protected - Require authentication (admin/manager only)
export const getOrdersAPI = () => authRequest("/orders");

export const getOrderByIdAPI = (id) => authRequest(`/orders/${id}`);

export const updateOrderAPI = (id, payload) =>
  authRequest(`/orders/${id}`, { method: "PUT", body: payload });

export const updateOrderStatusAPI = (id, status) =>
  authRequest(`/orders/${id}/status`, { method: "PATCH", body: { status } });

export const deleteOrderAPI = (id) =>
  authRequest(`/orders/${id}`, { method: "DELETE" });

export const getOrdersByStatusAPI = (status) =>
  authRequest(`/orders/status/${status}`);

export const getOrdersByTableAPI = (tableNumber) =>
  authRequest(`/orders/table/${tableNumber}`);

export const getKitchenQueueAPI = () => authRequest("/orders/kitchen/queue");

export const getTodaysOrdersAPI = () => authRequest("/orders/today");

export const getActiveOrdersAPI = () => authRequest("/orders/active");

export const searchOrdersAPI = (query) =>
  authRequest(`/orders/search?q=${encodeURIComponent(query)}`);

export const getModificationTimeRemainingAPI = (createdAt) => {
  const orderTime = new Date(createdAt);
  const now = new Date();
  const minutesPassed = (now - orderTime) / (1000 * 60);
  const minutesRemaining = Math.max(0, 5 - minutesPassed);
  return {
    canModify: minutesRemaining > 0,
    minutesRemaining: Math.floor(minutesRemaining),
    minutesPassed: Math.floor(minutesPassed),
  };
};


