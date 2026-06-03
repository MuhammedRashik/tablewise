import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { orderApi } from "../services/order.api";
import { useOrderStore } from "../store/orderStore";
import { getSocket } from "../lib/socket";

export const useOrder = (restaurantId) => {
  const navigate = useNavigate();
  const {
    cart, activeOrder,
    setActiveOrder, updateOrderStatus, clearCart,
  } = useOrderStore();

  // ── Place order ───────────────────────────────────────────────────────
  const placeMutation = useMutation({
    mutationFn: ({ tableId, notes }) => {
      const items = cart.map((i) => ({
        menuItemId: i.menuItemId,
        quantity:   i.quantity,
        notes:      i.notes || undefined,
      }));
      return orderApi.place(restaurantId, tableId, items, notes);
    },
    onSuccess: (res) => {
      const order = res.data.order;
      setActiveOrder(order, order.tableId);
      clearCart();
      const socket = getSocket();
      socket.emit("track-order", { orderId: order._id });
      navigate("/order-tracker");
    },
  });

  // ── Request bill ──────────────────────────────────────────────────────
  const billMutation = useMutation({
    mutationFn: ({ orderId, paymentMethod }) =>
      orderApi.requestBill(restaurantId, orderId, paymentMethod),
    onSuccess: (res) => {
      updateOrderStatus("billed", res.data.order.items, res.data.order._id);
    },
  });

  // ── Cancel whole order ────────────────────────────────────────────────
  const cancelMutation = useMutation({
    mutationFn: (orderId) => orderApi.cancel(restaurantId, orderId),
    onSuccess: (res) => {
      updateOrderStatus("cancelled", res.data.order.items, res.data.order._id);
    },
    onError: (err) => alert(err.message || "Cannot cancel this order"),
  });

  // ── Cancel single item ────────────────────────────────────────────────
  const cancelItemMutation = useMutation({
    mutationFn: ({ orderId, itemId }) =>
      orderApi.cancelItem(restaurantId, orderId, itemId),
    onSuccess: (res) => {
      // Update the order in store with new items + status
      updateOrderStatus(
        res.data.order.status,
        res.data.order.items,
        res.data.order._id
      );
    },
    onError: (err) => alert(err.message || "Cannot cancel this item"),
  });

  // ── Socket.IO order status updates ───────────────────────────────────
  useEffect(() => {
    if (!activeOrder?._id) return;
    const socket = getSocket();
    const onStatusUpdate = ({ status, items }) => {
      updateOrderStatus(status, items);
    };
    socket.on("order-status-update", onStatusUpdate);
    return () => socket.off("order-status-update", onStatusUpdate);
  }, [activeOrder?._id]);

  return {
    cart,
    activeOrder,
    placeOrder:         placeMutation.mutate,
    requestBill:        billMutation.mutate,
    cancelOrder:        cancelMutation.mutate,
    cancelItem:         cancelItemMutation.mutate,        // ← expose
    isPlacing:          placeMutation.isPending,
    isRequestingBill:   billMutation.isPending,
    isCancelling:       cancelMutation.isPending,
    isCancellingItem:   cancelItemMutation.isPending,     // ← expose
    placeError:         placeMutation.error?.message,
  };
};