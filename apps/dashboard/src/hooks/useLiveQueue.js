import { useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queueApi } from "../services/queue.api";
import { useAuthStore } from "../store/authStore";
import { useDashboardStore } from "../store/dashboardStore";
import { getSocket } from "../lib/socket";

export const useLiveQueue = () => {
  const restaurantId = useAuthStore((s) => s.restaurantId);
  const { queueEntries, queueSummary, setQueueData } = useDashboardStore();
  const qc = useQueryClient();

  // ── Join restaurant room + load initial queue on mount ─────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !restaurantId) return;

    // Join rooms
    socket.emit("join-restaurant-room", { restaurantId }, (ack) => {
      if (ack?.success) console.log("[Dashboard] Joined restaurant room");
    });
    socket.emit("join-kitchen-room", { restaurantId });

    // Request current queue state
    socket.emit("get-live-queue", { restaurantId }, (res) => {
      if (res?.success) setQueueData(res.entries, res.summary);
    });

    // Listen for live queue updates pushed by server
    const onQueueUpdate = ({ entries, summary }) => {
      setQueueData(entries, summary);
    };

    socket.on("queue-update", onQueueUpdate);
    return () => socket.off("queue-update", onQueueUpdate);
  }, [restaurantId]);

  // ── Actions ───────────────────────────────────────────────────────────
  const confirmMutation = useMutation({
    mutationFn: (queueId) => queueApi.confirm(restaurantId, queueId),
  });

  const callMutation = useMutation({
    mutationFn: (queueId) => queueApi.call(restaurantId, queueId),
  });

  const seatMutation = useMutation({
    mutationFn: (queueId) => queueApi.seat(restaurantId, queueId),
  });

  const bumpMutation = useMutation({
    mutationFn: (queueId) => queueApi.bump(restaurantId, queueId),
  });

  const noShowMutation = useMutation({
    mutationFn: (queueId) => queueApi.noShow(restaurantId, queueId),
  });

  return {
    queueEntries,
    queueSummary,
    confirmEntry: confirmMutation.mutate,
    callCustomer: callMutation.mutate,
    seatCustomer: seatMutation.mutate,
    bumpCustomer: bumpMutation.mutate,
    markNoShow:   noShowMutation.mutate,
    isActing:     confirmMutation.isPending || callMutation.isPending ||
                  seatMutation.isPending    || bumpMutation.isPending,
  };
};