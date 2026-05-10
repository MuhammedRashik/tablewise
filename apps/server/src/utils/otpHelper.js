import { log } from "console";
import crypto from "crypto";

// simple constant (instead of TS import)
const OTP_EXPIRY_SECONDS = 300; // 5 minutes

// 🔹 Generate OTP
export const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// 🔹 Redis key
const getOtpKey = (phone) => `otp:${phone}`;

// 🔹 Store OTP
export const storeOtp = async (redisClient, phone, otp) => {
  const key = getOtpKey(phone);
  console.log(key, OTP_EXPIRY_SECONDS, otp,"key, OTP_EXPIRY_SECONDS, otp");
  
  await redisClient.setEx(key, OTP_EXPIRY_SECONDS, otp);
};

// 🔹 Verify OTP
export const verifyOtp = async (redisClient, phone, candidateOtp) => {
  const key = getOtpKey(phone);
  console.log(key,'key');
  
  const storedOtp = await redisClient.get(key);
console.log(storedOtp,'stored otp');


  if (!storedOtp) {
    return { valid: false, reason: "OTP expired or not found" };
  }

  if (storedOtp !== candidateOtp) {
    return { valid: false, reason: "Incorrect OTP" };
  }

  await redisClient.del(key);

  return { valid: true };
};

// 🔹 Send OTP (for now console)
export const sendOtp = async (phone, otp) => {
  console.log(`[OTP] Phone: ${phone} | OTP: ${otp}`);
};
