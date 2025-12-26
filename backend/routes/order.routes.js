const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/order.controller");

// Basic CRUD routes
router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);
router.post("/", orderController.createOrder);
router.put("/:id", orderController.updateOrder);
router.delete("/:id", orderController.deleteOrder);

// ✅ ADD THESE NEW ROUTES:

// Get orders by status
router.get("/status/:status", orderController.getOrdersByStatus);

// Get orders by table number
router.get("/table/:tableNumber", orderController.getOrdersByTable);

// Update order status only (PATCH for partial update)
router.patch("/:id/status", orderController.updateOrderStatus);

// Get kitchen queue
router.get("/kitchen/queue", orderController.getKitchenQueue);

module.exports = router;
