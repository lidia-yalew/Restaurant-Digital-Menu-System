const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/order.controller");
const { verifyToken, authorize } = require("../middleware/auth");


// Security applied to routes:
router.get(
  "/",
  verifyToken,
  authorize("admin", "staff"),
  orderController.getAllOrders
);
router.get("/:id", verifyToken, orderController.getOrderById); // All authenticated users
router.post("/", orderController.createOrder); // Public - customers can order

// UPDATE: Customer only, 5-minute limit
router.put(
  "/:id",
  verifyToken,
  authorize("customer"),
  orderController.updateOrder
);

// DELETE: Customer only, 5-minute limit
router.delete(
  "/:id",
  verifyToken,
  authorize("customer"),
  orderController.deleteOrder
);

// Get orders by status: Staff/Admin only
router.get(
  "/status/:status",
  verifyToken,
  authorize("admin", "staff"),
  orderController.getOrdersByStatus
);

// Get orders by table number: Staff/Admin only
router.get(
  "/table/:tableNumber",
  verifyToken,
  authorize("admin", "staff"),
  orderController.getOrdersByTable
);

// Update order status: Staff/Admin ONLY
router.patch(
  "/:id/status",
  verifyToken,
  authorize("staff", "admin"),
  orderController.updateOrderStatus
);

// Get kitchen queue
router.get(
  "/kitchen/queue",
  verifyToken,
  authorize("kitchen"),
  orderController.getKitchenQueue
);

// Search orders
router.get(
  "/search",
  verifyToken,
  authorize("admin", "staff"),
  orderController.searchOrders
);

// Get order statistics
router.get(
  "/stats/today",
  verifyToken,
  authorize("admin",),
  orderController.getTodayStats
);

module.exports = router;
