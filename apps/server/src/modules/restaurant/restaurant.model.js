import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: {
        type: String,
        trim: true,
        match: [/^\d{6}$/, "Enter valid 6-digit pincode"],
      },
    },

    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"],
    },

    settings: {
      totalTables: {
        type: Number,
        default: 10,
        min: [1, "Must have at least 1 table"],
      },

      autoBumpMinutes: {
        type: Number,
        default: 10,
        min: [2, "Auto-bump must be at least 2 minutes"],
      },

      avgTurnoverMinutes: {
        type: Number,
        default: 45,
        min: [5, "Average turnover must be at least 5 minutes"],
      },

      maxQueueSize: {
        type: Number,
        default: 50,
      },

      isQueueOpen: {
        type: Boolean,
        default: true,
      },
    },

    qrCode: {
      type: String,
      default: null,
    },

    qrUrl: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    logoUrl: {
      type: String,
      default: null,
    },

    cuisine: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ─────────────────────────────────────────
restaurantSchema.index({ owner: 1 });
restaurantSchema.index({ isActive: 1 });

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);
