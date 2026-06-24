// routes/auth.routes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
const { verifyToken } = require("../middleware/auth");
const crypto = require("crypto");
const nodemailer = require("nodemailer");


// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Username and password are required" });
    }

    const userExists = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ success: false, error: "Username already taken" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (username, password_hash, role, full_name) 
       VALUES ($1, $2, 'customer', $1) 
       RETURNING id, username, full_name, email, phone, profile_image, role`,
      [username, hashedPassword]
    );

    const newUser = result.rows[0];
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.status(201).json({ success: true, message: "Registration successful", token, user: newUser });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Username and password are required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name || user.username,
        email: user.email,
        phone: user.phone,
        profile_image: user.profile_image,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logout successful" });
});

// PUT /api/auth/profile  ← ONE route only, handles all fields including profile_image
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { full_name, email, phone, profile_image } = req.body;
    const userId = req.user.id;

    console.log("Updating profile for user:", userId);
    console.log("Has profile_image:", !!profile_image);

    const result = await pool.query(
      `UPDATE users 
       SET 
         full_name     = CASE WHEN $1::text IS NOT NULL THEN $1 ELSE full_name END,
         email         = CASE WHEN $2::text IS NOT NULL THEN $2 ELSE email END,
         phone         = CASE WHEN $3::text IS NOT NULL THEN $3 ELSE phone END,
         profile_image = CASE WHEN $4::text IS NOT NULL THEN $4 ELSE profile_image END,
         updated_at    = NOW()
       WHERE id = $5
       RETURNING id, username, full_name, email, phone, profile_image, role`,
      [
        full_name     || null,
        email         || null,
        phone         || null,
        profile_image || null,
        userId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    console.log("Profile updated, image saved:", !!result.rows[0].profile_image);

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ success: false, error: "Server error updating profile" });
  }
});

// GET /api/auth/verify
router.get("/verify", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, full_name, email, phone, profile_image, role 
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, valid: false, message: "User not found" });
    }

    res.json({ success: true, valid: true, user: result.rows[0] });
  } catch (error) {
    console.error("Verify error:", error);
    res.json({ success: false, valid: false, message: "Invalid token" });
  }
});

// POST /api/auth/refresh-token
router.post("/refresh-token", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, full_name, email, phone, profile_image, role 
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const user = result.rows[0];
    const newToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({ success: true, token: newToken, user });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// POST /api/auth/change-password
router.post("/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Both passwords required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [hashedPassword, req.user.id]
    );

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});



// Email transporter — add your Gmail credentials to .env
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your gmail e.g. lidiayalew9@gmail.com
    pass: process.env.EMAIL_PASS, // gmail app password (not your real password)
  },
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check if user exists
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    // Always return success to avoid exposing which emails exist
    if (result.rows.length === 0) {
      return res.json({ success: true, message: "If that email exists, a reset link was sent." });
    }

    const user = result.rows[0];

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save token to DB — add these columns first (see below)
    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3",
      [token, expiry, user.id]
    );

    // Send email
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"Your Restaurant" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
          <h2>Password Reset</h2>
          <p>Hi ${user.full_name || user.username},</p>
          <p>We received a request to reset your password. Click the button below:</p>
          <a href="${resetLink}" 
             style="display:inline-block;padding:12px 24px;background:#16a34a;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">
            Reset Password
          </a>
          <p style="color:#666;font-size:13px;margin-top:16px;">
            This link expires in 1 hour. If you didn't request this, ignore this email.
          </p>
        </div>
      `,
    });

    res.json({ success: true, message: "Reset link sent to your email." });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    // Find user with valid token
    const result = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset link" });
    }

    const user = result.rows[0];

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear token
    await pool.query(
      "UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = NOW() WHERE id = $2",
      [hashedPassword, user.id]
    );

    res.json({ success: true, message: "Password reset successfully" });
console.log("Password updated for user:", user.id, "at", new Date());
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// routes/auth.routes.js — add this route
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, full_name, email, phone, profile_image, role 
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});
module.exports = router;