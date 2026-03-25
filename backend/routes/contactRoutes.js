const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

// POST contact form
router.post("/", async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || !phone || !email || !message) {
      return res.json({ message: "Please fill all the details" });
    }

    const newMessage = new Contact({
      name,
      phone,
      email,
      message,
    });

    await newMessage.save();

    res.json({ message: "Message sent successfully" });
  } catch (error) {
    console.log("Contact Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;