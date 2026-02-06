const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

/* -------------------- DB CONNECTION -------------------- */
mongoose
  .connect(
    "mongodb+srv://Jaiganesh:12345@cluster0.zszbf9p.mongodb.net/passkey"
  )
  .then(() => console.log("Connected to Database"))
  .catch((err) => console.log("Failed to connect:", err.message));

/* -------------------- MODEL -------------------- */
const Credential = mongoose.model("credential", {}, "bulkmail");

/* -------------------- SEND MAIL API -------------------- */
app.post("/sendmail", async (req, res) => {
  try {
    const msg = req.body.msg;
    const emailList = req.body.emailList || req.body.emaillist;

    // validation
    if (!Array.isArray(emailList) || emailList.length === 0) {
      return res.status(400).json(false);
    }

    // fetch gmail credentials
    const data = await Credential.find();
    if (!data || data.length === 0) {
      return res.status(500).json(false);
    }

    const { user, pass } = data[0].toJSON();

    // transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user, // gmail id
        pass: pass  // gmail APP password
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // send mails
    await Promise.all(
      emailList.map(email =>
        transporter.sendMail({
          from: user,
          to: email,
          subject: "A message from BulkMail App",
          text: msg
        })
      )
    );

    console.log("Mails sent successfully...");
    res.json(true);

  } catch (error) {
    console.error("Mail error:", error.message);
    res.json(false);
  }
});

/* -------------------- SERVER -------------------- */
app.listen(4000, () => {
  console.log("Server Started on port 4000...");
});
