require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

app.get("/", (req, res) => {
  res.send("WhatsApp Cloud API Agent is running ✅");
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  console.log("🔥 Incoming Webhook Body:", JSON.stringify(req.body, null, 2));

  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];

  if (!message) {
    console.log("⚠️ No message found. Payload did not contain a message.");
    return res.sendStatus(200);
  }

  const from = message.from;
  const text = message.text?.body || "No text";

  console.log(`📩 FROM: ${from} | TEXT: ${text}`);

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v17.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: { body: `🤖 Auto Reply: "${text}"` }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📤 Reply SENT:", response.data);
  } catch (error) {
    console.error("❌ ERROR sending reply:", error.response?.data || error);
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Running ${PORT}`));



