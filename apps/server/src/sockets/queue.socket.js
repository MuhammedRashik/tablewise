import { Queue, QUEUE_STATUS } from "../modules/queue/queue.model.js";
import { Restaurant } from "../modules/restaurant/restaurant.model.js";

// ─────────────────────────────────────────────────────────────────────────
// SOCKET HANDLERS
// ─────────────────────────────────────────────────────────────────────────

export const registerQueueHandlers = (io, socket) => {
  const user = socket.user;

  // ── JOIN RESTAURANT ROOM ────────────────────────────────────────────────
  socket.on("join-restaurant-room", async ({ restaurantId }, callback) => {
    try {
      if (!restaurantId) {
        return callback?.({ success: false, error: "restaurantId is required" });
      }

      const restaurant = await Restaurant.findById(restaurantId)
        .select("name settings.isQueueOpen")
        .lean();

      if (!restaurant) {
        return callback?.({ success: false, error: "Restaurant not found" });
      }

      socket.join(`restaurant:${restaurantId}`);

      if (["staff", "owner"].includes(user.role)) {
        socket.join(`staff:${restaurantId}`);
      }

      socket.join(`customer:${user._id}`);

      console.log(
        `[Socket] ${user.role} "${user.name}" joined restaurant:${restaurantId}`
      );

      callback?.({
        success: true,
        restaurant: {
          name: restaurant.name,
          isQueueOpen: restaurant.settings.isQueueOpen,
        },
      });
    } catch (err) {
      console.error("[Socket] join-restaurant-room error:", err.message);
      callback?.({ success: false, error: "Failed to join room" });
    }
  });

  // ── JOIN KITCHEN ROOM ───────────────────────────────────────────────────
  socket.on("join-kitchen-room", ({ restaurantId }, callback) => {
    if (!["staff", "owner"].includes(user.role)) {
      return callback?.({ success: false, error: "Not authorised" });
    }

    socket.join(`kitchen:${restaurantId}`);
    console.log(`[Socket] Kitchen display joined kitchen:${restaurantId}`);
    callback?.({ success: true });
  });

  // ── GET LIVE QUEUE ──────────────────────────────────────────────────────
  socket.on("get-live-queue", async ({ restaurantId }, callback) => {
    try {
      if (!["staff", "owner"].includes(user.role)) {
        return callback?.({ success: false, error: "Not authorised" });
      }

      const entries = await Queue.find({
        restaurantId,
        status: {
          $in: [
            QUEUE_STATUS.WAITING,
            QUEUE_STATUS.CONFIRMED,
            QUEUE_STATUS.CALLED,
          ],
        },
      })
        .sort({ position: 1 })
        .lean();

      const summary = {
        waiting: entries.filter((e) => e.status === QUEUE_STATUS.WAITING).length,
        confirmed: entries.filter((e) => e.status === QUEUE_STATUS.CONFIRMED).length,
        called: entries.filter((e) => e.status === QUEUE_STATUS.CALLED).length,
        total: entries.length,
      };

      callback?.({ success: true, entries, summary });
    } catch (err) {
      console.error("[Socket] get-live-queue error:", err.message);
      callback?.({ success: false, error: "Failed to fetch queue" });
    }
  });

  // ── GET MY POSITION ─────────────────────────────────────────────────────
  socket.on("get-my-position", async ({ queueEntryId }, callback) => {
    try {
      const entry = await Queue.findOne({
        _id: queueEntryId,
        customerId: user._id,
      })
        .populate("assignedTableId", "tableNumber")
        .lean();

      if (!entry) {
        return callback?.({ success: false, error: "Queue entry not found" });
      }

      callback?.({ success: true, entry });
    } catch (err) {
      console.error("[Socket] get-my-position error:", err.message);
      callback?.({ success: false, error: "Failed to fetch position" });
    }
  });

  // ── DISCONNECT ──────────────────────────────────────────────────────────
  socket.on("disconnect", (reason) => {
    console.log(
      `[Socket] ${user.role} "${user.name}" disconnected — reason: ${reason}`
    );
  });
};

// ─────────────────────────────────────────────────────────────────────────
// EMITTERS
// ─────────────────────────────────────────────────────────────────────────

export const emitQueueUpdate = async (io, restaurantId) => {
  try {
    const entries = await Queue.find({
      restaurantId,
      status: {
        $in: [
          QUEUE_STATUS.WAITING,
          QUEUE_STATUS.CONFIRMED,
          QUEUE_STATUS.CALLED,
        ],
      },
    })
      .sort({ position: 1 })
      .lean();

    const summary = {
      waiting: entries.filter((e) => e.status === QUEUE_STATUS.WAITING).length,
      confirmed: entries.filter((e) => e.status === QUEUE_STATUS.CONFIRMED).length,
      called: entries.filter((e) => e.status === QUEUE_STATUS.CALLED).length,
      total: entries.length,
    };

    io.to(`restaurant:${restaurantId}`).emit("queue-update", {
      entries,
      summary,
      timestamp: new Date().toISOString(),
    });

    console.log(
      `[Socket] queue-update emitted → restaurant:${restaurantId} (${entries.length} active entries)`
    );
  } catch (err) {
    console.error("[Socket] emitQueueUpdate error:", err.message);
  }
};

export const emitTableReady = (io, customerId, data) => {
  io.to(`customer:${customerId}`).emit("table-ready", {
    tableNumber: data.tableNumber,
    assignedTableId: data.tableId,
    message: `Your table is ready! Please proceed to Table ${data.tableNumber}.`,
    timestamp: new Date().toISOString(),
  });

  console.log(
    `[Socket] table-ready emitted → customer:${customerId} (Table ${data.tableNumber})`
  );
};

export const emitCustomerBumped = (io, customerId) => {
  io.to(`customer:${customerId}`).emit("customer-bumped", {
    message:
      "You were removed from the queue for not responding in time. Please rejoin if you are still waiting.",
    timestamp: new Date().toISOString(),
  });

  console.log(`[Socket] customer-bumped emitted → customer:${customerId}`);
};

export const emitQueueStatusChanged = (io, restaurantId, isOpen) => {
  io.to(`restaurant:${restaurantId}`).emit("queue-status-changed", {
    isQueueOpen: isOpen,
    message: isOpen ? "Queue is now open" : "Queue is now closed",
    timestamp: new Date().toISOString(),
  });
};
