// server/src/middleware/auth.js - Authentication middleware

const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // Get token from authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // Fetch user from database to check role
  req.prisma.user
    .findUnique({
      where: { id: req.user.userId },
    })
    .then((user) => {
      if (user && user.userRole === "ADMIN") {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: "Access denied. Admin rights required.",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: "Error checking user role",
        error: error.message,
      });
    });
};

// Middleware to check faculty role (allows admin too)
const isFaculty = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // Fetch user from database to check role
  req.prisma.user
    .findUnique({
      where: { id: req.user.userId },
    })
    .then((user) => {
      if (user && (user.userRole === "FACULTY" || user.userRole === "ADMIN")) {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: "Access denied. Faculty rights required.",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: "Error checking user role",
        error: error.message,
      });
    });
};

module.exports = {
  authenticateToken,
  isAdmin,
  isFaculty,
};
