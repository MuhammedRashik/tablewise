import { Bell, Menu } from "lucide-react";
import { useDashboardStore } from "../../store/dashboardStore";
import { useAuthStore } from "../../store/authStore";

export default function TopBar({ title }) {
  const { toggleSidebar, newOrderAlert, billAlert } = useDashboardStore();
  const user = useAuthStore((s) => s.user);
  const alertCount = (newOrderAlert ? 1 : 0) + (billAlert ? 1 : 0);

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-4 flex-shrink-0">
      <button onClick={toggleSidebar} className="lg:hidden text-gray-500">
        <Menu size={20} />
      </button>

      <h1 className="text-base font-semibold text-gray-900 flex-1">{title}</h1>

      {/* Alert bell */}
      <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100">
        <Bell size={18} className="text-gray-600" />
        {alertCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
            {alertCount}
          </span>
        )}
      </button>

      {/* User avatar */}
      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-800 text-sm font-medium">
        {user?.name?.[0]?.toUpperCase()}
      </div>
    </header>
  );
}