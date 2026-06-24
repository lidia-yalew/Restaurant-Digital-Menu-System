// routes/user.routes.js
const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const { verifyToken, authorize } = require("../middleware/auth");

// ✅ GET ALL USERS (ADMIN ONLY)
router.get("/", verifyToken, authorize("admin"), async (req, res) => {
  try {
    console.log("🔵 Fetching all users...");
    
    const result = await pool.query(
      "SELECT id, username, role, email, phone, full_name, profile_image FROM users ORDER BY id"
    );
    
    console.log(`✅ Found ${result.rows.length} users`);
    
    res.json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error fetching users",
    });
  }
});

// ✅ UPDATE USER ROLE (ADMIN ONLY)
router.patch("/:id/role", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;

    const validRoles = ["admin", "manager", "chef", "customer"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      });
    }

    const userCheck = await pool.query(
      "SELECT id, username, role FROM users WHERE id = $1",
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (req.user.id === userId) {
      return res.status(400).json({
        success: false,
        error: "Cannot change your own role",
      });
    }

    const result = await pool.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, role",
      [role, userId]
    );

    console.log(`✅ User ${userId} role updated to ${role}`);

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error updating role:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error updating role",
    });
  }
});

// ✅ DELETE USER (ADMIN ONLY)
router.delete("/:id", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (req.user.id === userId) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete your own account",
      });
    }

    const userToDelete = await pool.query(
      "SELECT id, username, role FROM users WHERE id = $1",
      [userId]
    );

    if (userToDelete.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (userToDelete.rows[0].role === "admin") {
      const adminCount = await pool.query(
        "SELECT COUNT(*) FROM users WHERE role = 'admin'"
      );
      
      if (parseInt(adminCount.rows[0].count) === 1) {
        return res.status(400).json({
          success: false,
          error: "Cannot delete the last admin user",
        });
      }
    }

    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    console.log(`✅ User ${userId} deleted`);

    res.json({
      success: true,
      message: `User "${userToDelete.rows[0].username}" deleted successfully`,
      user: userToDelete.rows[0],
    });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error deleting user",
    });
  }
});

module.exports = router;