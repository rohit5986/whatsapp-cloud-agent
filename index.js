require("dotenv").config();
const express = require("express");
const app = express();

// To handle JSON data from WhatsApp API
app.use(express.json());

// Base route (Test when opening the Render URL)
app.get("/", (req, res) => {
  res.send("WhatsApp Cloud API Agent is running ✅");
});


// 🔹 Meta Webhook Verification
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("🎉 Webhook verified by Meta");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});


// 🔹 Webhook to Receive WhatsApp Messages
app.post("/webhook", (req, res) => {
  console.log("📩 Incoming Message Body:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
