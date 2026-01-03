import { apiRequest } from "./apiconfig";

export const createOrderAPI = (payload) =>
  apiRequest("/orders", { method: "POST", body: payload });

export const getOrdersAPI = () => apiRequest("/orders");

export const getOrderByIdAPI = (id) => apiRequest(`/orders/${id}`);

export const updateOrderAPI = (id, payload) =>
  apiRequest(`/orders/${id}`, { method: "PUT", body: payload });
//
export const updateOrderStatusAPI = (id, status) =>
  apiRequest(`/orders/${id}/status`, { method: "PATCH", body: { status } });

export const deleteOrderAPI = (id) =>
  apiRequest(`/orders/${id}`, { method: "DELETE" });

export const getOrdersByStatusAPI = (status) =>
  apiRequest(`/orders/status/${status}`);

export const getOrdersByTableAPI = (tableNumber) =>
  apiRequest(`/orders/table/${tableNumber}`);

export const getKitchenQueueAPI = () => apiRequest("/orders/kitchen/queue");

export const getTodaysOrdersAPI = () => apiRequest("/orders/today");
//
export const getActiveOrdersAPI = () => apiRequest("/orders/active");

export const searchOrdersAPI = (query) =>
  apiRequest(`/orders/search?q=${encodeURIComponent(query)}`);

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
