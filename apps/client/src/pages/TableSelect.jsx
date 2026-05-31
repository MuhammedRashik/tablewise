import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, MapPin, CheckCircle } from "lucide-react";
import { useQueueStore } from "../store/queueStore";
import { useAuthStore } from "../store/authStore";
import { queueApi } from "../services/queue.api";
import { getSocket } from "../lib/socket";
import Spinner from "../components/ui/Spinner";

export default function TableSelect() {
  const navigate        = useNavigate();
  const location        = useLocation();
  const { setEntry, setTableNumber } = useQueueStore();
  const user            = useAuthStore((s) => s.user);

  // Data passed from Welcome page via navigation state
  const {
    restaurantId,
    partySize,
    notes,
    availableTables: initialTables,
    conflictMessage,  // shown when redirected here after a conflict
  } = location.state || {};

  const [tables, setTables]         = useState(initialTables || []);
  const [selected, setSelected]     = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError]           = useState(conflictMessage || "");
  const [isLoading, setIsLoading]   = useState(!initialTables);

  // If no tables passed in state, fetch them
  useEffect(() => {
    if (!restaurantId || initialTables) return;

    const fetchTables = async () => {
      try {
        const res = await queueApi.getAvailableTables(restaurantId, partySize);
        setTables(res.data.tables || []);
      } catch (err) {
        setError("Could not load tables. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTables();
  }, [restaurantId]);

  // If no tables at all → redirect to queue status
  useEffect(() => {
    if (!isLoading && tables.length === 0 && !conflictMessage) {
      navigate("/queue-status");
    }
  }, [tables, isLoading]);

  const handleConfirm = async () => {
    if (!selected) return;
    setIsConfirming(true);
    setError("");

    try {
      const res = await queueApi.selectTable(
        restaurantId,
        selected._id,
        partySize,
        notes
      );

      const { outcome, entry, assignedTable, availableTables, message } = res.data;

      if (outcome === "success") {
        // Got the chosen table
        setEntry(entry, assignedTable.tableNumber);

        const socket = getSocket();
        socket.emit("join-restaurant-room", { restaurantId });

        navigate("/table-ready");

      } else if (outcome === "conflict") {
        // Table taken — show remaining options with message
        setTables(availableTables);
        setSelected(null);
        setError(message);

      } else if (outcome === "waitlisted") {
        // All tables gone — go to queue status
        setEntry(entry, null);

        const socket = getSocket();
        socket.emit("join-restaurant-room", { restaurantId });

        navigate("/queue-status", {
          state: { message }
        });
      }

    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="screen" style={{ alignItems:"center", justifyContent:"center" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="screen">
      {/* Ambient orb */}
      <div className="orb" style={{ width:400, height:400, background:"var(--gold)", top:-100, right:-150 }} />

      <div style={{ position:"relative", flex:1, display:"flex", flexDirection:"column", padding:"60px 24px 0" }}>

        {/* Header */}
        <div className="anim-fade-up" style={{ marginBottom: 32 }}>
          <p style={{ fontSize:12, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--gold)", marginBottom:8 }}>
            Choose your table
          </p>
          <h1 style={{ fontSize:28, lineHeight:1.1, marginBottom:8 }}>
            {tables.length} {tables.length === 1 ? "table" : "tables"} available
          </h1>
          <div style={{ display:"flex", alignItems:"center", gap:6, color:"var(--text-3)", fontSize:13 }}>
            <Users size={13} />
            <span>Party of {partySize}</span>
          </div>
        </div>

        {/* Conflict / error message */}
        {error && (
          <div
            className="anim-fade-in"
            style={{
              background:"rgba(226,75,74,0.1)",
              border:"1px solid rgba(226,75,74,0.2)",
              borderRadius:12, padding:"12px 16px",
              fontSize:13, color:"#E24B4A",
              marginBottom:20,
            }}
          >
            {error}
          </div>
        )}

        {/* Table cards */}
        <div
          className="anim-fade-up delay-1"
          style={{ display:"flex", flexDirection:"column", gap:12, flex:1 }}
        >
          {tables.map((table) => {
            const isSelected = selected?._id === table._id;
            return (
              <button
                key={table._id}
                onClick={() => setSelected(table)}
                style={{
                  display:"flex", alignItems:"center", gap:16,
                  padding:"18px 20px", borderRadius:16, cursor:"pointer",
                  background: isSelected ? "rgba(201,168,76,0.1)" : "var(--glass)",
                  border: isSelected ? "1.5px solid var(--gold)" : "1px solid var(--border)",
                  transition:"all 0.15s", textAlign:"left",
                }}
              >
                {/* Table number */}
                <div style={{
                  width:56, height:56, borderRadius:14, flexShrink:0,
                  background: isSelected ? "rgba(201,168,76,0.15)" : "var(--bg3)",
                  border: isSelected ? "1.5px solid var(--gold)" : "1px solid var(--border)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <span style={{
                    fontSize:18, fontWeight:600,
                    fontFamily:"'Playfair Display',serif",
                    color: isSelected ? "var(--gold)" : "var(--text)",
                  }}>
                    {table.tableNumber}
                  </span>
                </div>

                {/* Info */}
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:15, fontWeight:500, color:"var(--text)", marginBottom:4 }}>
                    Table {table.tableNumber}
                  </p>
                  <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:4, color:"var(--text-3)", fontSize:12 }}>
                      <Users size={11} />
                      <span>{table.capacity} seats</span>
                    </div>
                    {table.location && (
                      <div style={{ display:"flex", alignItems:"center", gap:4, color:"var(--text-3)", fontSize:12 }}>
                        <MapPin size={11} />
                        <span>{table.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected check */}
                {isSelected && (
                  <CheckCircle size={22} color="var(--gold)" style={{ flexShrink:0 }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirm button */}
      <div
        className="anim-fade-up delay-2"
        style={{ padding:"16px 24px 48px" }}
      >
        <button
          onClick={handleConfirm}
          disabled={!selected || isConfirming}
          className="btn-gold"
          style={{ borderRadius:16 }}
        >
          {isConfirming ? (
            <>
              <span
                style={{
                  width:18, height:18,
                  border:"2px solid rgba(0,0,0,0.2)",
                  borderTopColor:"#0D0D0D",
                  borderRadius:"50%",
                  display:"inline-block",
                  animation:"spin 0.7s linear infinite",
                }}
              />
              <span>Confirming…</span>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </>
          ) : selected ? (
            `Confirm Table ${selected.tableNumber}`
          ) : (
            "Select a table to continue"
          )}
        </button>
        <button
          onClick={() => navigate(`/join/${restaurantId}`)}
          style={{
            width:"100%", marginTop:12, padding:"10px",
            background:"none", border:"none", cursor:"pointer",
            fontSize:13, color:"var(--text-3)",
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}