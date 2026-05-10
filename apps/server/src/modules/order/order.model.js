import mongoose from "mongoose";

export const ORDER_STATUS = {
  PLACED: "placed",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  SERVED: "served",
  BILLED: "billed",
  PAID: "paid",
  CANCELLED: "cancelled",
};

export const PAYMENT_METHOD = {
  UPI: "upi",
  CASH: "cash",
  CARD: "card",
};

// ── Order Item Schema ─────────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },

    name: { type: String, required: true },
    price: { type: Number, required: true },
    isVeg: { type: Boolean, required: true },
    category: { type: String, required: true },

    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      max: [20, "Quantity cannot exceed 20"],
    },

    status: {
      type: String,
      enum: ["pending", "preparing", "served"],
      default: "pending",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
  },
  { _id: true }
);

// ── Order Schema ──────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    queueEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queue",
      default: null,
    },

    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "Order must have at least one item",
      },
    },

    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PLACED,
    },

    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: null,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    billRequestedAt: {
      type: Date,
      default: null,
    },

    orderNumber: {
      type: String,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────
orderSchema.index({ restaurantId: 1, status: 1 });
orderSchema.index({ restaurantId: 1, tableId: 1, status: 1 });
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, createdAt: -1 });

// ── Pre-save hook (order number) ─────────────────────────────────────────
orderSchema.pre("save", async function () {
  if (this.isNew && !this.orderNumber) {
    const today = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const count = await this.constructor.countDocuments({
      restaurantId: this.restaurantId,
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    this.orderNumber = `ORD-${today}-${String(count + 1).padStart(4, "0")}`;
  }

  // next();
});

export const Order = mongoose.model("Order", orderSchema);
