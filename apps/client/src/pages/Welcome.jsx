import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, ArrowRight, MapPin, Utensils } from "lucide-react";
import { useRestaurant } from "../hooks/useRestaurant";
import { useQueue } from "../hooks/useQueue";
import { useAuthStore } from "../store/authStore";
import { useQueueStore } from "../store/queueStore";
import Spinner from "../components/ui/Spinner";

const SIZES = [1, 2, 3, 4, 5, 6];

export default function Welcome() {
  const { restaurantId } = useParams();
  const navigate         = useNavigate();
  const isLoggedIn       = useAuthStore((s) => s.isLoggedIn());
  const activeEntry      = useQueueStore((s) => s.entry);
  const { data: restaurant, isLoading, error } = useRestaurant(restaurantId);
  const { joinQueue, isJoining, joinError }     = useQueue(restaurantId);

  const [partySize, setPartySize] = useState(2);
  const [notes, setNotes]         = useState("");
  const [checkingTables, setCheckingTables] = useState(false);

  useEffect(() => {
    if (activeEntry && activeEntry.restaurantId === restaurantId) {
      if (["called", "seated"].includes(activeEntry.status)) navigate("/table-ready");
      else if (["waiting", "confirmed"].includes(activeEntry.status)) navigate("/queue-status");
    }
  }, [activeEntry, restaurantId]);

  if (isLoading) {
    return (
      <div className="screen" style={{ alignItems: "center", justifyContent: "center" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="screen" style={{ alignItems: "center", justifyContent: "center", padding: "0 32px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🍽</div>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>Restaurant not found</h2>
        <p style={{ color: "var(--text-3)", fontSize: 14 }}>Please scan the QR code again</p>
      </div>
    );
  }

  if (!restaurant.settings.isQueueOpen) {
    return (
      <div className="screen" style={{ alignItems: "center", justifyContent: "center", padding: "0 32px", textAlign: "center" }}>
        <div className="orb" style={{ width: 300, height: 300, background: "var(--gold)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
          <h2 style={{ fontSize: 26, marginBottom: 10 }}>{restaurant.name}</h2>
          <p style={{ color: "var(--text-2)", fontSize: 15 }}>Queue is currently closed</p>
          <p style={{ color: "var(--text-3)", fontSize: 13, marginTop: 6 }}>Please check with the restaurant staff</p>
        </div>
      </div>
    );
  }

 const handleJoin = async () => {
  // Not logged in → save pending join and go to OTP
  if (!isLoggedIn) {
    sessionStorage.setItem("tw-pending-join", JSON.stringify({
      restaurantId, partySize, notes
    }));
    navigate(`/auth/${restaurantId}`);
    return;
  }

  // Logged in → check available tables
  setCheckingTables(true);
  try {
    const res = await queueApi.getAvailableTables(restaurantId, partySize);
    const available = (res.data?.tables || []).filter(
      (t) => t.status === "available" && t.capacity >= partySize
    );

    if (available.length > 1) {
      // Multiple tables → let customer choose
      navigate("/select-table", {
        state: {
          restaurantId,
          partySize,
          notes,
          availableTables: available,
        },
      });
    } else {
      // 0 or 1 table → join directly (direct assign or waitlist)
      joinQueue({ partySize, notes });
    }
  } catch {
    // If check fails for any reason → fall back to normal join
    joinQueue({ partySize, notes });
  } finally {
    setCheckingTables(false);
  }
};

  return (
    <div className="screen">
      {/* Ambient orbs */}
      <div className="orb" style={{ width: 400, height: 400, background: "var(--gold)", top: -100, right: -150 }} />
      <div className="orb" style={{ width: 300, height: 300, background: "var(--green)", bottom: 50, left: -100 }} />

      {/* Hero section */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "60px 24px 0" }}>

        {/* Restaurant tag */}
        <div className="anim-fade-up" style={{ marginBottom: 12 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--glass)", border: "1px solid var(--border)",
            borderRadius: 30, padding: "6px 14px",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", animation: "pulse-soft 2s infinite" }} />
            <span style={{ fontSize: 12, color: "var(--text-2)" }}>Queue open</span>
          </div>
        </div>

        {/* Restaurant name */}
        <h1 className="anim-fade-up delay-1" style={{ fontSize: "clamp(32px,8vw,48px)", marginBottom: 8, lineHeight: 1.1 }}>
          {restaurant.name}
        </h1>

        {/* Meta */}
        <div className="anim-fade-up delay-2" style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 36 }}>
          {restaurant.address?.city && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-3)", fontSize: 13 }}>
              <MapPin size={13} />
              <span>{restaurant.address.city}</span>
            </div>
          )}
          {restaurant.cuisine && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-3)", fontSize: 13 }}>
              <Utensils size={13} />
              <span>{restaurant.cuisine}</span>
            </div>
          )}
        </div>

        {/* Party size section */}
        <div className="anim-fade-up delay-2" style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 14 }}>
            Party size
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setPartySize(s)}
                style={{
                  height: 48, borderRadius: 12, fontSize: 15, fontWeight: 500,
                  border: partySize === s ? "1.5px solid var(--gold)" : "1px solid var(--border)",
                  background: partySize === s ? "rgba(201,168,76,0.12)" : "var(--glass)",
                  color: partySize === s ? "var(--gold)" : "var(--text-2)",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={() => { const v = parseInt(prompt("Enter party size (1-20)") || "0"); if (v > 0 && v <= 20) setPartySize(v); }}
            style={{ marginTop: 10, fontSize: 12, color: "var(--gold)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
          >
            More than 6?
          </button>
        </div>

        {/* Notes */}
        <div className="anim-fade-up delay-3" style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 10 }}>
            Special requests
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Window seat, wheelchair access, high chair…"
            rows={2}
            style={{
              width: "100%", padding: "14px 18px", borderRadius: 12,
              background: "var(--glass)", border: "1px solid var(--border)",
              color: "var(--text)", fontSize: 14, resize: "none", outline: "none",
              fontFamily: "'DM Sans',sans-serif",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--gold)"}
            onBlur={(e) => e.target.style.borderColor = "var(--border)"}
          />
        </div>

        {joinError && (
          <div className="anim-fade-in" style={{ background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.25)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#E24B4A", marginBottom: 16 }}>
            {joinError}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="anim-fade-up delay-4" style={{ padding: "0 24px 48px" }}>
        <button
  onClick={handleJoin}
  disabled={isJoining || checkingTables}
  className="btn-gold pl-10 pr-10"
  style={{ borderRadius: 16 }}
>
  {(isJoining || checkingTables) ? (
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
      <span>Checking tables…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  ) : (
    <>
      <Users size={17} />
      Join queue · {partySize} {partySize === 1 ? "person" : "people"}
      <ArrowRight size={17} style={{ marginLeft: "auto" }} />
    </>
  )}
</button>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-3)", marginTop: 12 }}>
          You'll verify your number in the next step
        </p>
      </div>
    </div>
  );
}