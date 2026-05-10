import { useEffect, useRef } from "react";
import { getSocket, connectSocket } from "../lib/socket";
import { useKitchenStore } from "../store/kitchenStore";
import { orderApi } from "../services/order.api";

export const useKitchenSocket = () => {
  const {
    token, restaurantId,
    setOrders, addOrder, updateOrderStatus,
    setConnected, clearNewFlag,
  } = useKitchenStore();

  const loadedRef = useRef(false);

  // ── Initial data load ───────────────────────────────────────────────────
  const loadOrders = async () => {
    if (!restaurantId) return;
    try {
      const res = await orderApi.getActive(restaurantId);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("[Kitchen] Failed to load orders:", err.message);
    }
  };

  // ── Socket setup ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token || !restaurantId) return;

    let socket = getSocket();

    // Reconnect if needed (e.g. page refresh)
    if (!socket || !socket.connected) {
      socket = connectSocket(token);
    }

    const onConnect = () => {
      setConnected(true);
      console.log("[Kitchen] Socket connected");

      // Join rooms
      socket.emit("join-kitchen-room",     { restaurantId });
      socket.emit("join-restaurant-room",  { restaurantId });

      // Request current active orders via socket
      socket.emit("get-active-orders", { restaurantId }, (res) => {
        if (res?.success && res.orders?.length > 0) {
          setOrders(res.orders);
          loadedRef.current = true;
        }
      });

      // Fallback: load via REST if socket callback didn't fire
      if (!loadedRef.current) {
        setTimeout(() => {
          if (!loadedRef.current) loadOrders();
        }, 2000);
      }
    };

    const onDisconnect = (reason) => {
      setConnected(false);
      console.log("[Kitchen] Socket disconnected:", reason);
    };

    // ── Order events ──────────────────────────────────────────────────────
    const onNewOrder = ({ order }) => {
      addOrder(order);
      // Clear the "new" flash after 3 seconds
      setTimeout(() => clearNewFlag(order._id), 3000);
      // Play a sound alert
      playAlert();
    };

    const onOrderUpdated = ({ orderId, status }) => {
      updateOrderStatus(orderId, status);
    };

    socket.on("connect",       onConnect);
    socket.on("disconnect",    onDisconnect);
    socket.on("new-order",     onNewOrder);
    socket.on("order-updated", onOrderUpdated);

    // If already connected, run onConnect immediately
    if (socket.connected) onConnect();

    return () => {
      socket.off("connect",       onConnect);
      socket.off("disconnect",    onDisconnect);
      socket.off("new-order",     onNewOrder);
      socket.off("order-updated", onOrderUpdated);
    };
  }, [token, restaurantId]);
};

// ── Audio alert ─────────────────────────────────────────────────────────────
// Simple Web Audio API beep — no external file needed
const playAlert = () => {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type      = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // AudioContext blocked before user interaction — ignore silently
  }
};