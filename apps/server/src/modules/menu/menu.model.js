import mongoose from "mongoose";

export const MENU_CATEGORY = {
  STARTER: "starter",
  MAIN: "main",
  BREAD: "bread",
  RICE: "rice",
  DESSERT: "dessert",
  BEVERAGE: "beverage",
  SIDES: "sides",
  SPECIALS: "specials",
};

const menuItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters"],
      default: null,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    category: {
      type: String,
      enum: Object.values(MENU_CATEGORY),
      required: [true, "Category is required"],
    },

    isVeg: {
      type: Boolean,
      required: [true, "isVeg is required"],
    },

    photoUrl: {
      type: String,
      default: null,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    spiceLevel: {
      type: String,
      enum: ["mild", "medium", "hot", "extra_hot", null],
      default: null,
    },

    tags: {
      type: [String],
      default: [],
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes
menuItemSchema.index({ restaurantId: 1, category: 1, isActive: 1 });
menuItemSchema.index({ restaurantId: 1, isAvailable: 1, isActive: 1 });
menuItemSchema.index({ restaurantId: 1, isVeg: 1, isActive: 1 });

export const MenuItem = mongoose.model("MenuItem", menuItemSchema);
