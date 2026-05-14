import { useEffect, useState } from "react";
import { useKitchenStore } from "./store/kitchenStore";
import { connectSocket, getSocket } from "./lib/socket";
import KitchenLogin from "./pages/KitchenLogin";
import KOTBoard     from "./pages/KOTBoard";

export default function App() {
  const { isLoggedIn, token } = useKitchenStore();
  // Track whether socket setup is done so we don't render KOTBoard
  // before the socket is ready — this was causing the reconnecting flicker
  const [socketReady, setSocketReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn() || !token) {
      setSocketReady(true); // no socket needed — show login
      return;
    }

    // Always create a fresh socket on every page load
    // This is the critical fix — never reuse a socket from before refresh
    const socket = connectSocket(token);

    // Wait for the connect event before rendering the board
    // This prevents the "Reconnecting..." flash
    const onConnect = () => {
      setSocketReady(true);
    };

    const onConnectError = (err) => {
      console.error("[Kitchen] Connect error on startup:", err.message);
      // Still set ready so we show the board (it will show reconnecting state)
      setSocketReady(true);
    };

    socket.once("connect",       onConnect);
    socket.once("connect_error", onConnectError);

    // Safety fallback — if neither fires within 5s, proceed anyway
    const fallback = setTimeout(() => setSocketReady(true), 5000);

    return () => {
      clearTimeout(fallback);
      socket.off("connect",       onConnect);
      socket.off("connect_error", onConnectError);
    };
  }, []); // empty deps — runs exactly once on mount

  // Show nothing while socket is initialising
  // This prevents the brief "Reconnecting..." flash on refresh
  if (!socketReady) {
    return (
      <div style={{
        height: "100vh",
        background: "#111827",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}>
        <div style={{
          width: 20, height: 20,
          border: "2px solid rgba(29,158,117,0.3)",
          borderTopColor: "#1D9E75",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <span style={{ color: "#4B5563", fontSize: 13 }}>Connecting…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return isLoggedIn() ? <KOTBoard /> : <KitchenLogin />;
}