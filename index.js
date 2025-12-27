require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const { ACCESS_TOKEN, PHONE_NUMBER_ID, VERIFY_TOKEN } = process.env;

app.get("/", (req, res) => {
  res.send("🚀 Railway WhatsApp Bot is Live");
});

// WEBHOOK VERIFICATION
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// RECEIVE MESSAGE
app.post("/webhook", async (req, res) => {
  try {
    const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!msg) return res.sendStatus(200);

    const from = msg.from;
    const text = msg.text?.body || "";

    console.log("📩 Received:", from, text);

    await axios.post(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages?access_token=${ACCESS_TOKEN}`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: { body: `🤖 Reply: ${text}` }
      }
    );

    console.log("📤 Replied Successfully");
    res.sendStatus(200);

  } catch (error) {
    console.error("❌ Error:", error.response?.data || error);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server running on PORT " + PORT));
