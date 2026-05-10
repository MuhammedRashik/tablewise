import { Users } from "lucide-react";

const STATUS_STYLES = {
  available: { bg: "bg-brand-50  border-brand-200", text: "text-brand-800", dot: "bg-brand-400",  label: "Free"     },
  occupied:  { bg: "bg-amber-50  border-amber-200", text: "text-amber-800", dot: "bg-amber-400",  label: "Occupied" },
  cleaning:  { bg: "bg-blue-50   border-blue-200",  text: "text-blue-800",  dot: "bg-blue-400",   label: "Cleaning" },
  reserved:  { bg: "bg-purple-50 border-purple-200",text: "text-purple-800",dot: "bg-purple-400", label: "Reserved" },
  inactive:  { bg: "bg-gray-100  border-gray-200",  text: "text-gray-400",  dot: "bg-gray-300",   label: "Inactive" },
};

const NEXT_STATUS = {
  available: ["occupied", "cleaning", "reserved"],
  occupied:  ["cleaning", "available"],
  cleaning:  ["available", "inactive"],
  reserved:  ["available", "occupied"],
  inactive:  ["available"],
};

export default function TableCell({ table, onStatusChange, isUpdating }) {
  const s = STATUS_STYLES[table.status] || STATUS_STYLES.inactive;

  const handleClick = () => {
    const options = NEXT_STATUS[table.status];
    if (!options?.length) return;
    // Cycle to next valid status
    onStatusChange({ tableId: table._id, status: options[0] });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isUpdating}
      title={`${table.tableNumber} — ${s.label}. Click to mark as ${NEXT_STATUS[table.status]?.[0] || ""}`}
      className={`
        relative flex flex-col items-center justify-center
        h-20 rounded-xl border transition-all
        active:scale-95 disabled:opacity-60
        ${s.bg}
      `}
    >
      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${s.dot}`} />
      <p className={`text-sm font-semibold ${s.text}`}>{table.tableNumber}</p>
      <div className={`flex items-center gap-1 mt-0.5 ${s.text} opacity-70`}>
        <Users size={10} />
        <span className="text-xs">{table.capacity}</span>
      </div>
      <p className={`text-xs mt-0.5 ${s.text} opacity-60`}>{s.label}</p>
    </button>
  );
}