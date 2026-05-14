import { useEffect, useRef } from "react";
import { getSocket } from "../lib/socket";
import { useKitchenStore } from "../store/kitchenStore";
import { orderApi } from "../services/order.api";

export const useKitchenSocket = () => {
  const {
    token, restaurantId,
    setOrders, addOrder, updateOrderStatus,
    setConnected, clearNewFlag,
  } = useKitchenStore();

  const loadedRef = useRef(false);

  const loadOrdersViaRest = async () => {
    if (!restaurantId || loadedRef.current) return;
    try {
      const res = await orderApi.getActive(restaurantId);
      setOrders(res.data.orders || []);
      loadedRef.current = true;
    } catch (err) {
      console.error("[Kitchen] REST fallback failed:", err.message);
    }
  };

  const joinRooms = (socket) => {
    socket.emit("join-kitchen-room",    { restaurantId }, (ack) => {
      if (ack?.success) console.log("[Kitchen] Joined kitchen room");
    });
    socket.emit("join-restaurant-room", { restaurantId }, (ack) => {
      if (ack?.success) console.log("[Kitchen] Joined restaurant room");
    });
  };

  const loadOrdersViaSocket = (socket) => {
    socket.emit("get-active-orders", { restaurantId }, (res) => {
      if (res?.success && Array.isArray(res.orders)) {
        setOrders(res.orders);
        loadedRef.current = true;
      } else {
        // Socket callback returned nothing useful — use REST
        loadOrdersViaRest();
      }
    });

    // Fallback if callback never fires (e.g. server doesn't ack)
    setTimeout(() => {
      if (!loadedRef.current) loadOrdersViaRest();
    }, 3000);
  };

  useEffect(() => {
    if (!token || !restaurantId) return;

    // By the time this hook runs, App.jsx has already called connectSocket
    // and waited for the connect event. So getSocket() is guaranteed to
    // return a connected socket here.
    const socket = getSocket();
    if (!socket) {
      console.error("[Kitchen] Socket not found — was connectSocket called?");
      loadOrdersViaRest();
      return;
    }

    // ── If already connected (normal case after App.jsx setup) ─────────
    if (socket.connected) {
      setConnected(true);
      joinRooms(socket);
      loadOrdersViaSocket(socket);
    }

    // ── Handlers ───────────────────────────────────────────────────────

    // connect fires if we weren't connected yet when this hook ran
    const onConnect = () => {
      setConnected(true);
      joinRooms(socket);
      if (!loadedRef.current) loadOrdersViaSocket(socket);
    };

    const onDisconnect = (reason) => {
      setConnected(false);
      loadedRef.current = false; // reset so we reload on next connect
      console.log("[Kitchen] Disconnected:", reason);
    };

    // Socket.IO v4 uses 'reconnect' event on the socket manager
    const onReconnect = (attemptNumber) => {
      console.log(`[Kitchen] Reconnected after ${attemptNumber} attempt(s)`);
      setConnected(true);
      joinRooms(socket);
      loadOrdersViaRest(); // always reload orders fresh after reconnect
    };

    const onNewOrder = ({ order }) => {
      addOrder(order);
      setTimeout(() => clearNewFlag(order._id), 3000);
      playAlert();
    };

    const onOrderUpdated = ({ orderId, status }) => {
      updateOrderStatus(orderId, status);
    };

    socket.on("connect",       onConnect);
    socket.on("disconnect",    onDisconnect);
    socket.on("new-order",     onNewOrder);
    socket.on("order-updated", onOrderUpdated);
    socket.io.on("reconnect",  onReconnect); // manager-level reconnect event

    return () => {
      socket.off("connect",       onConnect);
      socket.off("disconnect",    onDisconnect);
      socket.off("new-order",     onNewOrder);
      socket.off("order-updated", onOrderUpdated);
      socket.io.off("reconnect",  onReconnect);
    };
  }, [token, restaurantId]);
};

// ── Web Audio beep ────────────────────────────────────────────────────────
const playAlert = () => {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch { /* blocked before user interaction — silent fail */ }
};