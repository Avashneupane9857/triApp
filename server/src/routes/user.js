// server/src/routes/users.js - User management routes (continued)

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { authenticateToken, isAdmin } = require("../middleware/auth");

// Get list of users (with restrictions based on role)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { department, role } = req.query;
    const whereClause = {};
    if (department) whereClause.department = department;
    if (role) whereClause.userRole = role.toUpperCase();

    // Only users with a publicKey
    whereClause.publicKey = { not: null };

    const users = await req.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        userRole: true,
        department: true,
        publicKey: true
      },
      orderBy: {
        username: "asc"
      }
    });

    res.json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user's public key
router.get("/:id/publicKey", authenticateToken, async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({
      where: { id: req.params.id },
      select: { publicKey: true, username: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.publicKey) {
      return res.status(404).json({
        success: false,
        message: "User has not set a public key yet",
      });
    }

    res.json({
      success: true,
      username: user.username,
      publicKey: user.publicKey,
    });
  } catch (error) {
    console.error("Fetch public key error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch public key",
      error: error.message,
    });
  }
});

// Admin only: Create new user
router.post("/", authenticateToken, isAdmin, async (req, res) => {
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

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        userRole: user.userRole,
        department: user.department,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
});

// Admin only: Update user
router.put("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userRole, department, email } = req.body;
    const userId = req.params.id;

    // Check if user exists
    const existingUser = await req.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prepare update data
    const updateData = {};
    if (userRole) updateData.userRole = userRole;
    if (department) updateData.department = department;
    if (email) updateData.email = email;

    // Update user
    const updatedUser = await req.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({
      success: true,
      message: "User updated successfully",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        userRole: updatedUser.userRole,
        department: updatedUser.department,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
});

// Admin only: Reset user password
router.post(
  "/:id/reset-password",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { newPassword } = req.body;
      const userId = req.params.id;

      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 8 characters",
        });
      }

      // Check if user exists
      const existingUser = await req.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update user password
      await req.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      res.json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reset password",
        error: error.message,
      });
    }
  }
);

// Get departments (for filtering)
router.get("/departments", authenticateToken, async (req, res) => {
  try {
    // Get unique departments from users
    const users = await req.prisma.user.findMany({
      select: { department: true },
      where: { department: { not: null } },
      distinct: ["department"],
    });

    const departments = users
      .map((user) => user.department)
      .filter(Boolean) // Remove nulls
      .sort();

    res.json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error("Fetch departments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
});

module.exports = router;
