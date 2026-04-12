const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const contactRoutes = require("./routes/contactRoutes");

const roadmapRoutes = require("./routes/roadmapRoutes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware (optional but useful)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);

app.use("/api/roadmaps", roadmapRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("DevMap Backend Running...");
});

// MongoDB connection + server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB Error:", err);
  });