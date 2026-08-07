import { log } from "console";
import crypto from "crypto";
import axios from "axios";

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
  await redisClient.setEx(key, OTP_EXPIRY_SECONDS, otp);
};

// 🔹 Verify OTP
export const verifyOtp = async (redisClient, phone, candidateOtp) => {
  const key      = getOtpKey(phone);
  const storedOtp = await redisClient.get(key);

  if (!storedOtp) {
    return { valid: false, reason: "OTP expired or not found" };
  }

  if (storedOtp !== candidateOtp) {
    return { valid: false, reason: "Incorrect OTP" };
  }

  // Delete after successful verification — one time use
  await redisClient.del(key);
  return { valid: true };
};

// 🔹 Send OTP (for now console)
export const sendOtp = async (phone, otp) => {
  // In development without API key — fall back to console log
  if (!process.env.FAST2SMS_API_KEY) {
    console.log(`[OTP] Phone: ${phone} | OTP: ${otp}`);
    return;
  }

  try {
    const response = await axios.post(
  "https://www.fast2sms.com/dev/otp/send",
  {
    mobile: phone,
    otp_id: process.env.FAST2SMS_OTP_ID,
    otp: otp,
  },
  {
    headers: {
      authorization: process.env.FAST2SMS_API_KEY,
      "Content-Type": "application/json",
    },
    timeout: 10000,
  }
);

    if (response.data?.return === true) {
      console.log(`[OTP] SMS sent successfully to ${phone}`);
    } else {
      // SMS failed but don't crash the request
      // Fall back to console so you can still test
      console.error(`[OTP] Fast2SMS failed:`, response.data?.message);
      console.log(`[OTP] Fallback — Phone: ${phone} | OTP: ${otp}`);
    }

  } catch (err) {
    // Network error or Fast2SMS down — fall back to console
    console.error(`[OTP] Fast2SMS error: ${err.message}`);
    console.error(err.response?.data);
  console.error(err.message);
    console.log(`[OTP] Fallback — Phone: ${phone} | OTP: ${otp}`);
  }
};



// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBc97u6qWS5GFwkkY0wYzhPcfE8_UkPuTM",
//   authDomain: "tablewise-cfc66.firebaseapp.com",
//   projectId: "tablewise-cfc66",
//   storageBucket: "tablewise-cfc66.firebasestorage.app",
//   messagingSenderId: "174997123644",
//   appId: "1:174997123644:web:9dbfc2feb453d924c9c939"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);