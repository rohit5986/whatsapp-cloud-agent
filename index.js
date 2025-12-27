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
  console.log("📥 Incoming POST Webhook:", JSON.stringify(req.body, null, 2));

  const data = req.body;

  if (!data.object) {
    console.log("❌ No data.object found");
    return res.sendStatus(404);
  }

  try {
    const message = data.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      console.log("⚠️ No message field. Maybe status update instead of text message");
      return res.sendStatus(200);
    }

    const from = message.from;
    const text = message.text?.body || "No text";

    console.log(`📩 Received from ${from}: ${text}`);

    await axios.post(
  `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages?access_token=${ACCESS_TOKEN}`,
  {
    messaging_product: "whatsapp",
    to: from,
    text: { body: `🤖 Hello! You said: "${text}"` }
  },
  { headers: { "Content-Type": "application/json" } }
);


    console.log("📤 Auto-reply sent successfully!");
    res.sendStatus(200);

  } catch (error) {
    console.log("🔥 ERROR sending message:", error.response?.data || error);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Running ${PORT}`));





