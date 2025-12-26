// routes/user.routes.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// GET /api/users - Get all users (ADMIN ONLY)
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, role, created_at FROM users ORDER BY id"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/users/:id - Get user by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Users can only get their own profile unless they're admin
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const result = await pool.query(
      "SELECT id, username, role, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/users/:id - Update user
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { username, role } = req.body;

    // Users can only update their own profile unless they're admin
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Only admin can change roles
    const updateData = { username };
    if (req.user.role === "admin" && role) {
      updateData.role = role;
    }

    // Check if username already exists (if changing username)
    if (username) {
      const existingUser = await pool.query(
        "SELECT id FROM users WHERE username = $1 AND id != $2",
        [username, userId]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: "Username already taken" });
      }
    }

    const result = await pool.query(
      "UPDATE users SET username = COALESCE($1, username), role = COALESCE($2, role) WHERE id = $3 RETURNING id, username, role, created_at",
      [updateData.username, updateData.role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/users/:id - Delete user
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Users can only delete their own account unless they're admin
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Prevent deleting the last admin
    if (req.user.role === "admin" && req.user.id === userId) {
      const adminCount = await pool.query(
        "SELECT COUNT(*) FROM users WHERE role = 'admin'"
      );

      if (parseInt(adminCount.rows[0].count) === 1) {
        return res.status(400).json({ error: "Cannot delete the last admin" });
      }
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/users/me - Get current user profile
router.get("/me/profile", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, role, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/users/me/profile - Update current user profile
router.put("/me/profile", verifyToken, async (req, res) => {
  try {
    const { username } = req.body;

    // Check if username already exists
    if (username) {
      const existingUser = await pool.query(
        "SELECT id FROM users WHERE username = $1 AND id != $2",
        [username, req.user.id]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: "Username already taken" });
      }
    }

    const result = await pool.query(
      "UPDATE users SET username = COALESCE($1, username) WHERE id = $2 RETURNING id, username, role, created_at",
      [username, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
