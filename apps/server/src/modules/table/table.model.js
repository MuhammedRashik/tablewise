import mongoose from "mongoose";

export const TABLE_STATUS = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  CLEANING: "cleaning",
  RESERVED: "reserved",
  INACTIVE: "inactive",
};

const tableSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    tableNumber: {
      type: String,
      required: [true, "Table number is required"],
      trim: true,
    },

    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
      max: [20, "Capacity cannot exceed 20"],
    },

    status: {
      type: String,
      enum: Object.values(TABLE_STATUS),
      default: TABLE_STATUS.AVAILABLE,
    },

    currentQueueEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queue",
      default: null,
    },

    occupiedAt: {
      type: Date,
      default: null,
    },

    location: {
      type: String,
      trim: true,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ─────────────────────────────────────────
tableSchema.index({ restaurantId: 1, status: 1 });

tableSchema.index(
  { restaurantId: 1, tableNumber: 1 },
  { unique: true }
);

tableSchema.index({
  restaurantId: 1,
  capacity: 1,
  status: 1,
});

// ── Model ───────────────────────────────────────────
export const Table = mongoose.model("Table", tableSchema);
