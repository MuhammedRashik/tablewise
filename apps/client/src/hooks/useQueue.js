import { useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { queueApi } from "../services/queue.api";
import { useQueueStore } from "../store/queueStore";
import { useAuthStore } from "../store/authStore";
import { getSocket } from "../lib/socket";

export const useQueue = (restaurantId) => {
  const navigate = useNavigate();
  const {
    entry, position, ewt, status,
    setEntry, updatePosition, updateStatus,
    clearEntry, setTableNumber,
  } = useQueueStore();
  const user = useAuthStore((s) => s.user);

  // ── Join queue mutation ───────────────────────────────────────────────
  const joinMutation = useMutation({
    mutationFn: ({ partySize, notes }) =>
      queueApi.join(restaurantId, partySize, notes),

    onSuccess: (res) => {
      const { entry: newEntry, immediateTable } = res.data;

      // ── FIX: pass tableNumber from immediateTable into setEntry ──────
      const tableNumber = immediateTable?.tableNumber || null;
      setEntry(newEntry, tableNumber);

      // Join Socket.IO room
      const socket = getSocket();
      socket.emit("join-restaurant-room", { restaurantId }, (ack) => {
        if (ack?.success) console.log("[Queue] Joined restaurant room");
      });

      if (immediateTable) {
        navigate("/table-ready");
      } else {
        navigate("/queue-status");
      }
    },
  });

  // ── Leave queue mutation ──────────────────────────────────────────────
  const leaveMutation = useMutation({
    mutationFn: () => queueApi.leave(entry._id),
    onSuccess: () => {
      clearEntry();
      navigate("/");
    },
  });

  // ── Socket.IO listeners ───────────────────────────────────────────────
  useEffect(() => {
    if (!entry?._id) return;

    const socket = getSocket();

    const onQueueUpdate = ({ entries }) => {
      const myEntry = entries.find(
        (e) => e.customerId === user?._id || e._id === entry._id
      );
      if (myEntry) {
        updatePosition(myEntry.position, myEntry.estimatedWaitMinutes);
        updateStatus(myEntry.status);
      }
    };

    // ── FIX: capture tableNumber from socket event too ────────────────
    const onTableReady = ({ tableNumber, assignedTableId }) => {
      updateStatus("called", assignedTableId);
      if (tableNumber) setTableNumber(tableNumber); // ← save it
      navigate("/table-ready");
    };

    const onBumped = () => {
      updateStatus("bumped");
      clearEntry();
      navigate("/");
    };

    socket.on("queue-update",    onQueueUpdate);
    socket.on("table-ready",     onTableReady);
    socket.on("customer-bumped", onBumped);

    return () => {
      socket.off("queue-update",    onQueueUpdate);
      socket.off("table-ready",     onTableReady);
      socket.off("customer-bumped", onBumped);
    };
  }, [entry?._id, user?._id]);

  return {
    entry, position, ewt, status,
    joinQueue:  joinMutation.mutate,
    leaveQueue: leaveMutation.mutate,
    isJoining:  joinMutation.isPending,
    isLeaving:  leaveMutation.isPending,
    joinError:  joinMutation.error?.message,
  };
};