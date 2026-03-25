const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    console.log("Incoming signup data:", req.body);

    const { email, username, password } = req.body;

    // ✅ check empty fields
    if (!email || !username || !password) {
      return res.json({ message: "Please fill all the details" });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    console.log("User saved:", newUser);

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.log("Signup Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== LOGIN =====================
router.post("/login", async (req, res) => {
  try {
    console.log("Incoming login data:", req.body);

    const { identifier, password } = req.body;

    // ✅ empty field validation
    if (!identifier || !password) {
      return res.json({ message: "Please fill all the details" });
    }

    // find by email OR username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.json({ message: "User not found" });
    }

    // compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ message: "Invalid password" });
    }

    res.json({
      message: "Login successful",
      user: {
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.log("Login Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;