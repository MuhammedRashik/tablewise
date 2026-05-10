import QRCode from "qrcode";
import { Restaurant } from "./restaurant.model.js";
import { User } from "../auth/auth.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { USER_ROLES } from "../../../../../packages/types/user.types.js";

// ── Build QR URL ─────────────────────────────────────────
const buildQrUrl = (restaurantId) => {
  const clientBase =
    process.env.CLIENT_BASE_URL || "http://localhost:5173";
  return `${clientBase}/join/${restaurantId}`;
};

// ── Generate QR code ─────────────────────────────────────
const generateQrCode = async (url) => {
  return await QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 400,
    color: {
      dark: "#1D4044",
      light: "#FFFFFF",
    },
  });
};

// ── CREATE restaurant ────────────────────────────────────
export const createRestaurantService = async (ownerId, body) => {
  const existing = await Restaurant.findOne({ owner: ownerId });

  if (existing) {
    throw ApiError(
      409,
      "You already have a restaurant registered. Update it instead."
    );
  }

  const restaurant = await Restaurant.create({
    ...body,
    owner: ownerId,
  });

  const qrUrl = buildQrUrl(restaurant._id);
  const qrCode = await generateQrCode(qrUrl);

  restaurant.qrUrl = qrUrl;
  restaurant.qrCode = qrCode;

  await restaurant.save();

  await User.findByIdAndUpdate(ownerId, {
    restaurantId: restaurant._id,
  });

  return restaurant;
};

// ── GET restaurant (public) ──────────────────────────────
export const getRestaurantPublicService = async (restaurantId) => {
  const restaurant = await Restaurant.findById(restaurantId)
    .select(
      "name address phone cuisine logoUrl settings.isQueueOpen settings.maxQueueSize isActive"
    )
    .lean();

  if (!restaurant) {
    throw ApiError(404, "Restaurant not found");
  }

  if (!restaurant.isActive) {
    throw ApiError(410, "This restaurant is no longer active");
  }

  return restaurant;
};

// ── GET my restaurant ────────────────────────────────────
export const getMyRestaurantService = async (user) => {
  const restaurantId = user.restaurantId;

  if (!restaurantId) {
    throw ApiError(404, "No restaurant linked to your account");
  }

  const restaurant = await Restaurant.findById(restaurantId).populate(
    "owner",
    "name email"
  );

  if (!restaurant) {
    throw ApiError(404, "Restaurant not found");
  }

  return restaurant;
};

// ── UPDATE restaurant ────────────────────────────────────
export const updateRestaurantService = async (
  restaurantId,
  ownerId,
  body
) => {
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    owner: ownerId,
  });

  if (!restaurant) {
    throw ApiError(404, "Restaurant not found or not owner");
  }

  const allowedFields = ["name", "phone", "address", "cuisine", "logoUrl"];

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      restaurant[field] = body[field];
    }
  });

  await restaurant.save();
  return restaurant;
};

// ── UPDATE settings ──────────────────────────────────────
export const updateSettingsService = async (
  restaurantId,
  ownerId,
  settings
) => {
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    owner: ownerId,
  });

  if (!restaurant) {
    throw ApiError(404, "Restaurant not found or not owner");
  }

  Object.keys(settings).forEach((key) => {
    restaurant.settings[key] = settings[key];
  });

  await restaurant.save();
  return restaurant;
};

// ── REGENERATE QR ────────────────────────────────────────
export const regenerateQrService = async (restaurantId, ownerId) => {
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    owner: ownerId,
  });

  if (!restaurant) {
    throw ApiError(404, "Restaurant not found or not owner");
  }

  const qrUrl = buildQrUrl(restaurant._id);
  const qrCode = await generateQrCode(qrUrl);

  restaurant.qrUrl = qrUrl;
  restaurant.qrCode = qrCode;

  await restaurant.save();

  return { qrUrl, qrCode };
};

// ── TOGGLE queue ─────────────────────────────────────────
export const toggleQueueService = async (
  restaurantId,
  userId,
  isOpen
) => {
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw ApiError(404, "Restaurant not found");
  }

  const isAuthorised =
    restaurant.owner.toString() === userId.toString() ||
    (await User.exists({
      _id: userId,
      restaurantId: restaurant._id,
      role: { $in: [USER_ROLES.STAFF, USER_ROLES.OWNER] },
    }));

  if (!isAuthorised) {
    throw ApiError(403, "Not authorised");
  }

  restaurant.settings.isQueueOpen = isOpen;
  await restaurant.save();

  return {
    isQueueOpen: restaurant.settings.isQueueOpen,
    message: isOpen ? "Queue opened" : "Queue closed",
  };
};

// ── DEACTIVATE restaurant ────────────────────────────────
export const deactivateRestaurantService = async (
  restaurantId,
  ownerId
) => {
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    owner: ownerId,
  });

  if (!restaurant) {
    throw ApiError(404, "Restaurant not found or not owner");
  }

  restaurant.isActive = false;
  await restaurant.save();

  return { message: "Restaurant deactivated" };
};
