const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bowotp@gmail.com",
    pass: process.env.APP_PASS,
  },
  tls: { rejectUnauthorized: false },
});
