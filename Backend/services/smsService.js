// src/services/smsService.js
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER,
  NODE_ENV,
} = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
  console.warn(
    "[Twilio] Missing TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER env vars"
  );
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/**
 * Generic SMS sender using Twilio
 */
export async function sendSms({ phone, message }) {
  if (!phone) throw new Error("Phone number is required");
  if (!message) throw new Error("Message content is required");

  // Ensure phone is in E.164 format: +91XXXXXXXXXX
  let to = phone.trim();
  if (!to.startsWith("+")) {
    // assume Indian numbers if not prefixed
    if (to.length === 10) {
      to = `+91${to}`;
    } else {
      throw new Error("Phone must be in E.164 format or 10-digit Indian number");
    }
  }

  const res = await client.messages.create({
    from: TWILIO_FROM_NUMBER, // e.g. '+12025551234'
    to,
    body: message,
  });

  if (NODE_ENV !== "production") {
    console.log("📲 Twilio SMS sent:", {
      sid: res.sid,
      to: res.to,
      status: res.status,
    });
  }

  return res;
}

/**
 * Helper to send phone verification OTP
 */
export async function sendPhoneVerificationOtp({ phone, otp }) {
  const message = `Your LexiAI verification code is ${otp}. Do not share this code with anyone.`;

  return sendSms({ phone, message });
}
