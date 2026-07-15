import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import http from "http";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import * as cookie from "cookie";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import interestRoutes from "./routes/interestRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import User from "./models/User.js";
import Chat from "./models/Chat.js";
import Notification from "./models/Notification.js";
import { canChat } from "./controllers/chatController.js";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "https://soulmatematrimoni.netlify.app"
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL.replace(/\/$/, ""));
}

const checkOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  const cleanOrigin = origin.replace(/\/$/, "");
  const matches = allowedOrigins.some(
    (allowed) => allowed.replace(/\/$/, "") === cleanOrigin
  );
  if (matches) {
    return callback(null, true);
  }
  return callback(new Error("CORS policy violation"), false);
};

const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: checkOrigin,
    credentials: true,
    methods: ["GET", "POST"]
  }
});

const onlineUsers = new Map();

app.use(helmet());
app.use(
  cors({
    origin: checkOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/api/health", (req, res) => res.json({ ok: true, name: "Soulmate Matrimony API" }));
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/interest", interestRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);
app.use(notFound);
app.use(errorHandler);

io.use(async (socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.jwt || socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) return next(new Error("Invalid account"));

    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Invalid socket token"));
  }
});

io.on("connection", (socket) => {
  const userId = String(socket.user._id);
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socket.id);
  socket.join(userId);
  io.emit("presence:update", { userId, online: true });

  socket.on("typing", ({ to, isTyping }) => {
    io.to(String(to)).emit("typing", { from: userId, isTyping });
  });

  socket.on("message:send", async ({ to, text }, ack) => {
    try {
      if (!text?.trim()) return ack?.({ ok: false, message: "Message is required" });
      if (!(await canChat(userId, to))) {
        return ack?.({ ok: false, message: "Chat is available after an accepted interest" });
      }

      const participants = [userId, String(to)].sort();
      const chat = await Chat.findOneAndUpdate(
        { participants: { $all: participants, $size: 2 } },
        { $push: { messages: { sender: userId, text: text.trim(), seenBy: [userId] } }, $setOnInsert: { participants } },
        { new: true, upsert: true }
      );
      const message = chat.messages.at(-1);

      await Notification.create({
        user: to,
        type: "New Message",
        title: "New message",
        message: `${socket.user.fullName} sent you a message`
      });

      io.to(String(to)).to(userId).emit("message:new", { chatId: chat._id, message });
      ack?.({ ok: true, message });
    } catch (error) {
      ack?.({ ok: false, message: error.message });
    }
  });

  socket.on("message:seen", async ({ chatId }) => {
    await Chat.updateOne({ _id: chatId, participants: userId }, { $addToSet: { "messages.$[].seenBy": userId } });
    socket.broadcast.emit("message:seen", { chatId, userId });
  });

  socket.on("disconnect", async () => {
    if (onlineUsers.has(userId)) {
      onlineUsers.get(userId).delete(socket.id);
      if (onlineUsers.get(userId).size === 0) {
        onlineUsers.delete(userId);
        const lastSeenAt = new Date();
        await User.findByIdAndUpdate(userId, { lastSeenAt });
        io.emit("presence:update", { userId, online: false, lastSeenAt });
      }
    }
  });
});

const ensureAdminUser = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@soulmate.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Password123";
  try {
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!existingAdmin) {
      await User.create({
        fullName: "Soulmate Admin",
        email: adminEmail,
        mobile: "9876543210",
        password: adminPassword,
        gender: "Other",
        role: "admin",
        isActive: true,
        isPremium: true
      });
      console.log(`Auto-created default admin user: ${adminEmail}`);
    } else {
      let needsSave = false;
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        needsSave = true;
      }
      if (!existingAdmin.isActive) {
        existingAdmin.isActive = true;
        needsSave = true;
      }
      if (needsSave) {
        await existingAdmin.save();
        console.log(`Updated admin user constraints for: ${adminEmail}`);
      }
    }
  } catch (err) {
    console.error("Failed to ensure admin user presence:", err);
  }
};

const port = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    await ensureAdminUser();
    server.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
