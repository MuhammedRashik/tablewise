import { Clock, Users, Phone, CheckCircle, Table2, UserX, ChevronDown } from "lucide-react";
import { useState } from "react";
import Badge from "../ui/Badge";

const STATUS_BADGE = {
  waiting:   "gray",
  confirmed: "blue",
  called:    "amber",
  seated:    "green",
};

const formatTime = (date) => {
  const mins = Math.floor((Date.now() - new Date(date)) / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
};

export default function PartyCard({
  entry, onConfirm, onCall, onSeat, onBump, onNoShow, isActing,
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card mb-3 hover:shadow-sm transition-shadow">
      {/* Top row */}
      <div className="flex items-start gap-3">
        {/* Position badge */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
          entry.status === "called"
            ? "bg-amber-100 text-amber-700"
            : "bg-gray-100 text-gray-600"
        }`}>
          {entry.position}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900">{entry.customerName}</p>
            <Badge variant={STATUS_BADGE[entry.status] || "gray"}>
              {entry.status}
            </Badge>
          </div>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Users size={11} /> {entry.partySize} {entry.partySize === 1 ? "person" : "people"}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={11} /> {formatTime(entry.joinedAt)}
            </span>
            {entry.estimatedWaitMinutes > 0 && (
              <span className="text-xs text-gray-400">EWT ~{entry.estimatedWaitMinutes}m</span>
            )}
          </div>
        </div>

        <button
          onClick={() => setExpanded((p) => !p)}
          className="text-gray-400 hover:text-gray-600 mt-0.5"
        >
          <ChevronDown size={16} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Phone size={11} />
            <span>{entry.customerPhone}</span>
          </div>
          {entry.notes && (
            <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
              "{entry.notes}"
            </p>
          )}
          {entry.assignedTableId && (
            <p className="text-xs text-brand-600 font-medium">
              Table: {entry.assignedTableId?.tableNumber || entry.assignedTableId}
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
        {entry.status === "waiting" && (
          <button
            onClick={() => onConfirm(entry._id)}
            disabled={isActing}
            className="flex-1 h-8 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
          >
            <CheckCircle size={12} /> Confirm
          </button>
        )}
        {["waiting", "confirmed"].includes(entry.status) && (
          <button
            onClick={() => onCall(entry._id)}
            disabled={isActing}
            className="flex-1 h-8 rounded-lg bg-brand-400 text-white text-xs font-medium hover:bg-brand-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
          >
            <Table2 size={12} /> Call to table
          </button>
        )}
        {entry.status === "called" && (
          <button
            onClick={() => onSeat(entry._id)}
            disabled={isActing}
            className="flex-1 h-8 rounded-lg bg-brand-400 text-white text-xs font-medium hover:bg-brand-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
          >
            <CheckCircle size={12} /> Seated
          </button>
        )}
        <button
          onClick={() => onBump(entry._id)}
          disabled={isActing}
          className="h-8 px-3 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Bump
        </button>
        <button
          onClick={() => onNoShow(entry._id)}
          disabled={isActing}
          className="h-8 px-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          <UserX size={12} />
        </button>
      </div>
    </div>
  );
}