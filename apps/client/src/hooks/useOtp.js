import { useState, useRef, useCallback } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth }          from "../lib/firebase";
import { authApi }       from "../services/auth.api";
import { useAuthStore }  from "../store/authStore";
import { connectSocket } from "../lib/socket";

export const useOtp = () => {
  const [step, setStep]           = useState("phone");
  const [phone, setPhone]         = useState("");
  const [name, setName]           = useState("");
  const [countdown, setCountdown] = useState(0);
  const [error, setError]         = useState("");
  const [isSending, setIsSending]     = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess]     = useState(false);

  const timerRef             = useRef(null);
  const confirmationRef      = useRef(null);
  const recaptchaVerifierRef = useRef(null);

  const setAuth = useAuthStore((s) => s.setAuth);

  // ── Countdown timer ───────────────────────────────────────────────────
  const startCountdown = useCallback((seconds = 60) => {
    setCountdown(seconds);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ── Setup invisible reCAPTCHA ─────────────────────────────────────────
  const setupRecaptcha = useCallback(() => {
    // If already set up — reuse it
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }

    recaptchaVerifierRef.current = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size:     "invisible",
        callback: () => {
          // reCAPTCHA solved — happens silently in background
        },
        "expired-callback": () => {
          // Reset on expiry
          recaptchaVerifierRef.current = null;
        },
      }
    );

    return recaptchaVerifierRef.current;
  }, []);

  // ── Clear reCAPTCHA (on error or resend) ─────────────────────────────
  const clearRecaptcha = useCallback(() => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch {
        // ignore clear errors
      }
      recaptchaVerifierRef.current = null;
    }
  }, []);

  // ── STEP 1: Send OTP ──────────────────────────────────────────────────
  const sendOtp = useCallback(async () => {
    console.log('here 1');
    
    setError("");

    // Validate name
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    console.log('here 2');

    // Validate Indian mobile number
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setError("Enter a valid 10-digit Indian mobile number");
      return;
    }

    setIsSending(true);
    console.log('here 3');

    try {
    console.log('here 4');

      const verifier      = setupRecaptcha();
      const phoneWithCode = `+91${phone.trim()}`;
    console.log('here 5');


      console.log(`[OTP] Sending to ${phoneWithCode}`);

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneWithCode,
        verifier
      );

      // Store for step 2
      confirmationRef.current = confirmationResult;

      setStep("otp");
      setError("");
      startCountdown(60);

      console.log("[OTP] SMS sent successfully");

    } catch (err) {
      console.error("[OTP] Send error:", err.code, err.message);

      // Clear reCAPTCHA so user can retry
      clearRecaptcha();

      // Map Firebase error codes to user-friendly messages
      switch (err.code) {
        case "auth/too-many-requests":
          setError("Too many attempts from this number. Please wait a few minutes and try again.");
          break;
        case "auth/invalid-phone-number":
          setError("Invalid phone number. Please check and try again.");
          break;
        case "auth/quota-exceeded":
          setError("SMS service temporarily unavailable. Please try again later.");
          break;
        case "auth/captcha-check-failed":
          setError("Security check failed. Please refresh the page and try again.");
          break;
        case "auth/network-request-failed":
          setError("No internet connection. Please check your network and try again.");
          break;
        default:
          setError("Failed to send OTP. Please try again.");
      }
    } finally {
      setIsSending(false);
    }
  }, [name, phone, setupRecaptcha, clearRecaptcha, startCountdown]);

  // ── STEP 2: Verify OTP ────────────────────────────────────────────────
  const verifyOtp = useCallback(async (otp) => {
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    if (!confirmationRef.current) {
      setError("Session expired. Please request a new OTP.");
      setStep("phone");
      return;
    }

    setIsVerifying(true);

    try {
      // 1. Verify OTP with Firebase
      console.log("[OTP] Verifying OTP with Firebase...");
      const result = await confirmationRef.current.confirm(otp);

      // 2. Get Firebase ID token
      const firebaseToken = await result.user.getIdToken();
      console.log("[OTP] Firebase verified. Exchanging for app token...");

      // 3. Exchange Firebase token for our JWT
      const res = await authApi.verifyFirebaseToken(firebaseToken, name.trim());

      const { user, accessToken } = res.data;

      // 4. Save auth state + connect socket
      setAuth(user, accessToken);
      connectSocket(accessToken);

      console.log(`[OTP] Login complete: ${user.name}`);
      setIsSuccess(true);

    } catch (err) {
      console.error("[OTP] Verify error:", err.code || err.status, err.message);

      switch (err.code) {
        case "auth/invalid-verification-code":
          setError("Incorrect OTP. Please check and try again.");
          break;
        case "auth/code-expired":
          setError("OTP has expired. Please request a new one.");
          setStep("phone");
          confirmationRef.current = null;
          break;
        case "auth/session-expired":
          setError("Session expired. Please request a new OTP.");
          setStep("phone");
          confirmationRef.current = null;
          break;
        default:
          // Backend error (name required, account deactivated etc)
          setError(err.message || "Verification failed. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  }, [name, setAuth]);

  // ── Resend OTP ────────────────────────────────────────────────────────
  const resendOtp = useCallback(() => {
    if (countdown > 0) return;
    confirmationRef.current = null;
    clearRecaptcha();
    sendOtp();
  }, [countdown, clearRecaptcha, sendOtp]);

  return {
    step,
    phone,        setPhone,
    name,         setName,
    countdown,
    error,        setError,
    sendOtp,
    verifyOtp,
    resendOtp,
    isSending,
    isVerifying,
    isSuccess,
  };
};