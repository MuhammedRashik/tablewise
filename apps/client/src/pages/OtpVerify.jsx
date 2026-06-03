import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone } from "lucide-react";
import { useOtp } from "../hooks/useOtp";
import { useQueue } from "../hooks/useQueue";
import Input from "../components/ui/Input";
import { queueApi } from "../services/queue.api";

export default function OtpVerify() {
  const { restaurantId } = useParams();
  const navigate         = useNavigate();
  const { joinQueue, isJoining } = useQueue(restaurantId);

  const {
    step, phone, setPhone, name, setName,
    countdown, error, setError,
    sendOtp, verifyOtp, resendOtp,
    isSending, isVerifying, isSuccess,
  } = useOtp();

  const [otp, setOtp]   = useState(["", "", "", "", "", ""]);
  const inputRefs       = useRef([]);

 // In the useEffect where pending join is handled

// In the useEffect where pending join is handled
useEffect(() => {
  if (isSuccess) {
    const pending = sessionStorage.getItem("tw-pending-join");
    if (pending) {
      sessionStorage.removeItem("tw-pending-join");
      const { restaurantId: rid, partySize, notes } = JSON.parse(pending);

      // Check available tables after login
      queueApi.getAvailableTables(rid, partySize)
        .then((res) => {
          const available = (res.data?.tables || []).filter(
            (t) => t.status === "available" && t.capacity >= partySize
          );

          if (available.length > 1) {
            // Multiple tables → selection screen
            navigate("/select-table", {
              state: {
                restaurantId: rid,
                partySize,
                notes,
                availableTables: available,
              },
            });
          } else {
            // 0 or 1 table → direct join
            joinQueue({ partySize, notes });
          }
        })
        .catch(() => {
          // Fallback — just join normally
          joinQueue({ partySize, notes });
        });

    } else {
      navigate(`/join/${restaurantId}`);
    }
  }
}, [isSuccess]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (next.every(Boolean) && next.join("").length === 6) verifyOtp(next.join(""));
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split("")); verifyOtp(pasted); }
  };

  return (
    <div className="screen">
      <div className="orb" style={{ width: 350, height: 350, background: "var(--gold)", top: -80, left: -80 }} />

      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", padding: "0 24px" }}>

        {/* Back button */}
        <div style={{ paddingTop: 60, marginBottom: 40 }}>
          {step === "otp" && (
            <button
              onClick={() => navigate(-1)}
              style={{
                width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--glass)", border: "1px solid var(--border)", cursor: "pointer", marginBottom: 28,
              }}
            >
              <ArrowLeft size={17} color="var(--text-2)" />
            </button>
          )}
          <p style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>
            {step === "phone" ? "Get started" : "Verification"}
          </p>
          <h1 style={{ fontSize: 32 }}>
            {step === "phone" ? "Who's joining?" : "Enter code"}
          </h1>
          <p style={{ color: "var(--text-3)", fontSize: 14, marginTop: 8 }}>
            {step === "phone" ? "We'll send a one-time code to your number" : `Sent to +91 ${phone}`}
          </p>
        </div>

        {step === "phone" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
            <Input label="Your name" value={name} onChange={setName} placeholder="e.g. Rahul Kumar" />
            <Input
              label="Mobile number" value={phone}
              onChange={(v) => { setPhone(v); setError(""); }}
              placeholder="10-digit number" type="tel" inputMode="numeric" maxLength={10}
              error={error}
            />
            <div className="mt-auto">
  <button
    onClick={sendOtp}
    disabled={isSending || !name || !phone}
    className="btn-gold"
    style={{ borderRadius: 16 }}
  >
    {isSending ? (
      <>
        <span
          style={{
            width: 18, height: 18,
            border: "2px solid rgba(0,0,0,0.2)",
            borderTopColor: "#0D0D0D",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <span>Sending…</span>
      </>
    ) : (
      <><Smartphone size={16} /> Send OTP</>
    )}
  </button>
</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1, width: "100%",  overflow: "hidden" }}>

            {/* OTP boxes */}
           {/* 6-box OTP input */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)", // ← grid instead of flex
    gap: "8px",
    width: "100%",                          // ← full width of parent
  }}
  onPaste={handlePaste}
>
  {otp.map((digit, i) => (
    <input
      key={i}
      ref={(el) => (inputRefs.current[i] = el)}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={digit}
      onChange={(e) => handleOtpChange(i, e.target.value)}
      onKeyDown={(e) => handleKeyDown(i, e)}
      style={{
        width: "100%",          // ← fills its grid cell
        aspectRatio: "1",       // ← always square regardless of width
        minWidth: 0,            // ← prevents overflow
        textAlign: "center",
        fontSize: "clamp(18px, 5vw, 24px)", // ← scales with screen
        fontWeight: 600,
        background: digit ? "rgba(201,168,76,0.1)" : "var(--glass)",
        border: digit ? "1.5px solid var(--gold)" : "1px solid var(--border)",
        borderRadius: 12,
        color: digit ? "var(--gold)" : "var(--text)",
        outline: "none",
        transition: "all 0.15s",
        fontFamily: "'DM Sans',sans-serif",
      }}
    />
  ))}
</div>

            {error && (
              <div style={{ background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#E24B4A" }}>
                {error}
              </div>
            )}

            <div style={{ textAlign: "center" }}>
              {countdown > 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-3)" }}>
                  Resend in <span style={{ color: "var(--gold)", fontWeight: 500 }}>{countdown}s</span>
                </p>
              ) : (
                <button onClick={resendOtp} style={{ fontSize: 13, color: "var(--gold)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>
                  Resend OTP
                </button>
              )}
            </div>

           <div style={{ marginTop: "auto", paddingBottom: 48 }}>
  <button
    onClick={() => verifyOtp(otp.join(""))}
    disabled={isVerifying || otp.some((d) => !d)}
    className="btn-gold"
    style={{ borderRadius: 16, position: "relative" }}
  >
    {isVerifying ? (
      <>
        {/* Spinner */}
        <span
          style={{
            width: 18, height: 18,
            border: "2px solid rgba(0,0,0,0.2)",
            borderTopColor: "#0D0D0D",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <span>Verifying…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </>
    ) : (
      "Verify & continue"
    )}
  </button>
</div>
          </div>
        )}
      </div>
    </div>
  );
}