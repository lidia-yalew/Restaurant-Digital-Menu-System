const pool = require("../db/pool");

class Order {
  static async create(orderData) {
    const { customer_name, table_number, phone_number, total_amount, items } =
      orderData;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const orderResult = await client.query(
        `INSERT INTO  client_orders (customer_name, table_number, phone_number, total_amount) 
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
               'name', mi.name
             )
           ) as items
    FROM client_orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
    GROUP BY o.id
    ORDER BY o.id DESC  -- Use id instead if no created_at
  `);
    return result.rows;
  }
}

module.exports = Order;
