require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

app.use(express.json());

// Base route
app.get("/", (req, res) => {
  res.send("WhatsApp Cloud API Agent is running ✅");
});

// 🔹 Meta Webhook Verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("🎉 Webhook verified by Meta");
    return res.status(200).send(challenge);
  }
  
  return res.sendStatus(403);
});

// 🔹 Receive & Auto Reply
app.post("/webhook", async (req, res) => {
  const data = req.body;

  if (data.object) {
    try {
      const message = data.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      if (message) {
        const from = message.from;
        const text = message.text?.body || "";

        console.log(`📩 Message from ${from}: ${text}`);

        await axios.post(
          `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
          {
            messaging_product: "whatsapp",
            to: from,
            text: { body: `🤖 Hello! You said: "${text}"` }
          },
          {
            headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("📤 Auto reply sent!");
      }

      res.sendStatus(200);
    } catch (error) {
      console.error("❌ Send Error:", error.response?.data || error);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(404);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
