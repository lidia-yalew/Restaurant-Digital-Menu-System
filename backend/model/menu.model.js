const pool = require("../db/pool");

class Menu {
  // ✅ GET ALL MENU ITEMS WITH ADVANCED FILTERS
  static async findAllWithFilters(filters = {}) {
    try {
      let query = `
        SELECT 
          mi.*,
          COUNT(oi.id) as order_count,
          ROUND(AVG(oi.quantity), 2) as avg_quantity_per_order
        FROM menu_items mi
        LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
        WHERE 1=1
      `;

      const params = [];
      let paramCount = 1;

      // 🔍 Category Filter
      if (filters.category) {
        query += ` AND mi.category = $${paramCount}`;
        params.push(filters.category);
        paramCount++;
      }

      // 💰 Price Range Filter
      if (filters.minPrice !== undefined) {
        query += ` AND mi.price >= $${paramCount}`;
        params.push(parseFloat(filters.minPrice));
        paramCount++;
      }

      if (filters.maxPrice !== undefined) {
        query += ` AND mi.price <= $${paramCount}`;
        params.push(parseFloat(filters.maxPrice));
        paramCount++;
      }

      // ✅ Availability Filter
      if (filters.available !== undefined) {
        query += ` AND mi.is_available = $${paramCount}`;
        params.push(filters.available === "true" || filters.available === true);
        paramCount++;
      }

      // 🔎 Search Filter
      if (filters.search) {
        query += ` AND (
    mi.name ILIKE $${paramCount} 
    OR mi.description ILIKE $${paramCount}
    OR mi.category ILIKE $${paramCount}
  )`;
        params.push(`%${filters.search}%`);
        paramCount++;
      }

      // 📊 Group by for aggregation
      query += ` GROUP BY mi.id`;

      // 🔢 HAVING clause for popularity
      if (filters.minPopularity) {
        query += ` HAVING COUNT(oi.id) >= $${paramCount}`;
        params.push(parseInt(filters.minPopularity));
        paramCount++;
      }

      // 📈 SORTING OPTIONS
      const sortOptions = {
        name_asc: "mi.name ASC",
        name_desc: "mi.name DESC",
        price_low: "mi.price ASC",
        price_high: "mi.price DESC",
        newest: "mi.created_at DESC",
        oldest: "mi.created_at ASC",
        popular: "order_count DESC",
        avg_quantity: "avg_quantity_per_order DESC",
      };

      const sortBy = sortOptions[filters.sortBy] || "mi.name ASC";
      query += ` ORDER BY ${sortBy}`;

      // 📄 PAGINATION
      if (filters.limit) {
        const limit = parseInt(filters.limit);
        const offset = ((parseInt(filters.page) || 1) - 1) * limit;

        query += ` LIMIT $${paramCount}`;
        params.push(limit);
        paramCount++;

        query += ` OFFSET $${paramCount}`;
        params.push(offset);
      }

      // Execute query
      const result = await pool.query(query, params);

      // 📊 GET TOTAL COUNT (for pagination info)
      let countQuery =
        "SELECT COUNT(DISTINCT mi.id) as total FROM menu_items mi WHERE 1=1";
      const countParams = [];
      let countParamCount = 1;

      // Apply same filters to count query
      if (filters.category) {
        countQuery += ` AND mi.category = $${countParamCount}`;
        countParams.push(filters.category);
        countParamCount++;
      }

      if (filters.minPrice !== undefined) {
        countQuery += ` AND mi.price >= $${countParamCount}`;
        countParams.push(parseFloat(filters.minPrice));
        countParamCount++;
      }

      if (filters.maxPrice !== undefined) {
        countQuery += ` AND mi.price <= $${countParamCount}`;
        countParams.push(parseFloat(filters.maxPrice));
        countParamCount++;
      }

      if (filters.available !== undefined) {
        countQuery += ` AND mi.is_available = $${countParamCount}`;
        countParams.push(
          filters.available === "true" || filters.available === true
        );
        countParamCount++;
      }

      if (filters.search) {
        countQuery += ` AND (
          mi.name ILIKE $${countParamCount} 
          OR mi.description ILIKE $${countParamCount}
        )`;
        countParams.push(`%${filters.search}%`);
        countParamCount++;
      }

      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const totalPages = Math.ceil(total / limit);

      return {
        items: result.rows,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        filters: filters,
        stats: {
          minPrice:
            result.rows.length > 0
              ? Math.min(...result.rows.map((i) => i.price))
              : 0,
          maxPrice:
            result.rows.length > 0
              ? Math.max(...result.rows.map((i) => i.price))
              : 0,
          categories: [...new Set(result.rows.map((i) => i.category))],
        },
      };
    } catch (error) {
      console.error("Error in findAllWithFilters:", error);
      throw error;
    }
  }

  // ✅ GET SINGLE MENU ITEM
  static async findById(id) {
    try {
      const result = await pool.query(
        `
        SELECT 
          mi.*,
          COUNT(oi.id) as total_orders,
          SUM(oi.quantity) as total_quantity_sold
        FROM menu_items mi
        LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
        WHERE mi.id = $1
        GROUP BY mi.id
      `,
        [id]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Error finding menu item by ID:", error);
      throw error;
    }
  }

  // ✅ CREATE MENU ITEM WITH VALIDATION
static async create(menuData) {
  const {
    name,
    description,
    price,
    category,
    image_url,
    is_available,
    preparation_time = 15  // Default value
  } = menuData;

  const result = await pool.query(
    `INSERT INTO menu_items 
     (name, description, price, category, image_url, is_available, preparation_time) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING *`,
    [name, description, price, category, image_url, is_available, preparation_time]
  );
  
  return result.rows[0];
}

// Update update method
static async update(id, updates) {
  const {
    name,
    description,
    price,
    category,
    image_url,
    is_available,
    preparation_time
  } = updates;

  const result = await pool.query(
    `UPDATE menu_items 
     SET name = $1, 
         description = $2, 
         price = $3, 
         category = $4, 
         image_url = $5, 
         is_available = $6,
         preparation_time = $7,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $8 
     RETURNING *`,
    [name, description, price, category, image_url, is_available, preparation_time, id]
  );
  
  return result.rows[0];
}

  // ✅ GET ITEMS BY CATEGORY
  static async findByCategory(category, availableOnly = true) {
    try {
      const query = `
        SELECT * FROM menu_items 
        WHERE category = $1 
        ${availableOnly ? "AND is_available = true" : ""}
        ORDER BY name
      `;

      const result = await pool.query(query, [category]);
      return result.rows;
    } catch (error) {
      console.error("Error finding items by category:", error);
      throw error;
    }
  }

  // ✅ SEARCH MENU ITEMS
  static async search(query) {
    try {
      const result = await pool.query(
        `
      SELECT * FROM menu_items 
      WHERE (
        name ILIKE $1 
        OR description ILIKE $1
        -- REMOVED: OR ingredients::text ILIKE $1
        OR category ILIKE $1
      )
      AND is_available = true
      ORDER BY name
    `,
        [`%${query}%`]
      );

      return result.rows;
    } catch (error) {
      console.error("Error searching menu items:", error);
      throw error;
    }
  }

  // ✅ GET ALL CATEGORIES WITH STATS
  static async getCategories() {
    try {
      const result = await pool.query(`
      SELECT 
        category,
        COUNT(*) as item_count,
        COUNT(CASE WHEN is_available THEN 1 END) as available_count,
        MIN(price) as min_price,
        MAX(price) as max_price,
        ROUND(AVG(price), 2) as avg_price
      FROM menu_items
      GROUP BY category
      ORDER BY category
    `);

      return result.rows;
    } catch (error) {
      console.error("Error getting categories:", error);
      throw error;
    }
  }

  // ✅ UPDATE AVAILABILITY
  static async updateAvailability(id, isAvailable) {
    try {
      const result = await pool.query(
        `
        UPDATE menu_items 
        SET is_available = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, name, is_available, category
      `,
        [isAvailable, id]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Error updating availability:", error);
      throw error;
    }
  }

  // ✅ BULK UPDATE AVAILABILITY
  static async bulkUpdateAvailability(itemIds, isAvailable) {
    try {
      const result = await pool.query(
        `
        UPDATE menu_items 
        SET is_available = $1, updated_at = NOW()
        WHERE id = ANY($2)
        RETURNING id, name, category, is_available
      `,
        [isAvailable, itemIds]
      );

      return result.rows;
    } catch (error) {
      console.error("Error in bulk update availability:", error);
      throw error;
    }
  }

  // ✅ CHECK FOR DUPLICATE NAME
  static async findByName(name, excludeId = null) {
    try {
      let query = "SELECT * FROM menu_items WHERE name = $1";
      const params = [name];

      if (excludeId) {
        query += " AND id != $2";
        params.push(excludeId);
      }

      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error("Error finding by name:", error);
      throw error;
    }
  }

  // ✅ CHECK ACTIVE ORDERS
  static async hasActiveOrders(itemId) {
    try {
      const result = await pool.query(
        `
        SELECT COUNT(*) FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.menu_item_id = $1 
        AND o.status IN ('pending', 'confirmed', 'preparing')
      `,
        [itemId]
      );

      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error("Error checking active orders:", error);
      throw error;
    }
  }

  // ✅ GET MENU STATISTICS (for dashboard)
  static async getStatistics() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_items,
          COUNT(CASE WHEN is_available THEN 1 END) as available_items,
          COUNT(DISTINCT category) as category_count,
          ROUND(AVG(price), 2) as avg_price,
          MIN(price) as min_price,
          MAX(price) as max_price,
          SUM(
            CASE 
              WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 
              ELSE 0 
            END
          ) as items_last_7_days
        FROM menu_items
      `);

      return result.rows[0];
    } catch (error) {
      console.error("Error getting menu statistics:", error);
      throw error;
    }
  }

  // ✅ GET POPULAR ITEMS
  static async getPopularItems(limit = 10) {
    try {
      const result = await pool.query(
        `
        SELECT 
          mi.id, mi.name, mi.category, mi.price, mi.image_url,
          COUNT(oi.id) as order_count,
          SUM(oi.quantity) as total_quantity
        FROM menu_items mi
        LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
        WHERE mi.is_available = true
        GROUP BY mi.id
        ORDER BY order_count DESC, total_quantity DESC
        LIMIT $1
      `,
        [limit]
      );

      return result.rows;
    } catch (error) {
      console.error("Error getting popular items:", error);
      throw error;
    }
  }

  // ✅ DELETE MENU ITEM
  static async delete(id) {
    try {
      const result = await pool.query(
        `
        DELETE FROM menu_items 
        WHERE id = $1 
        RETURNING id, name, category
      `,
        [id]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Error deleting menu item:", error);
      throw error;
    }
  }
}

module.exports = Menu;


{ /* models/menu.model.js
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

module.exports = Menu;*/
}
