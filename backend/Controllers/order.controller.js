const Order = require("../model/order.model"); // plural "models"!

exports.createOrder = async (req, res) => {
  try {
    const newOrder = await Order.create(req.body);
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

// Add these if your routes need them:
exports.getOrderById = async (req, res) => {
  res.json({ message: "Get order by ID - implement later" });
};

exports.updateOrder = async (req, res) => {
  res.json({ message: "Update order - implement later" });
};

exports.deleteOrder = async (req, res) => {
  res.json({ message: "Delete order - implement later" });
};
