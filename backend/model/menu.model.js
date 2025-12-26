// models/menu.model.js
const pool = require("../db/pool");

class Menu {
  static async findAll() {
    const result = await pool.query("SELECT * FROM menu_items ORDER BY id");
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query("SELECT * FROM menu_items WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }

  static async create(menuData) {
    const { name, description, price, category, image_url, is_available } =
      menuData;
    const result = await pool.query(
      `INSERT INTO menu_items (name, description, price, category, image_url, is_available) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        name,
        description,
        price,
        category,
        image_url,
        is_available !== undefined ? is_available : true,
      ]
    );
    return result.rows[0];
  }

  static async update(id, menuData) {
    const { name, description, price, category, image_url, is_available } =
      menuData;
    const result = await pool.query(
      `UPDATE menu_items 
       SET name = $1, description = $2, price = $3, category = $4, 
           image_url = $5, is_available = $6 
       WHERE id = $7 RETURNING *`,
      [name, description, price, category, image_url, is_available, id]
    );
    return result.rows[0];
  }

  // ✅ ADD THIS METHOD - Get items by category
  static async findByCategory(category) {
    const result = await pool.query(
      "SELECT * FROM menu_items WHERE category = $1 ORDER BY id",
      [category]
    );
    return result.rows;
  }

  // ✅ ADD THIS METHOD - Search menu items
  static async search(query) {
    const searchTerm = `%${query}%`;
    const result = await pool.query(
      `SELECT * FROM menu_items 
       WHERE name ILIKE $1 
       OR description ILIKE $1 
       OR category ILIKE $1 
       ORDER BY name`,
      [searchTerm]
    );
    return result.rows;
  }

  // ✅ ADD THIS METHOD - Get all unique categories
  static async getCategories() {
    const result = await pool.query(
      "SELECT DISTINCT category FROM menu_items ORDER BY category"
    );
    return result.rows.map((row) => row.category);
  }

  // ✅ ADD THIS METHOD - Update availability only
  static async updateAvailability(id, isAvailable) {
    const result = await pool.query(
      `UPDATE menu_items 
       SET is_available = $1 
       WHERE id = $2 RETURNING *`,
      [isAvailable, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM menu_items WHERE id = $1", [id]);
    return true;
  }
}

module.exports = Menu;
