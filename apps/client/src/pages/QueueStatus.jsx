import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Wifi } from "lucide-react";
import { useQueueStore } from "../store/queueStore";
import { useAuthStore } from "../store/authStore";
import { useQueue } from "../hooks/useQueue";

export default function QueueStatus() {
  const navigate = useNavigate();
  const { entry, position, ewt, status } = useQueueStore();
  const user = useAuthStore((s) => s.user);
  const { leaveQueue, isLeaving } = useQueue(entry?.restaurantId);

  useEffect(() => { if (!entry) navigate("/"); }, [entry]);
  useEffect(() => {
    if (status === "called") navigate("/table-ready");
    if (status === "seated") navigate("/menu");
    if (status === "bumped" || status === "left") navigate("/");
  }, [status]);

  if (!entry) return null;

  const displayEwt = ewt > 0
    ? (ewt >= 60 ? `${Math.floor(ewt/60)}h ${ewt%60}m` : `~${ewt} min`)
    : null;

  return (
    <div className="screen" style={{ justifyContent: "space-between" }}>
      {/* Background orbs */}
      <div className="orb" style={{ width: 500, height: 500, background: "var(--gold)", top: -200, right: -200 }} />
      <div className="orb" style={{ width: 300, height: 300, background: "var(--green)", bottom: -50, left: -100 }} />

      {/* Top bar */}
      <div style={{ position: "relative", padding: "56px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>Waiting at</p>
          <h2 style={{ fontSize: 20 }}>{entry.restaurantId?.name || "Restaurant"}</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--glass)", border: "1px solid var(--border)", borderRadius: 30, padding: "6px 12px" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", animation: "pulse-soft 2s infinite" }} />
          <Wifi size={12} color="var(--text-3)" />
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>live</span>
        </div>
      </div>

      {/* Position hero */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px" }}>
        <p style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 16 }}>
          Your position
        </p>
        <div style={{ position: "relative", width: 180, height: 180, marginBottom: 20 }}>
          {/* Glow ring */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "1.5px solid rgba(201,168,76,0.3)",
            boxShadow: "0 0 40px rgba(201,168,76,0.15)",
          }} />
          <div style={{
            position: "absolute", inset: 12, borderRadius: "50%",
            border: "1px solid rgba(201,168,76,0.15)",
          }} />
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}>
            <span className="gold-shimmer" style={{ fontSize: 72, fontFamily: "'Playfair Display',serif", lineHeight: 1 }}>
              {position ?? "—"}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          {displayEwt && (
            <div className="glass" style={{ flex: 1, padding: "16px", textAlign: "center" }}>
              <p style={{ fontSize: 20, fontWeight: 500, color: "var(--gold)" }}>{displayEwt}</p>
              <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>est. wait</p>
            </div>
          )}
          <div className="glass" style={{ flex: 1, padding: "16px", textAlign: "center" }}>
            <p style={{ fontSize: 20, fontWeight: 500 }}>{entry.partySize}</p>
            <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>party</p>
          </div>
          <div className="glass" style={{ flex: 1, padding: "16px", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", animation: "pulse-soft 2s infinite" }} />
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--green)", textTransform: "capitalize" }}>{status}</p>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>status</p>
          </div>
        </div>
      </div>

      {/* Notes card */}
      {entry.notes && (
        <div style={{ position: "relative", margin: "0 24px" }} className="glass">
          <div style={{ padding: "14px 18px" }}>
            <p style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Your note</p>
            <p style={{ fontSize: 14, color: "var(--text-2)" }}>{entry.notes}</p>
          </div>
        </div>
      )}

      {/* Bottom action */}
      <div style={{ position: "relative", padding: "24px 24px 48px" }}>
        <button
          onClick={() => { if (window.confirm("Leave the queue?")) leaveQueue(); }}
          disabled={isLeaving}
          className="btn-ghost"
          style={{ borderRadius: 16, borderColor: "rgba(226,75,74,0.3)", color: "#E24B4A" }}
        >
          {isLeaving
            ? <span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(226,75,74,0.3)", borderTopColor: "#E24B4A" }} />
            : <><LogOut size={15} /> Leave queue</>
          }
        </button>
      </div>
    </div>
  );
}