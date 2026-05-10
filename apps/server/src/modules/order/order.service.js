import { Order, ORDER_STATUS } from "./order.model.js";
import { MenuItem } from "../menu/menu.model.js";
import { Table, TABLE_STATUS } from "../table/table.model.js";
import { Queue, QUEUE_STATUS } from "../queue/queue.model.js";
import { ApiError } from "../../utils/ApiError.js";

const GST_RATE = 0.05;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const validateAndEnrichItems = async (restaurantId, rawItems) => {
  const menuItemIds = rawItems.map((i) => i.menuItemId);

  const menuItems = await MenuItem.find({
    _id: { $in: menuItemIds },
    restaurantId,
    isActive: true,
    isAvailable: true,
  });

  if (menuItems.length !== menuItemIds.length) {
    const foundIds = menuItems.map((m) => m._id.toString());
    const missing = menuItemIds.filter((id) => !foundIds.includes(id));

    throw  ApiError(
      400,
      `Some items are unavailable or not found: ${missing.join(", ")}`
    );
  }

  const menuMap = {};
  menuItems.forEach((m) => {
    menuMap[m._id.toString()] = m;
  });

  return rawItems.map((raw) => {
    const menuItem = menuMap[raw.menuItemId];

    return {
      menuItemId: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      isVeg: menuItem.isVeg,
      category: menuItem.category,
      quantity: raw.quantity,
      notes: raw.notes || null,
      status: "pending",
    };
  });
};

const calculateTotals = (items) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const tax = parseFloat((subtotal * GST_RATE).toFixed(2));
  const total = parseFloat((subtotal + tax).toFixed(2));

  return { subtotal, tax, total };
};

// ─────────────────────────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export const placeOrderService = async (
  restaurantId,
  customerId,
  { tableId, items, notes }
) => {
  const table = await Table.findOne({
    _id: tableId,
    restaurantId,
    isActive: true,
  });

  if (!table) throw  ApiError(404, "Table not found in this restaurant");

  if (table.status !== TABLE_STATUS.OCCUPIED) {
    throw  ApiError(400, "Orders can only be placed for occupied tables");
  }

  const queueEntry = await Queue.findOne({
    restaurantId,
    customerId,
    assignedTableId: tableId,
    status: QUEUE_STATUS.SEATED,
  });

  const enrichedItems = await validateAndEnrichItems(restaurantId, items);
  const { subtotal, tax, total } = calculateTotals(enrichedItems);

  const order = await Order.create({
    restaurantId,
    tableId,
    customerId,
    queueEntryId: queueEntry?._id || null,
    items: enrichedItems,
    subtotal,
    tax,
    total,
    notes: notes || null,
    status: ORDER_STATUS.PLACED,
  });

  return order;
};

export const getOrdersByTableService = async (tableId, restaurantId) => {
  const orders = await Order.find({
    tableId,
    restaurantId,
    status: { $nin: [ORDER_STATUS.PAID, ORDER_STATUS.CANCELLED] },
  })
    .sort({ createdAt: 1 })
    .lean();

  const billTotal = orders.reduce((sum, o) => sum + o.total, 0);

  return {
    orders,
    billTotal: parseFloat(billTotal.toFixed(2)),
  };
};

export const getActiveOrdersService = async (restaurantId) => {
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
    .populate("tableId", "tableNumber capacity")
    .lean();

  const grouped = {
    placed: orders.filter((o) => o.status === ORDER_STATUS.PLACED),
    confirmed: orders.filter((o) => o.status === ORDER_STATUS.CONFIRMED),
    preparing: orders.filter((o) => o.status === ORDER_STATUS.PREPARING),
  };

  return { orders, grouped, total: orders.length };
};

export const getOrderService = async (orderId, restaurantId) => {
  const order = await Order.findOne({ _id: orderId, restaurantId })
    .populate("tableId", "tableNumber capacity")
    .populate("customerId", "name phone");

  if (!order) throw  ApiError(404, "Order not found");
  return order;
};

export const updateOrderStatusService = async (
  orderId,
  restaurantId,
  newStatus
) => {
  const order = await Order.findOne({ _id: orderId, restaurantId });
  if (!order) throw  ApiError(404, "Order not found");

  const validTransitions = {
    placed: ["confirmed", "cancelled"],
    confirmed: ["preparing", "cancelled"],
    preparing: ["served"],
    served: ["billed"],
    billed: ["paid"],
    paid: [],
    cancelled: [],
  };

  if (!validTransitions[order.status].includes(newStatus)) {
    throw  ApiError(
      400,
      `Cannot transition order from "${order.status}" to "${newStatus}"`
    );
  }

  order.status = newStatus;

  if (newStatus === ORDER_STATUS.PREPARING) {
    order.items.forEach((item) => {
      if (item.status === "pending") item.status = "preparing";
    });
  }

  if (newStatus === ORDER_STATUS.SERVED) {
    order.items.forEach((item) => {
      item.status = "served";
    });
  }

  await order.save();
  return order;
};

export const updateItemStatusService = async (
  orderId,
  itemId,
  restaurantId,
  newStatus
) => {
  const order = await Order.findOne({ _id: orderId, restaurantId });
  if (!order) throw  ApiError(404, "Order not found");

  const item = order.items.id(itemId);
  if (!item) throw  ApiError(404, "Order item not found");

  item.status = newStatus;

  const allServed = order.items.every((i) => i.status === "served");
  if (allServed && order.status === ORDER_STATUS.PREPARING) {
    order.status = ORDER_STATUS.SERVED;
  }

  await order.save();
  return order;
};

export const requestBillService = async (
  orderId,
  customerId,
  paymentMethod
) => {
  const order = await Order.findOne({ _id: orderId, customerId });
  if (!order) throw  ApiError(404, "Order not found");

  if (order.status !== ORDER_STATUS.SERVED) {
    throw  ApiError(
      400,
      "Bill can only be requested after food is served"
    );
  }

  order.status = ORDER_STATUS.BILLED;
  order.billRequestedAt = new Date();
  order.paymentMethod = paymentMethod;

  await order.save();
  return order;
};

export const markPaidService = async (orderId, restaurantId) => {
  const order = await Order.findOne({ _id: orderId, restaurantId });
  if (!order) throw  ApiError(404, "Order not found");

  if (order.status !== ORDER_STATUS.BILLED) {
    throw  ApiError(400, "Only billed orders can be marked as paid");
  }

  order.status = ORDER_STATUS.PAID;
  order.isPaid = true;

  await order.save();
  return order;
};

export const cancelOrderService = async (orderId, restaurantId) => {
  const order = await Order.findOne({ _id: orderId, restaurantId });
  if (!order) throw  ApiError(404, "Order not found");

  if (!["placed", "confirmed"].includes(order.status)) {
    throw  ApiError(
      400,
      "Only placed or confirmed orders can be cancelled"
    );
  }

  order.status = ORDER_STATUS.CANCELLED;
  await order.save();

  return order;
};

export const getMyOrderHistoryService = async (
  customerId,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ customerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("restaurantId", "name")
      .populate("tableId", "tableNumber")
      .lean(),

    Order.countDocuments({ customerId }),
  ]);

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
