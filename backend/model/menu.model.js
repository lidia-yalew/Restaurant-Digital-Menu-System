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
    const { name, description, price, category, image_url } = menuData;
    const result = await pool.query(
      `INSERT INTO menu_items (name, description, price, category, image_url) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, price, category, image_url]
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

  static async delete(id) {
    await pool.query("DELETE FROM menu_items WHERE id = $1", [id]);
    return true;
  }
}

module.exports = Menu;
