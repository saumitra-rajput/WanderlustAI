const express = require("express");
const router = express.Router();
const { getTravelRecommendations, chat } = require("../services/ollama");
const wrapAsync = require("../utils/wrapAsync");

// POST /ai/recommend
router.post(
  "/recommend",
  wrapAsync(async (req, res) => {
    const { title, location, country, description, price } = req.body;

    if (!title || !location) {
      return res.status(400).json({
        success: false,
        message: "Listing title and location are required",
      });
    }

    const recommendations = await getTravelRecommendations({
      title, location, country, description, price,
    });

    res.json({ success: true, recommendations });
  })
);

// POST /ai/chat
// Accepts: { message, history, listing (optional) }
router.post(
  "/chat",
  wrapAsync(async (req, res) => {
    const { message, history = [], listing = null } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const response = await chat(message.trim(), history, listing);

    res.json({ success: true, response });
  })
);

module.exports = router;
