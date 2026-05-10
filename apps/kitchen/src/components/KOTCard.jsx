import { useEffect } from "react";
import { ChefHat, Users } from "lucide-react";
import { useOrderTimer } from "../hooks/useOrderTimer";
import TimerBadge from "./TimerBadge";
import ItemRow from "./ItemRow";
import { useKitchenStore } from "../store/kitchenStore";

const CARD_CLASS = {
  new:    "kot-card kot-new",
  normal: "kot-card kot-normal",
  amber:  "kot-card kot-amber",
  urgent: "kot-card kot-urgent",
};

const STATUS_LABEL = {
  placed:    { text: "New order",  dot: "bg-blue-500"   },
  confirmed: { text: "Confirmed",  dot: "bg-purple-500" },
  preparing: { text: "Preparing",  dot: "bg-amber-500 animate-pulse" },
  served:    { text: "Served",     dot: "bg-brand-400"  },
};

export default function KOTCard({ order, onUpdateStatus, onUpdateItemStatus, isActing }) {
  const { urgency } = useOrderTimer(order.createdAt);
  const clearNewFlag = useKitchenStore((s) => s.clearNewFlag);

  // Clear flash after 3s
  useEffect(() => {
    if (order.isNew) {
      const t = setTimeout(() => clearNewFlag(order._id), 3000);
      return () => clearTimeout(t);
    }
  }, [order.isNew, order._id]);

  const sl = STATUS_LABEL[order.status] || STATUS_LABEL.placed;
  const cardClass = order.isNew ? "kot-new" : CARD_CLASS[urgency] || "kot-normal";

  const handleMarkPrepared = () => {
    if (order.status === "placed")    onUpdateStatus(order._id, "confirmed");
    if (order.status === "confirmed") onUpdateStatus(order._id, "preparing");
    if (order.status === "preparing") onUpdateStatus(order._id, "served");
  };

  const getButtonLabel = () => {
    if (order.status === "placed")    return "Confirm order";
    if (order.status === "confirmed") return "Start preparing";
    if (order.status === "preparing") return "Mark as served";
    return "Done";
  };

  const isServed = order.status === "served";

  return (
    <div className={`
      kot-card p-4 flex flex-col gap-3 animate-slide-in
      ${cardClass}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          {/* Table + order number */}
          <p className="text-2xl font-bold text-white leading-none">
            T-{order.tableId?.tableNumber || order.tableId}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{order.orderNumber}</p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <TimerBadge createdAt={order.createdAt} />
          {/* Status pill */}
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${sl.dot}`} />
            <span className="text-xs text-gray-400">{sl.text}</span>
          </div>
        </div>
      </div>

      {/* Party size */}
      {order.partySize && (
        <div className="flex items-center gap-1.5">
          <Users size={12} className="text-gray-500" />
          <span className="text-xs text-gray-500">{order.partySize} guests</span>
        </div>
      )}

      {/* Order notes */}
      {order.notes && (
        <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg px-3 py-2">
          <p className="text-xs text-amber-300">📝 {order.notes}</p>
        </div>
      )}

      {/* Items list */}
      <div className="flex flex-col">
        {order.items?.map((item) => (
          <ItemRow
            key={item._id}
            item={item}
            orderId={order._id}
            onMarkItemDone={onUpdateItemStatus}
            isActing={isActing}
          />
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-700">
        <span className="text-xs text-gray-500">Total</span>
        <span className="text-sm font-semibold text-gray-300">₹{order.total}</span>
      </div>

      {/* Action button */}
      <button
        onClick={handleMarkPrepared}
        disabled={isActing || isServed}
        className={`
          btn-done
          ${isServed  ? "btn-done-done"   :
            urgency === "urgent" ? "btn-done-urgent" :
            "btn-done-active"}
        `}
      >
        {isServed ? (
          <span className="flex items-center justify-center gap-2">
            <ChefHat size={16} /> Done
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <ChefHat size={16} /> {getButtonLabel()}
          </span>
        )}
      </button>
    </div>
  );
}