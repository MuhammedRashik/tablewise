import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useDashboardStore } from "../../store/dashboardStore";

export default function AppShell() {
  const title      = usePageTitle();
  const sidebarOpen = useDashboardStore((s) => s.sidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />

      {/* Main content — always full width on mobile regardless of sidebar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}