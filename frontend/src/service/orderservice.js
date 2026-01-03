import { formatData, validateFields } from "../utils";
import * as OrdersAPI from "../api/orders.api";

export const createOrderService = async (data) => {
  validateFields(data, ["items"]);
  const formatted = formatData({
    table_number: data.table_number || 1,
    customer_name: data.customer_name || "",
    phone_number: data.phone_number || "",
    status: data.status || "pending",
    total_amount: data.total_amount || 0,
    notes: data.notes || "",
    items: Array.isArray(data.items)
      ? data.items.map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity || 1,
          price_at_time: item.price || 0,
        }))
      : [],
  });

  return OrdersAPI.createOrderAPI(formatted);
};

export const updateOrderService = async (id, data) => {
  const formatted = formatData(data); // optional: add validation here
  return OrdersAPI.updateOrderAPI(id, formatted);
};

export const updateOrderStatusService = async (id, status) => {
  return OrdersAPI.updateOrderStatusAPI(id, status);
};

export const deleteOrderService = async (id) => {
  return OrdersAPI.deleteOrderAPI(id);
};

export const fetchOrdersService = async () => OrdersAPI.getOrdersAPI();

export const fetchOrderByIdService = async (id) =>
  OrdersAPI.getOrderByIdAPI(id);

export const fetchOrdersByStatusService = async (status) =>
  OrdersAPI.getOrdersByStatusAPI(status);

export const fetchOrdersByTableService = async (tableNumber) =>
  OrdersAPI.getOrdersByTableAPI(tableNumber);

export const fetchKitchenQueueService = async () =>
  OrdersAPI.getKitchenQueueAPI();

export const fetchTodaysOrdersService = async () =>
  OrdersAPI.getTodaysOrdersAPI();

export const fetchActiveOrdersService = async () =>
  OrdersAPI.getActiveOrdersAPI();

export const searchOrdersService = async (query) =>
  OrdersAPI.searchOrdersAPI(query);

export const getModificationTimeRemaining = (createdAt) =>
  OrdersAPI.getModificationTimeRemainingAPI(createdAt);
