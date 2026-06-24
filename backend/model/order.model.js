const pool = require("../db/pool");

class Order {
  static async create(orderData) {
    const {
      customer_name,
      table_number,
      phone_number,
      total_amount,
      items,
      notes,
      status = "pending",
    } = orderData;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Insert order with notes
      const orderResult = await client.query(
        `INSERT INTO client_orders (customer_name, table_number, phone_number, total_amount, notes, status) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          customer_name,
          table_number || 1,
          phone_number || "",
          total_amount || 0,
          notes || "",
          status,
        ]
      );
      const order = orderResult.rows[0];

      // Insert order items
      for (const item of items) {
  await client.query(
    `INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) 
     VALUES ($1, $2, $3, $4)`,
    [order.id, item.menu_item_id, item.quantity || 1, item.price_at_time || 0]
  );
}

      await client.query("COMMIT");
      return order;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async findAll() {
    const result = await pool.query(`
     SELECT o.*, 
       COALESCE(
         json_agg(
           json_build_object(
             'id', oi.id,
             'menu_item_id', oi.menu_item_id,
             'quantity', oi.quantity,
             'price_at_time', oi.price_at_time,
             'name', mi.name,
             'image_url', mi.image_url
           )
         ) FILTER (WHERE oi.id IS NOT NULL),
         '[]'
       ) as items
FROM client_orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
GROUP BY o.id
ORDER BY o.created_at DESC
    `);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      `
    SELECT o.*, 
       COALESCE(
         json_agg(
           json_build_object(
             'id', oi.id,
             'menu_item_id', oi.menu_item_id,
             'quantity', oi.quantity,
             'price_at_time', oi.price_at_time,
             'name', mi.name,
             'image_url', mi.image_url
           )
         ) FILTER (WHERE oi.id IS NOT NULL),
         '[]'
       ) as items
FROM client_orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
GROUP BY o.id
ORDER BY o.created_at DESC
    `,
      [id]
    );
    return result.rows[0];
  }

  static async update(id, orderData) {
    const {
      customer_name,
      table_number,
      phone_number,
      total_amount,
      status,
      notes,
    } = orderData;

    const result = await pool.query(
      `UPDATE client_orders 
       SET customer_name = $1, table_number = $2, phone_number = $3, 
           total_amount = $4, status = $5, notes = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [
        customer_name,
        table_number,
        phone_number,
        total_amount,
        status,
        notes || "",
        id,
      ]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM order_items WHERE order_id = $1", [id]);
      await client.query("DELETE FROM client_orders WHERE id = $1", [id]);
      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByStatus(status) {
    const result = await pool.query(
      `
      SELECT o.*, 
       COALESCE(
         json_agg(
           json_build_object(
             'id', oi.id,
             'menu_item_id', oi.menu_item_id,
             'quantity', oi.quantity,
             'price_at_time', oi.price_at_time,
             'name', mi.name,
             'image_url', mi.image_url
           )
         ) FILTER (WHERE oi.id IS NOT NULL),
         '[]'
       ) as items
FROM client_orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
GROUP BY o.id
ORDER BY o.created_at DESC
    `,
      [status]
    );
    return result.rows;
  }

  static async findByTableNumber(tableNumber) {
    const result = await pool.query(
      `
      SELECT o.*, 
       COALESCE(
         json_agg(
           json_build_object(
             'id', oi.id,
             'menu_item_id', oi.menu_item_id,
             'quantity', oi.quantity,
             'price_at_time', oi.price_at_time,
             'name', mi.name,
             'image_url', mi.image_url
           )
         ) FILTER (WHERE oi.id IS NOT NULL),
         '[]'
       ) as items
FROM client_orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
GROUP BY o.id
ORDER BY o.created_at DESC
    `,
      [tableNumber]
    );
    return result.rows;
  }

  static async updateStatus(id, status) {
    const result = await pool.query(
      `UPDATE client_orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  }

  static async getKitchenQueue() {
    const result = await pool.query(`
     SELECT o.*, 
       COALESCE(
         json_agg(
           json_build_object(
             'id', oi.id,
             'menu_item_id', oi.menu_item_id,
             'quantity', oi.quantity,
             'price_at_time', oi.price_at_time,
             'name', mi.name,
             'image_url', mi.image_url
           )
         ) FILTER (WHERE oi.id IS NOT NULL),
         '[]'
       ) as items
FROM client_orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
GROUP BY o.id
ORDER BY o.created_at DESC
    `);
    return result.rows;
  }

  // ✅ Search orders
  static async search(query) {
    const searchTerm = `%${query}%`;
    const result = await pool.query(
      `
     SELECT o.*, 
       COALESCE(
         json_agg(
           json_build_object(
             'id', oi.id,
             'menu_item_id', oi.menu_item_id,
             'quantity', oi.quantity,
             'price_at_time', oi.price_at_time,
             'name', mi.name,
             'image_url', mi.image_url
           )
         ) FILTER (WHERE oi.id IS NOT NULL),
         '[]'
       ) as items
FROM client_orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
GROUP BY o.id
ORDER BY o.created_at DESC
    `,
      [searchTerm]
    );
    return result.rows;
  }

  // ✅ Get today's statistics
  static async getTodayStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_orders_today,
        COALESCE(SUM(total_amount), 0) as total_revenue_today,
        COALESCE(AVG(total_amount), 0) as avg_order_value_today,
        COUNT(CASE WHEN status = 'served' THEN 1 END) as completed_today,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_today,
        COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_today,
        COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_today,
        COUNT(CASE WHEN status = 'served' THEN 1 END) as served_today,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_today,
        COALESCE(MAX(total_amount), 0) as highest_order_today,
        COALESCE(MIN(total_amount), 0) as lowest_order_today
      FROM client_orders 
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    // Get most active table separately
    const tableResult = await pool.query(`
      SELECT table_number as most_active_table
      FROM client_orders 
      WHERE DATE(created_at) = CURRENT_DATE 
      GROUP BY table_number 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    `);

    // Get peak hour separately
    const hourResult = await pool.query(`
      SELECT EXTRACT(HOUR FROM created_at) as peak_hour
      FROM client_orders 
      WHERE DATE(created_at) = CURRENT_DATE
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY COUNT(*) DESC
      LIMIT 1
    `);

    const stats = result.rows[0];
    stats.most_active_table = tableResult.rows[0]?.most_active_table || "N/A";
    stats.peak_hour = hourResult.rows[0]?.peak_hour || "N/A";

    return stats;
  }

  // ✅ NEW: Check if order can be modified (5 minutes)
  static async canCustomerModify(orderId, customerPhone) {
    const order = await this.findById(orderId);
    if (!order) return false;

    // Verify customer owns this order by phone number
    if (order.phone_number !== customerPhone) {
      return false;
    }

    // Check 5-minute time limit
    const orderTime = new Date(order.created_at);
    const currentTime = new Date();
    const minutesSince = (currentTime - orderTime) / (1000 * 60);

    return minutesSince <= 5;
  }
}

module.exports = Order;
