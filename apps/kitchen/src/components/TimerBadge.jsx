import { useOrderTimer } from "../hooks/useOrderTimer";
import { Clock } from "lucide-react";

const URGENCY_STYLES = {
  new:    "bg-brand-400 text-white",
  normal: "bg-gray-700 text-gray-200",
  amber:  "bg-amber-500 text-white animate-pulse",
  urgent: "bg-red-600 text-white animate-pulse",
};

export default function TimerBadge({ createdAt, size = "md" }) {
  const { urgency, displayTime } = useOrderTimer(createdAt);

  const padding = size === "lg" ? "px-3 py-1.5 text-base" : "px-2.5 py-1 text-sm";

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full font-semibold
      ${padding} ${URGENCY_STYLES[urgency]}
    `}>
      <Clock size={size === "lg" ? 14 : 12} />
      {displayTime}
    </span>
  );
}