import { Order, ORDER_STATUS } from "../modules/order/order.model.js";

// ─────────────────────────────────────────────────────────────────────────
// SOCKET HANDLERS
// ─────────────────────────────────────────────────────────────────────────

export const registerOrderHandlers = (io, socket) => {
  const user = socket.user;

  // ── JOIN ORDER ROOM ─────────────────────────────────────────────────────
  socket.on("track-order", ({ orderId }, callback) => {
    socket.join(`order:${orderId}`);
    console.log(`[Socket] User "${user.name}" tracking order:${orderId}`);
    callback?.({ success: true });
  });

  // ── LEAVE ORDER ROOM ────────────────────────────────────────────────────
  socket.on("stop-tracking-order", ({ orderId }, callback) => {
    socket.leave(`order:${orderId}`);
    callback?.({ success: true });
  });

  // ── GET ACTIVE ORDERS ───────────────────────────────────────────────────
  socket.on("get-active-orders", async ({ restaurantId }, callback) => {
    try {
      if (!["staff", "owner"].includes(user.role)) {
        return callback?.({ success: false, error: "Not authorised" });
      }

      const orders = await Order.find({
        restaurantId,
        status: {
          $in: [
            ORDER_STATUS.PLACED,
            ORDER_STATUS.CONFIRMED,
            ORDER_STATUS.PREPARING,
          ],
        },
      })
        .sort({ createdAt: 1 })
        .populate("tableId", "tableNumber")
        .lean();

      callback?.({ success: true, orders });
    } catch (err) {
      console.error("[Socket] get-active-orders error:", err.message);
      callback?.({ success: false, error: "Failed to fetch orders" });
    }
  });
};

// ─────────────────────────────────────────────────────────────────────────
// EMITTERS
// ─────────────────────────────────────────────────────────────────────────

export const emitNewOrder = (io, restaurantId, order) => {
  io.to(`kitchen:${restaurantId}`).emit("new-order", {
    order,
    message: `New order from Table — ${order.orderNumber}`,
    timestamp: new Date().toISOString(),
  });

  io.to(`staff:${restaurantId}`).emit("new-order-alert", {
    orderId: order._id,
    orderNumber: order.orderNumber,
    tableId: order.tableId,
    itemCount: order.items.length,
    total: order.total,
    timestamp: new Date().toISOString(),
  });

  console.log(
    `[Socket] new-order emitted → kitchen:${restaurantId} (${order.orderNumber})`
  );
};

export const emitOrderStatusUpdate = (io, order) => {
  io.to(`order:${order._id}`).emit("order-status-update", {
    orderId: order._id,
    status: order.status,
    items: order.items,
    updatedAt: new Date().toISOString(),
  });

  io.to(`kitchen:${order.restaurantId}`).emit("order-updated", {
    orderId: order._id,
    status: order.status,
  });

  console.log(
    `[Socket] order-status-update emitted → order:${order._id} (${order.status})`
  );
};

export const emitBillRequested = (io, restaurantId, data) => {
  io.to(`staff:${restaurantId}`).emit("bill-requested", {
    orderId: data.orderId,
    orderNumber: data.orderNumber,
    tableId: data.tableId,
    total: data.total,
    paymentMethod: data.paymentMethod,
    message: `Bill requested for ${data.orderNumber}`,
    timestamp: new Date().toISOString(),
  });

  console.log(
    `[Socket] bill-requested emitted → staff:${restaurantId} (${data.orderNumber})`
  );
};

export const emitItemServed = (io, orderId, itemName) => {
  io.to(`order:${orderId}`).emit("item-served", {
    orderId,
    itemName,
    message: `${itemName} has been served`,
    timestamp: new Date().toISOString(),
  });
};
