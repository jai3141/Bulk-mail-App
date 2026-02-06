require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

/* ---------- DB CONNECTION ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to Database"))
  .catch((err) => console.error("❌ DB Error:", err.message));

/* ---------- SEND MAIL API ---------- */
app.post("/sendmail", async (req, res) => {
  try {
    const { msg, emailList } = req.body;

    if (!msg || !Array.isArray(emailList) || emailList.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message or email list missing",
      });
    }

    // ⚡ Respond fast (avoid frontend timeout)
    res.status(200).json({
      success: true,
      message: "Emails are being sent",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    // background mail sending
    await Promise.all(
      emailList.map((email) =>
        transporter.sendMail({
          from: process.env.MAIL_USER,
          to: email,
          subject: "BulkMail App",
          text: msg,
        })
      )
    );

    console.log("✅ Emails sent successfully");

  } catch (error) {
    console.error("❌ Mail error:", error.message);
  }
});

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
