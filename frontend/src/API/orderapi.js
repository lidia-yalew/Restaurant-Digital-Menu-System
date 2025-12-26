import { apiRequest } from "./apiconfig";


// ✅ CREATE new order
export const createOrder = async (orderData) => {
  console.log("📝 Creating order with data:", orderData);

  const formattedOrder = {
    table_number: orderData.table_number || orderData.tableNumber || 1,
    customer_name: orderData.customer_name || orderData.customerName || "",
    phone_number: orderData.phone_number || orderData.phoneNumber || "",
    status: orderData.status || "pending",
    total_amount: orderData.total_amount || orderData.totalAmount || 0,
    items: Array.isArray(orderData.items)
      ? orderData.items.map((item) => ({
          menu_item_id: item.menu_item_id || item.menuItemId,
          quantity: item.quantity || 1,
          price_at_time: item.price_at_time || item.price || 0, // FIXED: price_at_time
          notes: item.notes || "",
        }))
      : [],
  };

  console.log("📤 Sending to API:", formattedOrder);

  return await apiRequest("/orders", {
    method: "POST",
    body: formattedOrder,
  });
};

// ✅ GET all orders (for admin/kitchen)
export const getAllOrders = async () => {
  return await apiRequest("/orders");
};

// ✅ GET order by ID
export const getOrderById = async (id) => {
  return await apiRequest(`/orders/${id}`);
};

{/*} ✅ UPDATE order (full update)
export const updateOrder = async (id, orderData) => {
  return await apiRequest(`/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(orderData),
  });
};
*/}

// ✅ UPDATE order (full update)
export const updateOrder = async (id, orderData) => {
  const formattedData = {
    table_number: orderData.table_number || orderData.tableNumber,
    customer_name: orderData.customer_name || orderData.customerName,
    phone_number: orderData.phone_number || orderData.phoneNumber,
    status: orderData.status,
    total_amount: orderData.total_amount || orderData.totalAmount,
    items: Array.isArray(orderData.items) 
      ? orderData.items.map(item => ({
          menu_item_id: item.menu_item_id || item.menuItemId,
          quantity: item.quantity || 1,
          price_at_time: item.price_at_time || item.price || 0, // FIXED
          notes: item.notes || ""
        }))
      : [],
  };

  return await apiRequest(`/orders/${id}`, {
    method: "PUT",
    body: formattedData,
  });
};

// ✅ UPDATE order status only (NOW USING BACKEND ENDPOINT)
export const updateOrderStatus = async (orderId, status) => {
  return await apiRequest(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

// ✅ DELETE order
export const deleteOrder = async (id) => {
  return await apiRequest(`/orders/${id}`, {
    method: "DELETE",
  });
};

// ✅ GET orders by status (NOW USING BACKEND)
export const getOrdersByStatus = async (status) => {
  return await apiRequest(`/orders/status/${status}`);
};

// ✅ GET orders by table number (NOW USING BACKEND)
export const getOrdersByTable = async (tableNumber) => {
  return await apiRequest(`/orders/table/${tableNumber}`);
};

// ✅ GET kitchen queue
export const getKitchenQueue = async () => {
  return await apiRequest("/orders/kitchen/queue");
};

// ✅ Get active orders (pending, confirmed, preparing)
export const getActiveOrders = async () => {
  const allOrders = await getAllOrders();
  return allOrders.filter((order) =>
    ["pending", "confirmed", "preparing"].includes(order.status)
  );
};

// ✅ Get today's orders
export const getTodaysOrders = async () => {
  const allOrders = await getAllOrders();
  const today = new Date().toISOString().split("T")[0];

  return allOrders.filter((order) => {
    const orderDate = new Date(order.created_at).toISOString().split("T")[0];
    return orderDate === today;
  });
};
