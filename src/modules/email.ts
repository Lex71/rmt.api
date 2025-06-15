// https://github.com/BloomTech-Labs/LabsPT1_bkwds/blob/master/server/src/api/modules/email.js
// https://ahrjarrett.com/posts/2019-02-08-resetting-user-passwords-with-node-and-jwt

import { createTransport } from "nodemailer";
// import SMTPTransport from "nodemailer/lib/smtp-transport";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import config from "../config/config";
import { IUser } from "../models/user";

// export const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_LOGIN,
//     pass: process.env.EMAIL_PASSWORD
//   }
// })

export const getPasswordResetURL = (user: IUser, token: string): string =>
  // `http://localhost:3000/password/reset/${user._id}/${token}`;
  `${config.RMT_APP_BASE_URL}/password/reset/${user._id}/${token}`;

export const resetPasswordTemplate = (user: IUser, url: string) => {
  const from = config.SMTP_FROM;
  const to = user.email;
  const subject = "ReserveMyTable Password Reset";
  const html = `
  <p>Hey ${user.name || user.email},</p>
  <p>We heard that you lost your ReserveMyTable password. Sorry about that!</p>
  <p>But don’t worry! You can use the following link to reset your password:</p>
  <a href=${url}>${url}</a>
  <p>If you don’t use this link within 1 hour, it will expire.</p>
  <p>Do something outside today! </p>
  <p>–Your friends at ReserveMyTable</p>
  `;

  return { from, html, subject, to };
};

const configOptions: SMTPTransport.Options = {
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: false, // use SSL
  // tls: {
  //   rejectUnauthorized: false,
  // },
  // url: `smtp://${config.SMTP_HOST}:${config.SMTP_PORT}`,
  // service: 'gmail',
  auth: {
    pass: config.SMTP_PASS,
    user: config.SMTP_USER,
  },
};

// Create a transporter object
export const transporter = createTransport(configOptions);

/* // Configure the mailoptions object
const mailOptions: SMTPTransport.Options = {
  from: "yourusername@email.com",
  subject: "Sending Email using Node.js",
  text: "That was easy!",
  to: "yourfriend@email.com",
};

// Send the email
transporter.sendMail(mailOptions, function (error, info) {
  if (error) {
    console.log("Error:", error);
  } else {
    console.log("Email sent:", info.response);
  }
}); */
