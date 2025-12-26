import React, { useState } from "react";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrdersByStatus,
  getKitchenQueue,
  deleteOrder,
} from "../API/orderapi";

const TestOrdersAPI = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    const results = [];

    try {
      // 1. Test GET all orders
      const allOrders = await getAllOrders();
      results.push(`✓ GET /orders: ${allOrders.length} orders found`);

      // 2. Test create order
      // In your test component
      const newOrder = {
        tableNumber: 5,
        customerName: "Test Customer",
        phoneNumber: "1234567890",
        status: "pending",
        totalAmount: 25.99,
        items: [
          {
            menu_item_id: 1,
            quantity: 2,
            price_at_time: 12.99, // CHANGED from 'price' to 'price_at_time'
          },
          {
            menu_item_id: 2,
            quantity: 1,
            price_at_time: 13.0,
          },
        ],
      };

      const created = await createOrder(newOrder);
      results.push(`✓ POST /orders: Order created with ID: ${created.id}`);

      // 3. Test get by ID
      const { status, id } = await getOrderById(created.id);
      results.push(
        `✓ GET /orders/:id: Order #${id} retrieved - Status: ${status}`
      );

      // 4. Test update status
      await updateOrderStatus(created.id, "confirmed");
      results.push(`✓ PATCH /orders/:id/status: Status updated to confirmed`);

      // 5. Test get by status
      const confirmedOrders = await getOrdersByStatus("confirmed");
      results.push(
        `✓ GET /orders/status/:status: ${confirmedOrders.length} confirmed orders`
      );

      // 6. Test get kitchen queue
      const kitchenQueue = await getKitchenQueue();
      results.push(
        `✓ GET /orders/kitchen/queue: ${kitchenQueue.length} orders in queue`
      );

      // 7. Cleanup - delete test order
      await deleteOrder(created.id);
      results.push(`✓ DELETE /orders/:id: Test order deleted`);

      results.push("✅ All API tests passed!");
    } catch (error) {
      results.push(`❌ Error: ${error.message}`);
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", margin: "20px" }}>
      <h2>Orders API Test</h2>
      <button
        onClick={runTest}
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
        }}
      >
        {loading ? "Testing..." : "Run API Test"}
      </button>

      <div style={{ marginTop: "20px" }}>
        <h3>Test Results:</h3>
        {testResults.map((result, index) => (
          <div
            key={index}
            style={{
              padding: "5px",
              margin: "5px 0",
              color: result.includes("✓")
                ? "green"
                : result.includes("❌")
                ? "red"
                : "blue",
            }}
          >
            {result}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestOrdersAPI;
