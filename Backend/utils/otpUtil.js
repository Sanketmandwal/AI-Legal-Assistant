// src/utils/otpUtil.js
import Otp from "../models/Otp.js";

/**
 * Generate a numeric OTP code of given length
 */
export function generateOtpCode(length = 6) {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

/**
 * Create and store OTP for a user
 */
export async function createAndStoreOtp({
  userId,
  type,          // 'email' | 'phone'
  destination,   // email or phone
  ttlMinutes = 10,
}) {
  const code = generateOtpCode(6);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

  

  // Optional: invalidate previous unused OTPs of same type
  await Otp.updateMany(
    { userId, type, used: false, expiresAt: { $gt: now } },
    { $set: { used: true } }
  );

  const otpDoc = await Otp.create({
    userId,
    type,
    destination,
    code,        // later we can hash this if you want
    expiresAt,
  });

  return { otpDoc, code };
}

/**
 * Verify OTP code
 */
export async function verifyOtp({ userId, type, code }) {
  const now = new Date();

  const otpDoc = await Otp.findOne({
    userId,
    type,
    code,
    used: false,
    expiresAt: { $gt: now },
  }).sort({ createdAt: -1 });

  if (!otpDoc) {
    throw new Error("Invalid or expired OTP");
  }

  otpDoc.used = true;
  await otpDoc.save();

  return otpDoc;
}
