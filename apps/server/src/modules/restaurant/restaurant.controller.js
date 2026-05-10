import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

import {
  createRestaurantService,
  getRestaurantPublicService,
  getMyRestaurantService,
  updateRestaurantService,
  updateSettingsService,
  regenerateQrService,
  toggleQueueService,
  deactivateRestaurantService,
} from "./restaurant.service.js";

// ── CREATE ─────────────────────────────────────────────
export const createRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await createRestaurantService(
    req.user._id,
    req.body
  );

  return res
    .status(201)
    .json(ApiResponse(201, { restaurant }, "Restaurant created"));
});

// ── PUBLIC (QR scan) ───────────────────────────────────
export const getRestaurantPublic = asyncHandler(async (req, res) => {
  const restaurant = await getRestaurantPublicService(
    req.params.restaurantId
  );

  return res
    .status(200)
    .json(ApiResponse(200, { restaurant }, "Restaurant fetched"));
});

// ── GET MY RESTAURANT ─────────────────────────────────
export const getMyRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await getMyRestaurantService(req.user);

  return res
    .status(200)
    .json(ApiResponse(200, { restaurant }, "Restaurant fetched"));
});

// ── UPDATE INFO ───────────────────────────────────────
export const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await updateRestaurantService(
    req.params.restaurantId,
    req.user._id,
    req.body
  );

  return res
    .status(200)
    .json( ApiResponse(200, { restaurant }, "Restaurant updated"));
});

// ── UPDATE SETTINGS ───────────────────────────────────
export const updateSettings = asyncHandler(async (req, res) => {
  const restaurant = await updateSettingsService(
    req.params.restaurantId,
    req.user._id,
    req.body.settings
  );

  return res
    .status(200)
    .json(ApiResponse(200, { restaurant }, "Settings updated"));
});

// ── GET QR ────────────────────────────────────────────
export const getQrCode = asyncHandler(async (req, res) => {
  const restaurant = await getMyRestaurantService(req.user);

  return res.status(200).json(
     ApiResponse(
      200,
      {
        qrCode: restaurant.qrCode,
        qrUrl: restaurant.qrUrl,
      },
      "QR fetched"
    )
  );
});

// ── REGENERATE QR ─────────────────────────────────────
export const regenerateQr = asyncHandler(async (req, res) => {
  const result = await regenerateQrService(
    req.params.restaurantId,
    req.user._id
  );

  return res
    .status(200)
    .json( ApiResponse(200, result, "QR regenerated"));
});

// ── TOGGLE QUEUE ──────────────────────────────────────
export const toggleQueue = asyncHandler(async (req, res) => {
  const { isOpen } = req.body;

  const result = await toggleQueueService(
    req.params.restaurantId,
    req.user._id,
    isOpen
  );

  return res
    .status(200)
    .json( ApiResponse(200, result, result.message));
});

// ── DEACTIVATE ────────────────────────────────────────
export const deactivateRestaurant = asyncHandler(async (req, res) => {
  const result = await deactivateRestaurantService(
    req.params.restaurantId,
    req.user._id
  );

  return res
    .status(200)
    .json( ApiResponse(200, result, result.message));
});
