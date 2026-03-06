// src/services/emailService.js
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
  NODE_ENV,
} = process.env;



// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: 465,
  auth: {
    user: process.env.EMAIL_USER || "sanketmandwal2@gmail.com",
    pass: process.env.EMAIL_PASS || "uaqboujotwxdmymk"
  }
});

/**
 * Generic send email helper
 */
export async function sendEmail({ to, subject, html, text }) {
  if (!to) throw new Error("Recipient email is required");

  const mailOptions = {
    from: EMAIL_FROM || `"LexiAI" <no-reply@lexiai.com>`,
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);

  if (NODE_ENV !== "production") {
    console.log("📧 Email sent:", info.messageId);
  }

  return info;
}

/**
 * Send email verification OTP
 */
export async function sendEmailVerificationOtp({ email, name, otp }) {
  const subject = "LexiAI - Email Verification Code";

  const text = `Hi ${name || ""},

Your email verification code is: ${otp}

This code will expire in 10 minutes.

If you did not request this, please ignore this email.

– LexiAI Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Hi ${name || ""},</h2>
      <p>Your email verification code is:</p>
      <div style="
        font-size: 24px;
        font-weight: bold;
        letter-spacing: 4px;
        padding: 12px 16px;
        display: inline-block;
        border-radius: 8px;
        background: #f4f4f4;
        margin: 8px 0;
      ">
        ${otp}
      </div>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p style="margin-top: 24px;">– LexiAI Team</p>
    </div>
  `;


  return sendEmail({ to: email, subject, text, html });
}

/**
 * Optional: send welcome email
 */
export async function sendWelcomeEmail({ email, name }) {
  const subject = "Welcome to LexiAI";

  const text = `Hi ${name || ""},

Welcome to LexiAI! Your account has been created successfully.

You can now file FIRs, consult lawyers, and track case updates from your dashboard.

– LexiAI Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Welcome to LexiAI, ${name || ""} 🎉</h2>
      <p>Your account has been created successfully.</p>
      <p>You can now:</p>
      <ul>
        <li>File smart FIRs with AI assistance</li>
        <li>Consult verified lawyers</li>
        <li>Track your complaints and case progress</li>
      </ul>
      <p style="margin-top: 24px;">– LexiAI Team</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
}
