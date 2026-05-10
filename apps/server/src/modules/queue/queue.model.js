import mongoose from "mongoose";

export const QUEUE_STATUS = {
  WAITING: "waiting",
  CONFIRMED: "confirmed",
  CALLED: "called",
  SEATED: "seated",
  LEFT: "left",
  BUMPED: "bumped",
  NO_SHOW: "no_show",
};

const queueSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerPhone: {
      type: String,
      required: true,
    },

    partySize: {
      type: Number,
      required: true,
      min: [1, "Party size must be at least 1"],
      max: [20, "Party size cannot exceed 20"],
    },

    status: {
      type: String,
      enum: Object.values(QUEUE_STATUS),
      default: QUEUE_STATUS.WAITING,
    },

    position: {
      type: Number,
      default: null,
    },

    assignedTableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      default: null,
    },

    joinedAt: { type: Date, default: Date.now },
    confirmedAt: { type: Date, default: null },
    calledAt: { type: Date, default: null },
    seatedAt: { type: Date, default: null },
    leftAt: { type: Date, default: null },

    estimatedWaitMinutes: {
      type: Number,
      default: 0,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },

    autoBumpJobId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ─────────────────────────────────────────

// Fast filtering by restaurant + status
queueSchema.index({ restaurantId: 1, status: 1 });

// 🔥 MOST IMPORTANT (queue ordering)
queueSchema.index({ restaurantId: 1, status: 1, position: 1 });

// Customer active queue lookup
queueSchema.index({ customerId: 1, status: 1 });

// Recent joins (analytics / dashboard)
queueSchema.index({ restaurantId: 1, joinedAt: -1 });

// ── Model ───────────────────────────────────────────
export const Queue = mongoose.model("Queue", queueSchema);
