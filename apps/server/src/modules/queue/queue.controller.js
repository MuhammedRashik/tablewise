import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse }  from "../../utils/ApiResponse.js";

import {
  joinQueueService,
  getQueuePositionService,
  getRestaurantQueueService,
  confirmEntryService,
  callCustomerService,
  seatCustomerService,
  leaveQueueService,
  bumpCustomerService,
  markNoShowService,
} from "./queue.service.js";

import {
  emitQueueUpdate,
  emitTableReady,
  emitCustomerBumped,
} from "../../sockets/queue.socket.js";


// JOIN QUEUE
export const joinQueue = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { partySize, notes } = req.body;

  const result = await joinQueueService(
    restaurantId,
    req.user,
    partySize,
    notes
  );

  const io = req.app.get("io");
  if (io) await emitQueueUpdate(io, restaurantId);

  const statusCode = result.immediateTable ? 200 : 201;

  return res
    .status(statusCode)
    .json( ApiResponse(statusCode, result, result.message));
});


// GET POSITION
export const getQueuePosition = asyncHandler(async (req, res) => {
  const result = await getQueuePositionService(
    req.params.queueId,
    req.user._id
  );

  return res
    .status(200)
    .json( ApiResponse(200, result, result.message));
});


// GET FULL QUEUE
export const getRestaurantQueue = asyncHandler(async (req, res) => {
  const result = await getRestaurantQueueService(req.params.restaurantId);

  return res
    .status(200)
    .json( ApiResponse(200, result, "Queue fetched successfully"));
});


// CONFIRM ENTRY
export const confirmEntry = asyncHandler(async (req, res) => {
  const { restaurantId, queueId } = req.params;

  const entry = await confirmEntryService(queueId, restaurantId);

  const io = req.app.get("io");
  if (io) await emitQueueUpdate(io, restaurantId);

  return res
    .status(200)
    .json( ApiResponse(200, { entry }, "Entry confirmed"));
});


// CALL CUSTOMER
export const callCustomer = asyncHandler(async (req, res) => {
  const { restaurantId, queueId } = req.params;

  const result = await callCustomerService(queueId, restaurantId);

  const io = req.app.get("io");

  if (io) {
    await emitQueueUpdate(io, restaurantId);

    emitTableReady(io, result.entry.customerId.toString(), {
      tableNumber: result.table.tableNumber,
      tableId: result.table._id,
    });
  }

  return res
    .status(200)
    .json( ApiResponse(200, result, "Customer called to table"));
});


// SEAT CUSTOMER
export const seatCustomer = asyncHandler(async (req, res) => {
  const { restaurantId, queueId } = req.params;

  const entry = await seatCustomerService(queueId, restaurantId);

  const io = req.app.get("io");
  if (io) await emitQueueUpdate(io, restaurantId);

  return res
    .status(200)
    .json( ApiResponse(200, { entry }, "Customer seated successfully"));
});


// LEAVE QUEUE
export const leaveQueue = asyncHandler(async (req, res) => {
  const result = await leaveQueueService(
    req.params.queueId,
    req.user._id
  );

  const io = req.app.get("io");

  if (io && result.restaurantId) {
    await emitQueueUpdate(io, result.restaurantId.toString());
  }

  return res
    .status(200)
    .json( ApiResponse(200, result, result.message));
});


// BUMP CUSTOMER
export const bumpCustomer = asyncHandler(async (req, res) => {
  const { restaurantId, queueId } = req.params;

  const entry = await bumpCustomerService(queueId, restaurantId);

  const io = req.app.get("io");

  if (io) {
    await emitQueueUpdate(io, restaurantId);
    emitCustomerBumped(io, entry.customerId.toString());
  }

  return res
    .status(200)
    .json( ApiResponse(200, { entry }, "Customer bumped from queue"));
});


// MARK NO SHOW
export const markNoShow = asyncHandler(async (req, res) => {
  const { restaurantId, queueId } = req.params;

  const entry = await markNoShowService(queueId, restaurantId);

  const io = req.app.get("io");

  if (io) {
    await emitQueueUpdate(io, restaurantId);
    emitCustomerBumped(io, entry.customerId.toString());
  }

  return res
    .status(200)
    .json( ApiResponse(200, { entry }, "Marked as no-show"));
});


//SELECT TABLE
export const selectTable = asyncHandler(async (req, res) => {
  const { tableId, partySize, notes } = req.body;

  const result = await selectTableService(
    req.params.restaurantId,
    req.user,
    tableId,
    partySize,
    notes
  );

  const io = req.app.get("io");
  if (io) {
    const { emitQueueUpdate, emitTableReady } = require("../../sockets/queue.socket");
    await emitQueueUpdate(io, req.params.restaurantId);

    if (result.entry.status === "called") {
      emitTableReady(io, req.user._id.toString(), {
        tableNumber: result.assignedTable.tableNumber,
        tableId:     result.assignedTable._id,
      });
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, result.message));
});