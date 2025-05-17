// server/src/routes/auth.js - Authentication routes

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../middleware/auth");

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, userRole, department } = req.body;
        
    // Check if user already exists
    const existingUser = await req.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await req.prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        userRole: userRole || "STUDENT",
        department,
      },
    });

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        userRole: user.userRole,
        department: user.department,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await req.prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }, // Allow login with email as well
        ],
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        userRole: user.userRole,
        department: user.department,
        hasPublicKey: !!user.publicKey,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        userRole: user.userRole,
        department: user.department,
        hasPublicKey: !!user.publicKey,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
});

// Update user's public key
router.put("/publicKey", authenticateToken, async (req, res) => {
  try {
    const { publicKey } = req.body;

    if (!publicKey) {
      return res.status(400).json({
        success: false,
        message: "Public key is required",
      });
    }

    const updatedUser = await req.prisma.user.update({
      where: { id: req.user.userId },
      data: { publicKey },
    });

    res.json({
      success: true,
      message: "Public key updated successfully",
    });
  } catch (error) {
    console.error("Public key update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update public key",
      error: error.message,
    });
  }
});

module.exports = router;
