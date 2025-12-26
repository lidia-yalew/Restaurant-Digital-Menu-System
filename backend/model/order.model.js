const pool = require("../db/pool");

class Order {
  static async create(orderData) {
    const { customer_name, table_number, phone_number, total_amount, items } =
      orderData;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const orderResult = await client.query(
        `INSERT INTO client_orders (customer_name, table_number, phone_number, total_amount) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [customer_name, table_number, phone_number, total_amount]
      );
      const order = orderResult.rows[0];

      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) 
           VALUES ($1, $2, $3, $4)`,
          [order.id, item.menu_item_id, item.quantity, item.price_at_time]
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
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'menu_item_id', oi.menu_item_id,
                 'quantity', oi.quantity,
                 'price_at_time', oi.price_at_time,
                 'name', mi.name,
                 'image_url', mi.image_url
               )
             ) as items
      FROM client_orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    return result.rows;
  }

  // ✅ ADD THIS - Find by ID with items
  static async findById(id) {
    const result = await pool.query(
      `
      SELECT o.*, 
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'menu_item_id', oi.menu_item_id,
                 'quantity', oi.quantity,
                 'price_at_time', oi.price_at_time,
                 'name', mi.name,
                 'description', mi.description,
                 'image_url', mi.image_url
               )
             ) as items
      FROM client_orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE o.id = $1
      GROUP BY o.id
    `,
      [id]
    );
    return result.rows[0];
  }

  // ✅ ADD THIS - Update order
  static async update(id, orderData) {
    const { customer_name, table_number, phone_number, total_amount, status } =
      orderData;

    const result = await pool.query(
      `UPDATE client_orders 
       SET customer_name = $1, table_number = $2, phone_number = $3, 
           total_amount = $4, status = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [customer_name, table_number, phone_number, total_amount, status, id]
    );
    return result.rows[0];
  }

  // ✅ ADD THIS - Delete order
  static async delete(id) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // First delete order items
      await client.query("DELETE FROM order_items WHERE order_id = $1", [id]);

      // Then delete the order
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

  // ✅ ADD THIS - Find by status
  static async findByStatus(status) {
    const result = await pool.query(
      `
      SELECT o.*, 
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'menu_item_id', oi.menu_item_id,
                 'quantity', oi.quantity,
                 'price_at_time', oi.price_at_time,
                 'name', mi.name
               )
             ) as items
      FROM client_orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE o.status = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `,
      [status]
    );
    return result.rows;
  }

  // ✅ ADD THIS - Find by table number
  static async findByTableNumber(tableNumber) {
    const result = await pool.query(
      `
      SELECT o.*, 
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'menu_item_id', oi.menu_item_id,
                 'quantity', oi.quantity,
                 'price_at_time', oi.price_at_time,
                 'name', mi.name
               )
             ) as items
      FROM client_orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE o.table_number = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `,
      [tableNumber]
    );
    return result.rows;
  }

  // ✅ ADD THIS - Update status only
  static async updateStatus(id, status) {
    const result = await pool.query(
      `UPDATE client_orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  }

  // ✅ ADD THIS - Get kitchen queue (pending/preparing orders)
  static async getKitchenQueue() {
    const result = await pool.query(`
      SELECT o.*, 
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'menu_item_id', oi.menu_item_id,
                 'quantity', oi.quantity,
                 'price_at_time', oi.price_at_time,
                 'name', mi.name,
                 'category', mi.category
               )
             ) as items
      FROM client_orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE o.status IN ('pending', 'preparing', 'confirmed')
      GROUP BY o.id
      ORDER BY 
        CASE o.status 
          WHEN 'pending' THEN 1
          WHEN 'confirmed' THEN 2
          WHEN 'preparing' THEN 3
          ELSE 4
        END,
        o.created_at ASC
    `);
    return result.rows;
  }
}

module.exports = Order;
