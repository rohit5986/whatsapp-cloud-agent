require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Base Test Route
app.get("/", (req, res) => {
  res.send("WhatsApp Cloud API Agent is running ✅");
});

// Webhook Verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("🔐 Webhook Verified!");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Receive Messages + Auto Reply
app.post("/webhook", async (req, res) => {

  console.log("📥 Incoming Webhook:", JSON.stringify(req.body, null, 2));

  try {
    const entry = req.body.entry?.[0]?.changes?.[0]?.value?.messages;
    if (!entry) return res.sendStatus(200);

    const message = entry[0];
    const from = message.from;
    const text = message.text?.body || "No message found";

    console.log(`📩 Message from ${from}: "${text}"`);

    const url = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages?access_token=${ACCESS_TOKEN}`;

    const payload = {
      messaging_product: "whatsapp",
      to: from,
      text: { body: `🤖 Auto reply: You said "${text}"` }
    };

    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" }
    });

    console.log("📤 Reply Sent:", response.data);
    return res.sendStatus(200);

  } catch (error) {
    console.log("🔥 ERROR:", error.response?.data || error);
    return res.sendStatus(500);
  }
});

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
