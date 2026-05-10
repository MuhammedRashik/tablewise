import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQueueStore } from "../store/queueStore";

export default function TableReady() {
  const navigate = useNavigate();
  const { entry, assignedTableNumber } = useQueueStore();

  useEffect(() => { if (!entry) navigate("/"); }, [entry]);

  const tableNumber = assignedTableNumber || "—";

  return (
    <div className="screen" style={{ alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
      {/* Ambient */}
      <div className="orb" style={{ width: 500, height: 500, background: "var(--gold)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />

      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: "100%", maxWidth: 360 }}>

        {/* Animated ring */}
        <div style={{ position: "relative", width: 140, height: 140, marginBottom: 32 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid rgba(201,168,76,0.4)", animation: "pulse-soft 2s ease-in-out infinite" }} />
          <div style={{ position: "absolute", inset: 14, borderRadius: "50%", background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52 }}>
            🎉
          </div>
        </div>

        <p className="anim-fade-up" style={{ fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10 }}>
          Table assigned
        </p>
        <h1 className="anim-fade-up delay-1" style={{ fontSize: 36, marginBottom: 8 }}>
          You're ready!
        </h1>
        <p className="anim-fade-up delay-2" style={{ color: "var(--text-3)", fontSize: 14, marginBottom: 40 }}>
          Please proceed to the host counter
        </p>

        {/* Table number card */}
        <div
          className="glass-strong anim-scale-in delay-2"
          style={{ width: "100%", padding: "32px 24px", marginBottom: 16, textAlign: "center" }}
        >
          <p style={{ fontSize: 12, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Table number
          </p>
          <p className="gold-shimmer" style={{ fontSize: 56, fontFamily: "'Playfair Display',serif", lineHeight: 1 }}>
            {tableNumber}
          </p>
        </div>

        {/* WhatsApp note */}
        <div
          className="anim-fade-up delay-3"
          style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            background: "rgba(29,158,117,0.1)", border: "1px solid rgba(29,158,117,0.2)",
            borderRadius: 12, padding: "12px 16px", marginBottom: 32,
          }}
        >
          <span style={{ fontSize: 18 }}>💬</span>
          <p style={{ fontSize: 13, color: "var(--green)" }}>Confirmation sent to your WhatsApp</p>
        </div>

        {/* CTAs */}
        <div className="anim-fade-up delay-4" style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => navigate("/menu")} className="btn-gold pl-10 pr-10" style={{ borderRadius: 16 }}>
            View menu & order <ArrowRight size={16} style={{ marginLeft: "auto" }} />
          </button>
          <button onClick={() => navigate("/")} style={{ fontSize: 13, color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: "8px" }}>
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}