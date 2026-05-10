import { useState, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../services/auth.api";
import { useAuthStore } from "../store/authStore";
import { connectSocket } from "../lib/socket";

export const useOtp = () => {
  const [step, setStep]           = useState("phone"); // "phone" | "otp"
  const [phone, setPhone]         = useState("");
  const [name, setName]           = useState("");
  const [countdown, setCountdown] = useState(0);
  const [error, setError]         = useState("");
  const timerRef = useRef(null);
  const setAuth  = useAuthStore((s) => s.setAuth);

  // ── Start countdown timer ─────────────────────────────────────────────
  const startCountdown = useCallback((seconds = 120) => {
    setCountdown(seconds);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ── Send OTP mutation ─────────────────────────────────────────────────
  const sendOtpMutation = useMutation({
    mutationFn: () => authApi.sendOtp(name.trim(), phone.trim()),
    onSuccess: () => {
      setStep("otp");
      setError("");
      startCountdown(120);
    },
    onError: (err) => setError(err.message),
  });

  // ── Verify OTP mutation ───────────────────────────────────────────────
  const verifyOtpMutation = useMutation({
    mutationFn: (otp) => authApi.verifyOtp(phone.trim(), otp, name.trim()),
    onSuccess: (res) => {
      const { user, accessToken } = res.data;
      setAuth(user, accessToken);
      // Connect socket immediately after auth
      connectSocket(accessToken);
    },
    onError: (err) => setError(err.message),
  });

  const sendOtp = useCallback(() => {
    setError("");
    if (!name.trim()) { setError("Please enter your name"); return; }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setError("Enter a valid 10-digit mobile number"); return;
    }
    sendOtpMutation.mutate();
  }, [name, phone, sendOtpMutation]);

  const verifyOtp = useCallback((otp) => {
    setError("");
    if (otp.length !== 6) { setError("Enter the 6-digit OTP"); return; }
    verifyOtpMutation.mutate(otp);
  }, [verifyOtpMutation]);

  const resendOtp = useCallback(() => {
    if (countdown > 0) return;
    sendOtpMutation.mutate();
  }, [countdown, sendOtpMutation]);

  return {
    step, phone, setPhone, name, setName,
    countdown, error, setError,
    sendOtp,
    verifyOtp,
    resendOtp,
    isSending:   sendOtpMutation.isPending,
    isVerifying: verifyOtpMutation.isPending,
    isSuccess:   verifyOtpMutation.isSuccess,
  };
};