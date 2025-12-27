require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Home check
app.get("/", (req, res) => {
  res.send("WhatsApp Cloud Bot is running 🚀");
});

// Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook Verified ✔️");
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// Handle messages
app.post("/webhook", async (req, res) => {
  console.log("📩 Incoming:", JSON.stringify(req.body, null, 2));

  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return res.sendStatus(200);

  const from = message.from;
  const text = message.text?.body || "";

  console.log("📨 Message from:", from, "Text:", text);

  try {
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      params: { access_token: ACCESS_TOKEN },
      data: {
        messaging_product: "whatsapp",
        to: from,
        text: { body: `🤖 Auto reply: ${text}` }
      },
    });

    console.log("📤 Reply Sent ✔️");
    return res.sendStatus(200);

  } catch (err) {
    console.error("❌ Error sending:", err.response?.data || err);
    return res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
