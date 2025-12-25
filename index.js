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
app.post("/webhook", async (req, res) => {
  const data = req.body;

  if (data.object) {
    if (data.entry && data.entry[0].changes && data.entry[0].changes[0].value.messages) {
      const message = data.entry[0].changes[0].value.messages[0];      
      const from = message.from;                                      // Sender number
      const text = message.text?.body || "";                          // Incoming text

      console.log("📩 Message from:", from, "→", text);

      // AUTO REPLY
      await axios.post(
        `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: { body: `Hi! 🤖 Thanks for messaging.\nYou said: "${text}"` }
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("📤 Auto reply sent");
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

