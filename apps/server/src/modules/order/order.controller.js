import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse }  from "../../utils/ApiResponse.js";

import {
  placeOrderService,
  getOrdersByTableService,
  getActiveOrdersService,
  getOrderService,
  updateOrderStatusService,
  updateItemStatusService,
  requestBillService,
  markPaidService,
  cancelOrderService,
  getMyOrderHistoryService,
} from "./order.service.js";

import {
  emitNewOrder,
  emitOrderStatusUpdate,
  emitBillRequested,
} from "../../sockets/order.socket.js";


// ─────────────────────────────────────────────────────────────
// PLACE ORDER
// ─────────────────────────────────────────────────────────────
export const placeOrder = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  const order = await placeOrderService(
    restaurantId,
    req.user._id,
    req.body
  );

  const io = req.app.get("io");
  if (io) emitNewOrder(io, restaurantId, order);

  return res
    .status(201)
    .json( ApiResponse(201, { order }, "Order placed successfully"));
});


// ─────────────────────────────────────────────────────────────
// GET ORDERS BY TABLE
// ─────────────────────────────────────────────────────────────
export const getOrdersByTable = asyncHandler(async (req, res) => {
  const { restaurantId, tableId } = req.params;

  const result = await getOrdersByTableService(tableId, restaurantId);

  return res
    .status(200)
    .json( ApiResponse(200, result, "Orders fetched"));
});


// ─────────────────────────────────────────────────────────────
// GET ACTIVE ORDERS
// ─────────────────────────────────────────────────────────────
export const getActiveOrders = asyncHandler(async (req, res) => {
  const result = await getActiveOrdersService(req.params.restaurantId);

  return res
    .status(200)
    .json( ApiResponse(200, result, "Active orders fetched"));
});


// ─────────────────────────────────────────────────────────────
// GET SINGLE ORDER
// ─────────────────────────────────────────────────────────────
export const getOrder = asyncHandler(async (req, res) => {
  const { restaurantId, orderId } = req.params;

  const order = await getOrderService(orderId, restaurantId);

  return res
    .status(200)
    .json( ApiResponse(200, { order }, "Order fetched"));
});


// ─────────────────────────────────────────────────────────────
// UPDATE ORDER STATUS
// ─────────────────────────────────────────────────────────────
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { restaurantId, orderId } = req.params;

  const order = await updateOrderStatusService(
    orderId,
    restaurantId,
    req.body.status
  );

  const io = req.app.get("io");
  if (io) emitOrderStatusUpdate(io, order);

  return res
    .status(200)
    .json( ApiResponse(200, { order }, `Order status updated to ${order.status}`));
});


// ─────────────────────────────────────────────────────────────
// UPDATE ITEM STATUS
// ─────────────────────────────────────────────────────────────
export const updateItemStatus = asyncHandler(async (req, res) => {
  const { restaurantId, orderId, itemId } = req.params;

  const order = await updateItemStatusService(
    orderId,
    itemId,
    restaurantId,
    req.body.status
  );

  const io = req.app.get("io");
  if (io) emitOrderStatusUpdate(io, order);

  return res
    .status(200)
    .json( ApiResponse(200, { order }, "Item status updated"));
});


// ─────────────────────────────────────────────────────────────
// REQUEST BILL
// ─────────────────────────────────────────────────────────────
export const requestBill = asyncHandler(async (req, res) => {
  const { restaurantId, orderId } = req.params;

  const order = await requestBillService(
    orderId,
    req.user._id,
    req.body.paymentMethod
  );

  const io = req.app.get("io");

  if (io) {
    emitBillRequested(io, restaurantId, {
      orderId:       order._id,
      orderNumber:   order.orderNumber,
      tableId:       order.tableId,
      total:         order.total,
      paymentMethod: order.paymentMethod,
    });
  }

  return res
    .status(200)
    .json( ApiResponse(200, { order }, "Bill requested successfully"));
});


// ─────────────────────────────────────────────────────────────
// MARK PAID
// ─────────────────────────────────────────────────────────────
export const markPaid = asyncHandler(async (req, res) => {
  const order = await markPaidService(
    req.params.orderId,
    req.params.restaurantId
  );

  return res
    .status(200)
    .json( ApiResponse(200, { order }, "Order marked as paid"));
});


// ─────────────────────────────────────────────────────────────
// CANCEL ORDER
// ─────────────────────────────────────────────────────────────
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await cancelOrderService(
    req.params.orderId,
    req.params.restaurantId
  );

  return res
    .status(200)
    .json( ApiResponse(200, { order }, "Order cancelled"));
});


// ─────────────────────────────────────────────────────────────
// ORDER HISTORY
// ─────────────────────────────────────────────────────────────
export const getMyOrderHistory = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await getMyOrderHistoryService(
    req.user._id,
    page,
    limit
  );

  return res
    .status(200)
    .json( ApiResponse(200, result, "Order history fetched"));
});
