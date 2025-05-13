require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const { PrismaClient } = require("@prisma/client");
const rateLimit = require("express-rate-limit");

// Import routes
const authRoutes = require("./routes/auth.js");
const messageRoutes = require("./routes/messages.js");
const userRoutes = require("./routes/user.js");

// Initialize Prisma client
const prisma = new PrismaClient();

// Create Express app
const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:8080",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(bodyParser.json());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// Make Prisma available to routes
app.use((req, res, next) => {
  req.prisma = prisma;
  req.io = io;
  next();
});
//health Check Routes

app.get("/", (req, res) => {
  res.send("Healthy server");
});
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected");

  // Authenticate socket connection
  socket.on("authenticate", async (token) => {
    try {
      const user = await authenticateSocketUser(token);
      if (user) {
        // Join a room with the user's ID for direct messaging
        socket.join(user.id);
        socket.emit("authenticated", { success: true });
      } else {
        socket.emit("authenticated", { success: false });
      }
    } catch (error) {
      socket.emit("authenticated", { success: false, error: error.message });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Authenticate socket user helper function
async function authenticateSocketUser(token) {
  // Implementation of JWT verification (similar to auth middleware)
  // This is simplified - you should implement proper verification
  const jwt = require("jsonwebtoken");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    return user;
  } catch (error) {
    return null;
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await prisma.$disconnect();
  server.close(() => {
    console.log("Process terminated");
  });
});
