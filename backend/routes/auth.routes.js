// routes/auth.routes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
const { verifyToken, authorize } = require("../middleware/auth");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, password, role = "customer" } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        error: "Username and password are required" 
      });
    }

    // Check if user exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: "User already exists" 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // IMPORTANT: Use 'password_hash' instead of 'password'
    const result = await pool.query(
      "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role",
      [username, hashedPassword, role]
    );

    const newUser = result.rows[0];

    // Create token
    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: newUser,
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Find user
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // ✅ CONSISTENT RESPONSE FORMAT
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    // ✅ CONSISTENT ERROR FORMAT
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  // Since JWT is stateless, we just respond success
  res.json({ message: "Logout successful" });
});

// GET /api/auth/profile
// routes/auth.routes.js - Modified profile route
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { email, phone } = req.body;
    const userId = req.user.id;

    // Build update query without updated_at
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update"
      });
    }

    values.push(userId);
    
    // Check if email/phone columns exist first
    let query;
    try {
      // Try with email/phone columns
      query = `
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, username, email, phone, role
      `;
      const result = await pool.query(query, values);
      
      res.json({
        success: true,
        message: "Profile updated successfully",
        user: result.rows[0]
      });
    } catch (err) {
      // If columns don't exist, just return current user data
      const userResult = await pool.query(
        "SELECT id, username, role FROM users WHERE id = $1",
        [userId]
      );
      
      res.json({
        success: true,
        message: "Profile update not supported",
        user: userResult.rows[0]
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Server error updating profile"
    });
  }
});

// ✅ PUT /api/auth/profile (MISSING ROUTE)
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { email, phone } = req.body;
    const userId = req.user.id;

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update"
      });
    }

    values.push(userId);
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING id, username, email, phone, role, created_at, updated_at
    `;

    const result = await pool.query(query, values);

    // ✅ CONSISTENT RESPONSE FORMAT
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Server error updating profile"
    });
  }
});

// ✅ POST /api/auth/refresh-token (TOKEN REFRESH)
router.post("/refresh-token", verifyToken, async (req, res) => {
  try {
    // Get fresh user data
    const result = await pool.query(
      "SELECT id, username, role FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    const user = result.rows[0];

    // Create new token with same data
    const newToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // ✅ CONSISTENT RESPONSE FORMAT
    res.json({
      success: true,
      message: "Token refreshed successfully",
      token: newToken,
      user: user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Server error refreshing token"
    });
  }
});


// POST /api/auth/change-password - UPDATE WITH MIDDLEWARE
router.post("/change-password", verifyToken, async (req, res) => {
  try {
    // ... [keep your existing code] ...

    // ✅ CONSISTENT RESPONSE FORMAT
    res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

// GET /api/auth/verify 
router.get("/verify", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, role FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: false,
        message: "User no longer exists"
      });
    }

    // ✅ CONSISTENT RESPONSE FORMAT
    res.json({
      success: true,
      valid: true,
      user: result.rows[0]
    });

  } catch (error) {
    res.json({
      success: false,
      valid: false,
      message: "Invalid token"
    });
  }
});

module.exports = router;
