// server/src/routes/messages.js - Message handling routes

const express = require("express");
const router = express.Router();
const { authenticateToken, isFaculty } = require("../middleware/auth");

// Get messages for current user (inbox)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const messages = await req.prisma.message.findMany({
      where: {
        recipientId: req.user.userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            department: true,
            userRole: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Fetch messages error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
});

// Get sent messages
router.get("/sent", authenticateToken, async (req, res) => {
  try {
    const messages = await req.prisma.message.findMany({
      where: {
        senderId: req.user.userId,
      },
      include: {
        recipient: {
          select: {
            id: true,
            username: true,
            department: true,
            userRole: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Fetch sent messages error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sent messages",
      error: error.message,
    });
  }
});

// Get specific message
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const message = await req.prisma.message.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            department: true,
            userRole: true,
          },
        },
        recipient: {
          select: {
            id: true,
            username: true,
            department: true,
            userRole: true,
          },
        },
      },
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user has permission to view the message
    if (
      message.senderId !== req.user.userId &&
      message.recipientId !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this message",
      });
    }

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Fetch specific message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch message",
      error: error.message,
    });
  }
});

// Send a new message

router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      recipientId,
      encryptedContent,
      encryptedKey,
      signature,
      hmac,
      messageType,
    } = req.body;

    // Validate required fields
    if (
      !recipientId ||
      !encryptedContent ||
      !encryptedKey ||
      !signature ||
      !hmac ||
      !messageType
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if recipient exists
    const recipient = await req.prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found",
      });
    }

    // Create message
    const message = await req.prisma.message.create({
      data: {
        senderId: req.user.userId,
        recipientId,
        encryptedContent,
        encryptedKey,
        signature,
        hmac,
        messageType,
      },
    });

    // Notify recipient if they're connected via Socket.IO
    req.io.to(recipientId).emit("new-message", {
      id: message.id,
      senderId: req.user.userId,
      messageType,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      messageId: message.id,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
});

// Mark message as read
router.put("/:id/read", authenticateToken, async (req, res) => {
  try {
    const messageId = req.params.id;

    // Check if message exists and user is the recipient
    const message = await req.prisma.message.findFirst({
      where: {
        id: messageId,
        recipientId: req.user.userId,
      },
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found or you are not the recipient",
      });
    }

    // Update message to mark as read
    await req.prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: "Message marked as read",
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark message as read",
      error: error.message,
    });
  }
});

// Send broadcast message (admin/faculty only)
router.post("/broadcast", authenticateToken, isFaculty, async (req, res) => {
  try {
    const { encryptedContent, userRole, department, messageType } = req.body;

    // Find recipients based on filters
    const where = {};
    if (userRole) where.userRole = userRole;
    if (department) where.department = department;

    const recipients = await req.prisma.user.findMany({
      where,
      select: { id: true, publicKey: true },
    });

    if (recipients.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No recipients found matching the criteria",
      });
    }

    // Process each recipient (in real app, consider doing this in batches or as a background job)
    const messagePromises = recipients.map(async (recipient) => {
      // In a real app, you would encrypt the message with each recipient's public key
      // Here we're assuming the client handles the encryption for each recipient

      if (!recipient.publicKey) {
        // Skip recipients without a public key
        return null;
      }

      // You would normally re-encrypt for each recipient, but for demo purposes
      // we're assuming client will handle this complexity
      return req.prisma.message.create({
        data: {
          senderId: req.user.userId,
          recipientId: recipient.id,
          encryptedContent, // In reality, this would be unique per recipient
          encryptedKey: `encrypted-for-${recipient.id}`, // This is a placeholder
          signature: `signature-for-broadcast`, // This is a placeholder
          hmac: `hmac-for-broadcast`, // This is a placeholder
          messageType,
        },
      });
    });

    // Wait for all messages to be created
    const results = await Promise.all(messagePromises);
    const sentCount = results.filter(Boolean).length;

    // Notify connected recipients
    recipients.forEach((recipient) => {
      req.io.to(recipient.id).emit("new-message", {
        senderId: req.user.userId,
        messageType,
        isBroadcast: true,
      });
    });

    res.status(201).json({
      success: true,
      message: `Broadcast sent to ${sentCount} recipients`,
      sentCount,
      totalRecipients: recipients.length,
    });
  } catch (error) {
    console.error("Broadcast error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send broadcast",
      error: error.message,
    });
  }
});

module.exports = router;
