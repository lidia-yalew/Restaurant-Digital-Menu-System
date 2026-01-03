const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const { verifyToken, authorize } = require("../middleware/auth"); 

// ✅ GET ALL USERS (ADMIN ONLY)
router.get("/", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, role, email, phone, created_at, last_login FROM users ORDER BY created_at DESC"
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Server error fetching users",
    });
  }
});

// ✅ UPDATE USER ROLE (ADMIN ONLY)
router.patch("/:id/role", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;

    if (!["admin", "staff", "customer"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Invalid role",
      });
    }

    const result = await pool.query(
      "UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, role",
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User role updated",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Server error updating role",
    });
  }
});

// ✅ DELETE USER (ADMIN ONLY - with safety check)
router.delete("/:id", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Prevent deleting yourself
    if (req.user.id === userId) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete your own account",
      });
    }

    // Check if it's the last admin
    const adminCount = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role = 'admin'"
    );

    const userToDelete = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [userId]
    );

    if (
      userToDelete.rows[0]?.role === "admin" &&
      parseInt(adminCount.rows[0].count) === 1
    ) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete the last admin",
      });
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, username",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Server error deleting user",
    });
  }
});

// ✅ GET USER STATISTICS (ADMIN ONLY)
router.get("/stats", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN role = 'staff' THEN 1 END) as staff_count,
        COUNT(CASE WHEN role = 'customer' THEN 1 END) as customer_count,
        DATE(created_at) as date,
        COUNT(*) as daily_registrations
      FROM users
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 7
    `);

    res.json({
      success: true,
      data: stats.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Server error fetching stats",
    });
  }
});

module.exports = router;
