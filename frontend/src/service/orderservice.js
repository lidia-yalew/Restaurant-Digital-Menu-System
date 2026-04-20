// service/orderservice.js
import * as OrdersAPI from "../API/orderapi";

export const createOrderService = async (data) => {
  // Validate required fields
  if (!data.customer_name || data.customer_name.trim() === '') {
    throw new Error('Customer name is required');
  }
  
  if (!data.items || data.items.length === 0) {
    throw new Error('At least one item is required');
  }
  
  // Format the data for the API - DON'T use formatData
  const formatted = {
    customer_name: data.customer_name.trim(),
    phone_number: data.phone_number || '',
    table_number: data.table_number || 1,
    notes: data.notes || '',
    total_amount: data.total_amount || 0,
    items: data.items.map(item => ({
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      price_at_time: item.price_at_time
    }))
  };
  
  console.log('Sending to API:', formatted);
  
  return OrdersAPI.createOrderAPI(formatted);
};

export const updateOrderService = async (id, data) => {
  const formatted = {
    customer_name: data.customer_name,
    phone_number: data.phone_number,
    table_number: data.table_number,
    notes: data.notes,
    total_amount: data.total_amount,
    status: data.status
  };
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