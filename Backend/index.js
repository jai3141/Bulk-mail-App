// Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

/* -------------------- DB CONNECTION -------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to Database"))
  .catch((err) => console.error("❌ DB Error:", err.message));


const Credential = mongoose.model("credential", {}, "bulkmail");

/* -------------------- SEND MAIL API -------------------- */
app.post("/sendmail", async (req, res) => {
  try {
    const { msg, emailList, emaillist } = req.body;
    const emails = emailList || emaillist;

    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Email list empty"
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: { rejectUnauthorized: false }
    });

    await Promise.all(
      emails.map(email =>
        transporter.sendMail({
          from: process.env.MAIL_USER,
          to: email,
          subject: "A message from BulkMail App",
          text: msg
        })
      )
    );

    return res.status(200).json({
      success: true,
      message: "Emails sent successfully"
    });

  } catch (error) {
    console.error("Mail error:", error);
    return res.status(500).json({
      success: false,
      message: "Mail sending failed"
    });
  }
});

/* -------------------- SERVER -------------------- */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
