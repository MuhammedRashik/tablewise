import { MenuItem, MENU_CATEGORY } from "./menu.model.js";
import { Restaurant } from "../restaurant/restaurant.model.js";
import { ApiError } from "../../utils/ApiError.js";

// ── Helper: confirm restaurant belongs to requesting user ─────────────────
const assertOwnership = async (restaurantId, userId) => {
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    owner: userId,
  });

  if (!restaurant) {
    throw  ApiError(404, "Restaurant not found or you are not the owner");
  }

  return restaurant;
};

// ── CREATE single item ────────────────────────────────────────────────────
export const createMenuItemService = async (restaurantId, ownerId, data) => {
  await assertOwnership(restaurantId, ownerId);
  return await MenuItem.create({ ...data, restaurantId });
};

// ── BULK CREATE items ─────────────────────────────────────────────────────
export const bulkCreateMenuItemsService = async (restaurantId, ownerId, items) => {
  await assertOwnership(restaurantId, ownerId);

  const docs = items.map((item) => ({ ...item, restaurantId }));
  return await MenuItem.insertMany(docs, { ordered: false });
};

// ── GET menu (public) ─────────────────────────────────────────────────────
export const getMenuPublicService = async (restaurantId, filters = {}) => {
  const restaurant = await Restaurant.findById(restaurantId)
    .select("name logoUrl")
    .lean();

  if (!restaurant) throw  ApiError(404, "Restaurant not found");

  const query = {
    restaurantId,
    isActive: true,
    isAvailable: true,
  };

  if (filters.isVeg !== undefined) {
    query.isVeg = filters.isVeg === "true";
  }

  if (filters.category) {
    query.category = filters.category;
  }

  const items = await MenuItem.find(query)
    .sort({ category: 1, sortOrder: 1, name: 1 })
    .select("-restaurantId -isActive -__v")
    .lean();

  const grouped = {};
  Object.values(MENU_CATEGORY).forEach((cat) => {
    grouped[cat] = [];
  });

  items.forEach((item) => {
    if (grouped[item.category] !== undefined) {
      grouped[item.category].push(item);
    }
  });

  const filteredGrouped = Object.fromEntries(
    Object.entries(grouped).filter(([, v]) => v.length > 0)
  );

  return {
    restaurant,
    menu: filteredGrouped,
    totalItems: items.length,
  };
};

// ── GET full menu ─────────────────────────────────────────────────────────
export const getMenuFullService = async (restaurantId, filters = {}) => {
  const query = { restaurantId, isActive: true };

  if (filters.category) query.category = filters.category;

  if (filters.isAvailable !== undefined) {
    query.isAvailable = filters.isAvailable === "true";
  }

  if (filters.isVeg !== undefined) {
    query.isVeg = filters.isVeg === "true";
  }

  const items = await MenuItem.find(query)
    .sort({ category: 1, sortOrder: 1, name: 1 })
    .lean();

  const grouped = {};

  items.forEach((item) => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  return { menu: grouped, totalItems: items.length };
};

// ── UPDATE item ───────────────────────────────────────────────────────────
export const updateMenuItemService = async (
  itemId,
  restaurantId,
  ownerId,
  data
) => {
  await assertOwnership(restaurantId, ownerId);

  const item = await MenuItem.findOne({ _id: itemId, restaurantId });
  if (!item) throw  ApiError(404, "Menu item not found");

  const allowedFields = [
    "name",
    "description",
    "price",
    "category",
    "isVeg",
    "isAvailable",
    "photoUrl",
    "spiceLevel",
    "tags",
    "sortOrder",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) item[field] = data[field];
  });

  await item.save();
  return item;
};

// ── TOGGLE availability ───────────────────────────────────────────────────
export const toggleAvailabilityService = async (
  itemId,
  restaurantId,
  isAvailable
) => {
  const item = await MenuItem.findOneAndUpdate(
    { _id: itemId, restaurantId, isActive: true },
    { isAvailable },
    { new: true }
  );

  if (!item) throw  ApiError(404, "Menu item not found");
  return item;
};

// ── DELETE item (soft) ────────────────────────────────────────────────────
export const deleteMenuItemService = async (
  itemId,
  restaurantId,
  ownerId
) => {
  await assertOwnership(restaurantId, ownerId);

  const item = await MenuItem.findOne({ _id: itemId, restaurantId });
  if (!item) throw  ApiError(404, "Menu item not found");

  item.isActive = false;
  await item.save();

  return { message: `"${item.name}" removed from menu` };
};

// ── GET single item ───────────────────────────────────────────────────────
export const getMenuItemService = async (itemId, restaurantId) => {
  const item = await MenuItem.findOne({
    _id: itemId,
    restaurantId,
    isActive: true,
  });

  if (!item) throw  ApiError(404, "Menu item not found");
  return item;
};
