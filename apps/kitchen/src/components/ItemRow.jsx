import { Check } from "lucide-react";

const STATUS_CLASS = {
  pending:   "item-pending",
  preparing: "item-preparing",
  served:    "item-served",
};

export default function ItemRow({ item, orderId, onMarkItemDone, isActing }) {
  const isDone = item.status === "served";

  return (
    <div className={`
      flex items-center gap-3 py-2.5 border-b border-gray-700
      last:border-0 transition-all duration-300
    `}>
      {/* Quantity bubble */}
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center
        text-sm font-bold flex-shrink-0
        ${isDone ? "bg-gray-700 text-gray-500" : "bg-gray-600 text-white"}
      `}>
        {item.quantity}
      </div>

      {/* Item name */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${STATUS_CLASS[item.status] || "item-pending"}`}>
          {item.name}
        </p>
        {item.notes && (
          <p className="text-xs text-amber-400 mt-0.5 truncate">
            ⚠ {item.notes}
          </p>
        )}
      </div>

      {/* Veg dot */}
      <div className={`
        w-3 h-3 rounded-sm border-2 flex-shrink-0
        ${item.isVeg ? "border-brand-400" : "border-red-500"}
        ${isDone ? "opacity-30" : ""}
      `}>
        <div className={`
          w-1.5 h-1.5 rounded-full m-auto mt-0.5
          ${item.isVeg ? "bg-brand-400" : "bg-red-500"}
          ${isDone ? "opacity-30" : ""}
        `} />
      </div>

      {/* Mark item done button */}
      {!isDone && (
        <button
          onClick={() => onMarkItemDone(orderId, item._id)}
          disabled={isActing}
          className="
            w-8 h-8 rounded-lg bg-gray-700 hover:bg-brand-400
            flex items-center justify-center text-gray-400 hover:text-white
            transition-all active:scale-90 disabled:opacity-50 flex-shrink-0
          "
          title="Mark this item as served"
        >
          <Check size={14} />
        </button>
      )}

      {isDone && (
        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
          <Check size={14} className="text-brand-400" />
        </div>
      )}
    </div>
  );
}