const Order = require("../model/order.model");

exports.createOrder = async (req, res) => {
  try {
    const { customer_name, table_number, items } = req.body;

    if (!customer_name || !table_number || !items || items.length === 0) {
      return res.status(400).json({
        error:
          "Missing required fields: customer_name, table_number, and at least one item",
      });
    }

    // Calculate total amount
    let { total_amount } = req.body;
    if (!total_amount && items) {
      total_amount = items.reduce((sum, item) => {
        return sum + (item.price_at_time || 0) * (item.quantity || 1);
      }, 0);
    }

    const orderData = {
      ...req.body,
      total_amount: total_amount || 0,
      status: req.body.status || "pending",
      notes: req.body.notes || "",
    };

    const newOrder = await Order.create(orderData);
    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.json(orders);
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error getting order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ UPDATE: Customer only, 5-minute limit
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user; // From JWT token
    const orderData = req.body;

    // Get the order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Verify customer owns this order by phone number
    if (order.phone_number !== user.phone) {
      return res.status(403).json({
        error: "You can only update your own orders",
      });
    }

    // Check 5-minute time limit
    const orderTime = new Date(order.created_at);
    const currentTime = new Date();
    const timeDifference = (currentTime - orderTime) / (1000 * 60);

    if (timeDifference > 5) {
      return res.status(400).json({
        error: `Cannot update order after 5 minutes. Order was placed ${Math.floor(
          timeDifference
        )} minutes ago.`,
      });
    }

    // Only allow updates if status is still pending
    if (order.status !== "pending") {
      return res.status(400).json({
        error: `Cannot update order in "${order.status}" status. Only pending orders can be updated.`,
      });
    }

    // Update order
    const updatedOrder = await Order.update(id, {
      ...order,
      ...orderData,
      status: "pending", // Keep as pending after update
    });

    res.json({
      message: "Order updated successfully",
      order: updatedOrder,
      minutesSinceOrder: Math.floor(timeDifference),
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ UPDATE: Customer only, 5-minute limit
// In deleteOrder function - add fallback check
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if user owns this order
    // First try by user_id, then by phone number as fallback
    let isOwner = false;
    
    if (order.user_id && user?.id) {
      isOwner = order.user_id === user.id;
    }
    
    // Fallback: check by phone number
    if (!isOwner && user?.phone && order.phone_number === user.phone) {
      isOwner = true;
    }
    
    // Fallback: check by username
    if (!isOwner && user?.username && order.customer_name === user.username) {
      isOwner = true;
    }

    if (!isOwner) {
      return res.status(403).json({ 
        error: "You can only delete your own orders" 
      });
    }

    // Check 5-minute time limit
    const orderTime = new Date(order.created_at);
    const currentTime = new Date();
    const timeDifference = (currentTime - orderTime) / (1000 * 60);

    if (timeDifference > 5) {
      return res.status(400).json({
        error: `Cannot delete order after 5 minutes. Order was placed ${Math.floor(timeDifference)} minutes ago.`,
      });
    }

    await Order.delete(id);

    res.json({
      message: "Order deleted successfully",
      orderId: id,
      minutesSinceOrder: Math.floor(timeDifference),
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const orders = await Order.findByStatus(status);
    res.json(orders);
  } catch (error) {
    console.error("Error getting orders by status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getOrdersByTable = async (req, res) => {
  try {
    const { tableNumber } = req.params;
    const orders = await Order.findByTableNumber(tableNumber);
    res.json(orders);
  } catch (error) {
    console.error("Error getting orders by table:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ UPDATE: Staff/Admin only
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "served",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const updatedOrder = await Order.updateStatus(id, status);
    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      ...updatedOrder,
      updatedBy: user.role,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getKitchenQueue = async (req, res) => {
  try {
    const orders = await Order.getKitchenQueue();
    res.json(orders);
  } catch (error) {
    console.error("Error getting kitchen queue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Simple Statistics for Manager
exports.getTodayStats = async (req, res) => {
  try {
    const stats = await Order.getTodayStats();
    res.json(stats);
  } catch (error) {
    console.error("Error getting today's stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Search Orders
exports.searchOrders = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ error: "Search query required" });
    }

    const results = await Order.search(q);
    res.json(results);
  } catch (error) {
    console.error("Error searching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
