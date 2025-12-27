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
  console.log("📥 Incoming update:", JSON.stringify(req.body, null, 2));

  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;
    const text = message.text?.body || "";

    console.log("📩 Message:", from, text);

    const response = await axios.post(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages?access_token=${ACCESS_TOKEN}`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: { body: `🤖 Auto reply: ${text}` }
      }
    );

    console.log("📤 Reply Success:", response.data);
    res.sendStatus(200);

  } catch (error) {
    console.log("❌ Reply Error:", error.response?.data || error);
    res.sendStatus(500);
  }
});


    console.log("📤 Auto-reply sent successfully!");
    res.sendStatus(200);

  } catch (error) {
    console.log("🔥 ERROR sending message:", error.response?.data || error);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Running ${PORT}`));






