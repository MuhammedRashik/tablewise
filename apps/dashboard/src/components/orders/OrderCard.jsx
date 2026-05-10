import { Clock, ChefHat, CheckCircle } from "lucide-react";
import Badge from "../ui/Badge";

const STATUS_BADGE = {
  placed:    "blue",
  confirmed: "purple",
  preparing: "amber",
  served:    "green",
};

const ITEM_ICON = {
  pending:   <Clock size={12} className="text-gray-400" />,
  preparing: <ChefHat size={12} className="text-amber-500" />,
  served:    <CheckCircle size={12} className="text-brand-500" />,
};

const elapsed = (date) => {
  const m = Math.floor((Date.now() - new Date(date)) / 60000);
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h`;
};

const urgencyClass = (date) => {
  const m = Math.floor((Date.now() - new Date(date)) / 60000);
  if (m > 20) return "border-red-300 bg-red-50";
  if (m > 10) return "border-amber-300 bg-amber-50";
  return "";
};

export default function OrderCard({ order, onUpdateStatus, onMarkPaid, isActing }) {
  return (
    <div className={`card border transition-colors ${urgencyClass(order.createdAt)}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400">{order.orderNumber}</p>
          <p className="text-sm font-semibold text-gray-900">
            Table {order.tableId?.tableNumber || order.tableId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{elapsed(order.createdAt)}</span>
          <Badge variant={STATUS_BADGE[order.status] || "gray"}>{order.status}</Badge>
        </div>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-1.5 mb-3">
        {order.items?.map((item) => (
          <div key={item._id} className="flex items-center gap-2">
            {ITEM_ICON[item.status]}
            <span className="text-xs text-gray-700 flex-1">{item.quantity}× {item.name}</span>
            <span className="text-xs text-gray-400">₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-between text-xs font-medium text-gray-700 border-t border-gray-100 pt-2 mb-3">
        <span>Total</span>
        <span>₹{order.total}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {order.status === "placed" && (
          <button
            onClick={() => onUpdateStatus({ orderId: order._id, status: "confirmed" })}
            disabled={isActing}
            className="flex-1 h-8 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            Confirm
          </button>
        )}
        {order.status === "confirmed" && (
          <button
            onClick={() => onUpdateStatus({ orderId: order._id, status: "preparing" })}
            disabled={isActing}
            className="flex-1 h-8 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors disabled:opacity-50"
          >
            Preparing
          </button>
        )}
        {order.status === "preparing" && (
          <button
            onClick={() => onUpdateStatus({ orderId: order._id, status: "served" })}
            disabled={isActing}
            className="flex-1 h-8 rounded-lg bg-brand-50 text-brand-700 text-xs font-medium hover:bg-brand-100 transition-colors disabled:opacity-50"
          >
            Served
          </button>
        )}
        {order.status === "billed" && (
          <button
            onClick={() => onMarkPaid(order._id)}
            disabled={isActing}
            className="flex-1 h-8 rounded-lg bg-brand-400 text-white text-xs font-medium hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            Mark paid ₹{order.total}
          </button>
        )}
      </div>
    </div>
  );
}