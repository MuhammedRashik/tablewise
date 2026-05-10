import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "../services/order.api";
import { useAuthStore } from "../store/authStore";
import { useDashboardStore } from "../store/dashboardStore";
import { getSocket } from "../lib/socket";

export const useActiveOrders = () => {
  const restaurantId = useAuthStore((s) => s.restaurantId);
  const {
    activeOrders, newOrderAlert, billAlert,
    setActiveOrders, addOrder, updateOrder,
    setNewOrderAlert, clearNewOrderAlert,
    setBillAlert, clearBillAlert,
  } = useDashboardStore();
  const qc = useQueryClient();

  // Initial fetch
  const { isLoading } = useQuery({
    queryKey: ["active-orders", restaurantId],
    queryFn:  () => orderApi.getActive(restaurantId),
    enabled:  !!restaurantId,
    select:   (res) => res.data.orders,
    onSuccess: (orders) => setActiveOrders(orders),
  });

  // Socket.IO — real-time order events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // New order arrives → KOT
    socket.on("new-order",       (data) => addOrder(data.order));
    socket.on("new-order-alert", (data) => setNewOrderAlert(data));

    // Order status updated
    socket.on("order-updated",   (data) => updateOrder(data));

    // Bill requested
    socket.on("bill-requested",  (data) => setBillAlert(data));

    return () => {
      socket.off("new-order");
      socket.off("new-order-alert");
      socket.off("order-updated");
      socket.off("bill-requested");
    };
  }, []);

  // Mutations
  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }) =>
      orderApi.updateStatus(restaurantId, orderId, status),
    onSuccess: (res) => updateOrder({ orderId: res.data.order._id, status: res.data.order.status }),
  });

  const itemStatusMutation = useMutation({
    mutationFn: ({ orderId, itemId, status }) =>
      orderApi.updateItemStatus(restaurantId, orderId, itemId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["active-orders", restaurantId] }),
  });

  const paidMutation = useMutation({
    mutationFn: (orderId) => orderApi.markPaid(restaurantId, orderId),
    onSuccess:  (res) => updateOrder({ orderId: res.data.order._id, status: "paid" }),
  });

  return {
    activeOrders,
    isLoading,
    newOrderAlert,
    billAlert,
    clearNewOrderAlert,
    clearBillAlert,
    updateOrderStatus: statusMutation.mutate,
    updateItemStatus:  itemStatusMutation.mutate,
    markPaid:          paidMutation.mutate,
    isActing:          statusMutation.isPending || paidMutation.isPending,
  };
};