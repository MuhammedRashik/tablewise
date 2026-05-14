import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutGrid, Users, Grid3x3, ShoppingBag,
  UtensilsCrossed, BarChart3, Settings, LogOut, Menu, X,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useDashboardStore } from "../../store/dashboardStore";
import { authApi } from "../../services/auth.api";
import { useMyRestaurant } from "../../hooks/useRestaurant";
import { useEffect } from "react";

const NAV = [
  { to: "/",          icon: LayoutGrid,      label: "Queue board"  },
  { to: "/floor",     icon: Grid3x3,         label: "Floor view"   },
  { to: "/orders",    icon: ShoppingBag,     label: "Orders"       },
  { to: "/menu",      icon: UtensilsCrossed, label: "Menu"         },
  { to: "/analytics", icon: BarChart3,       label: "Analytics"    },
  { to: "/settings",  icon: Settings,        label: "Settings"     },
];

export default function Sidebar() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const logout     = useAuthStore((s) => s.logout);
  const { sidebarOpen, toggleSidebar } = useDashboardStore();
  const { data: restaurant } = useMyRestaurant();

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      useDashboardStore.getState().sidebarOpen &&
        useDashboardStore.getState().toggleSidebar?.();
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    logout();
    navigate("/login");
  };

  // Close when clicking a nav link on mobile
  const handleNavClick = () => {
    if (window.innerWidth < 1024 && sidebarOpen) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          bg-white border-r border-gray-100
          transition-all duration-200 ease-in-out
          ${sidebarOpen ? "w-56 translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
          ${sidebarOpen ? "lg:w-56" : "lg:w-16"}
        `}
      >
        {/* Logo + close button */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 h-14 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            TW
          </div>
          {sidebarOpen && (
            <span className="text-sm font-semibold text-gray-900 truncate flex-1">
              TableWise
            </span>
          )}
          {/* Close button — mobile shows X, desktop shows menu icon */}
          <button
            onClick={toggleSidebar}
            className="ml-auto text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            {sidebarOpen
              ? <X size={18} className="lg:hidden" />
              : null
            }
          </button>
        </div>

        {/* Restaurant name */}
        {sidebarOpen && restaurant && (
          <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <p className="text-xs text-gray-400">Restaurant</p>
            <p className="text-sm font-medium text-gray-800 truncate">
              {restaurant.name}
            </p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}
                 ${!sidebarOpen ? "lg:justify-center lg:px-2" : ""}`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 py-3 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handleLogout}
            className={`sidebar-link w-full text-red-500 hover:bg-red-50
              ${!sidebarOpen ? "lg:justify-center lg:px-2" : ""}`}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}