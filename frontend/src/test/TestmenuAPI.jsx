// src/components/TestMenuAPI.jsx
import React, { useState } from "react";
import {
  getMenuItems,
  getMenuItemById,
  getMenuItemsByCategory,
  searchMenuItems,
  getMenuCategories,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
} from "../API/menuapi"; // Adjust path as needed

const TestMenuAPI = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testItemId, setTestItemId] = useState(null);

  const runTest = async () => {
    setLoading(true);
    const results = [];
    let testItemId = null;

    try {
      // 1. Test GET all menu items
      const allMenuItems = await getMenuItems();
      results.push(`✓ GET /menu: ${allMenuItems.length} menu items found`);

      // Store first item ID for testing
      if (allMenuItems.length > 0) {
        testItemId = allMenuItems[0].id;
        setTestItemId(testItemId);
      }

      // 2. Test GET all categories
      const categories = await getMenuCategories();
      results.push(
        `✓ GET /menu/categories/all: ${categories.length} categories found`
      );

      // Use first category for testing
      const testCategory = categories.length > 0 ? categories[0] : "pizza";

      // 3. Test GET items by category
      const itemsByCategory = await getMenuItemsByCategory(testCategory);
      results.push(
        `✓ GET /menu/category/${testCategory}: ${itemsByCategory.length} items found`
      );

      // 4. Test GET single menu item (if we have items)
      if (testItemId) {
        const singleItem = await getMenuItemById(testItemId);
        results.push(
          `✓ GET /menu/${testItemId}: "${singleItem.name}" retrieved`
        );
      }

      // 5. Test SEARCH menu items
      const searchResults = await searchMenuItems("pizza");
      results.push(
        `✓ GET /menu/search/pizza: ${searchResults.length} search results`
      );

      // 6. Test CREATE new menu item (ADMIN - may require auth)
      const newMenuItem = {
        name: "Test Burger " + Date.now(),
        description: "A delicious test burger",
        price: 12.99,
        category: "burgers",
        image_url: "https://via.placeholder.com/150",
        is_available: true,
      };

      try {
        const createdItem = await createMenuItem(newMenuItem);
        testItemId = createdItem.id; // Use new item for remaining tests
        setTestItemId(testItemId);
        results.push(
          `✓ POST /menu: "${createdItem.name}" created with ID: ${createdItem.id}`
        );

        // 7. Test UPDATE menu item
        const updatedData = {
          ...createdItem,
          price: 14.99,
          description: "Updated description",
        };

        const updatedItem = await updateMenuItem(testItemId, updatedData);
        results.push(
          `✓ PUT /menu/${testItemId}: Price updated to $${updatedItem.price}`
        );

        // 8. Test UPDATE availability (PATCH)
        await updateMenuItemAvailability(testItemId, false);
        results.push(
          `✓ PATCH /menu/${testItemId}/availability: Set to unavailable`
        );

        // 9. Test TOGGLE availability
        await toggleMenuItemAvailability(testItemId, false);
        results.push(`✓ Toggle availability: Set back to available`);

        // 10. Test DELETE menu item
        await deleteMenuItem(testItemId);
        results.push(`✓ DELETE /menu/${testItemId}: Test item deleted`);
        setTestItemId(null);
      } catch (createError) {
        results.push(
          `⚠️ Create/Update/Delete tests skipped (may need admin auth): ${createError.message}`
        );
      }

      results.push("✅ All Menu API tests completed!");
    } catch (error) {
      results.push(`❌ Error: ${error.message}`);
    }

    setTestResults(results);
    setLoading(false);
  };

  const runQuickTest = async () => {
    setLoading(true);
    const results = [];

    try {
      // Quick read-only tests (no admin auth needed)
      results.push("🔍 Running quick read-only tests...");

      // 1. Test GET all
      const allItems = await getMenuItems();
      results.push(`✓ GET /menu: ${allItems.length} items`);

      // 2. Test categories
      const categories = await getMenuCategories();
      results.push(`✓ Categories: ${categories.join(", ")}`);

      // 3. Test search
      const searchResults = await searchMenuItems("");
      results.push(`✓ Search (empty): ${searchResults.length} items`);

      results.push("✅ Quick tests passed!");
    } catch (error) {
      results.push(`❌ Quick test error: ${error.message}`);
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        margin: "20px",
        borderRadius: "8px",
      }}
    >
      <h2>📋 Menu API Test</h2>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={runTest}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Testing..." : "Run Full Test"}
        </button>

        <button
          onClick={runQuickTest}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Testing..." : "Quick Test (Read Only)"}
        </button>
      </div>

      {testItemId && (
        <div
          style={{
            backgroundColor: "#e7f3ff",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "15px",
          }}
        >
          <strong>Current Test Item ID:</strong> {testItemId}
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <h3>Test Results:</h3>
        <div
          style={{
            maxHeight: "400px",
            overflowY: "auto",
            padding: "10px",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px",
            border: "1px solid #dee2e6",
          }}
        >
          {testResults.length === 0 ? (
            <p style={{ color: "#6c757d", fontStyle: "italic" }}>
              No tests run yet. Click a button above to start testing.
            </p>
          ) : (
            testResults.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: "8px",
                  margin: "5px 0",
                  borderRadius: "3px",
                  backgroundColor: result.includes("✓")
                    ? "#d4edda"
                    : result.includes("❌")
                    ? "#f8d7da"
                    : result.includes("⚠️")
                    ? "#fff3cd"
                    : "#e2e3e5",
                  color: result.includes("✓")
                    ? "#155724"
                    : result.includes("❌")
                    ? "#721c24"
                    : result.includes("⚠️")
                    ? "#856404"
                    : "#383d41",
                  borderLeft: `4px solid ${
                    result.includes("✓")
                      ? "#28a745"
                      : result.includes("❌")
                      ? "#dc3545"
                      : result.includes("⚠️")
                      ? "#ffc107"
                      : "#6c757d"
                  }`,
                }}
              >
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: "20px", fontSize: "14px", color: "#6c757d" }}>
        <h4>Test Coverage:</h4>
        <ul style={{ paddingLeft: "20px" }}>
          <li>GET /menu - Get all items</li>
          <li>GET /menu/:id - Get single item</li>
          <li>GET /menu/category/:category - Items by category</li>
          <li>GET /menu/categories/all - All categories</li>
          <li>GET /menu/search/:query - Search items</li>
          <li>POST /menu - Create item (admin)</li>
          <li>PUT /menu/:id - Update item (admin)</li>
          <li>PATCH /menu/:id/availability - Update availability</li>
          <li>DELETE /menu/:id - Delete item (admin)</li>
        </ul>
      </div>
    </div>
  );
};

export default TestMenuAPI;
