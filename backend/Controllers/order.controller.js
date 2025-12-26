const Order = require("../model/order.model");

exports.createOrder = async (req, res) => {
  try {
    // Validate required fields
    const { customer_name, table_number, items } = req.body;

    if (!customer_name || !table_number || !items || items.length === 0) {
      return res.status(400).json({
        error:
          "Missing required fields: customer_name, table_number, and at least one item",
      });
    }

    // Calculate total amount if not provided
    let { total_amount } = req.body;
    if (!total_amount && items) {
      total_amount = items.reduce((sum, item) => {
        return sum + item.price_at_time * item.quantity;
      }, 0);
    }

    const orderData = {
      ...req.body,
      total_amount: total_amount || 0,
      status: req.body.status || "pending", // Default status
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

exports.updateOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.update(req.params.id, req.body);
    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ ADD THESE NEW CONTROLLER FUNCTIONS:

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

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "served",
      "cancelled",
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
    res.json(updatedOrder);
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
