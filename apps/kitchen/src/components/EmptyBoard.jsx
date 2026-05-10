import { ChefHat } from "lucide-react";

export default function EmptyBoard() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
      <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center animate-pulse-ring">
        <ChefHat size={36} className="text-brand-400" />
      </div>
      <div>
        <p className="text-xl font-semibold text-gray-300">All clear!</p>
        <p className="text-gray-500 text-sm mt-1">No active orders right now</p>
        <p className="text-gray-600 text-xs mt-3">New orders will appear here instantly</p>
      </div>
    </div>
  );
}