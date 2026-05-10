import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import {
  createMenuItemService,
  bulkCreateMenuItemsService,
  getMenuPublicService,
  getMenuFullService,
  updateMenuItemService,
  toggleAvailabilityService,
  deleteMenuItemService,
  getMenuItemService,
} from "./menu.service.js";

// ── POST /api/menu/:restaurantId ──────────────────────────────────────────
export const createMenuItem = asyncHandler(async (req, res) => {
  const item = await createMenuItemService(
    req.params.restaurantId,
    req.user._id,
    req.body
  );

  return res
    .status(201)
    .json( ApiResponse(201, { item }, "Menu item created"));
});

// ── POST /api/menu/:restaurantId/bulk ─────────────────────────────────────
export const bulkCreateMenuItems = asyncHandler(async (req, res) => {
  const items = await bulkCreateMenuItemsService(
    req.params.restaurantId,
    req.user._id,
    req.body.items
  );

  return res
    .status(201)
    .json(
       ApiResponse(
        201,
        { items, count: items.length },
        `${items.length} items created`
      )
    );
});

// ── GET /api/menu/:restaurantId/public ────────────────────────────────────
export const getMenuPublic = asyncHandler(async (req, res) => {
  const result = await getMenuPublicService(
    req.params.restaurantId,
    req.query
  );

  return res
    .status(200)
    .json( ApiResponse(200, result, "Menu fetched"));
});

// ── GET /api/menu/:restaurantId ───────────────────────────────────────────
export const getMenuFull = asyncHandler(async (req, res) => {
  const result = await getMenuFullService(
    req.params.restaurantId,
    req.query
  );

  return res
    .status(200)
    .json( ApiResponse(200, result, "Full menu fetched"));
});

// ── GET /api/menu/:restaurantId/item/:itemId ──────────────────────────────
export const getMenuItem = asyncHandler(async (req, res) => {
  const item = await getMenuItemService(
    req.params.itemId,
    req.params.restaurantId
  );

  return res
    .status(200)
    .json( ApiResponse(200, { item }, "Item fetched"));
});

// ── PATCH /api/menu/:restaurantId/item/:itemId ────────────────────────────
export const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await updateMenuItemService(
    req.params.itemId,
    req.params.restaurantId,
    req.user._id,
    req.body
  );

  return res
    .status(200)
    .json( ApiResponse(200, { item }, "Item updated successfully"));
});

// ── PATCH /api/menu/:restaurantId/item/:itemId/availability ───────────────
export const toggleAvailability = asyncHandler(async (req, res) => {
  const item = await toggleAvailabilityService(
    req.params.itemId,
    req.params.restaurantId,
    req.body.isAvailable
  );

  const msg = item.isAvailable
    ? "Item marked as available"
    : "Item marked as unavailable";

  return res
    .status(200)
    .json( ApiResponse(200, { item }, msg));
});

// ── DELETE /api/menu/:restaurantId/item/:itemId ───────────────────────────
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const result = await deleteMenuItemService(
    req.params.itemId,
    req.params.restaurantId,
    req.user._id
  );

  return res
    .status(200)
    .json( ApiResponse(200, result, result.message));
});
