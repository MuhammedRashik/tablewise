import { Wifi, WifiOff } from "lucide-react";

export default function ConnectionBadge({ connected }) {
  return (
    <div className={`
      flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
      ${connected
        ? "bg-brand-400/20 text-brand-100"
        : "bg-red-500/20 text-red-300 animate-pulse"
      }
    `}>
      {connected
        ? <Wifi size={12} />
        : <WifiOff size={12} />
      }
      {connected ? "Live" : "Reconnecting..."}
    </div>
  );
}