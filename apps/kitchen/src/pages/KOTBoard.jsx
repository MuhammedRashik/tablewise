import { useState, useMemo } from "react";
import { LogOut, Filter, RefreshCw, Bell } from "lucide-react";
import { useKitchenStore } from "../store/kitchenStore";
import { useKitchenSocket } from "../hooks/useKitchenSocket";
import { orderApi } from "../services/order.api";
import KOTCard from "../components/KOTCard";
import ConnectionBadge from "../components/ConnectionBadge";
import EmptyBoard from "../components/EmptyBoard";

const FILTERS = [
  { key: "all",      label: "All"       },
  { key: "placed",   label: "New"       },
  { key: "confirmed",label: "Confirmed" },
  { key: "preparing",label: "Preparing" },
];

export default function KOTBoard() {
  const {
    orders, connected,
    logout, updateOrderStatus,
    updateItemStatus, staffName,
    restaurantId, token,
  } = useKitchenStore();

  // Wire up socket — handles connect, events, initial load
  useKitchenSocket();

  const [filter,     setFilter]   = useState("all");
  const [isActing,   setIsActing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // ── Filter orders for display ─────────────────────────────────────────
  const displayOrders = useMemo(() => {
    let list = filter === "all"
      ? orders.filter((o) => !["served", "paid", "cancelled"].includes(o.status))
      : orders.filter((o) => o.status === filter);

    // Sort: urgent first, then by joinedAt
    return list.sort((a, b) => {
      const aUrgent = Date.now() - new Date(a.createdAt) > 20 * 60000;
      const bUrgent = Date.now() - new Date(b.createdAt) > 20 * 60000;
      if (aUrgent && !bUrgent) return -1;
      if (!aUrgent && bUrgent) return 1;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }, [orders, filter, lastRefresh]);

  // ── Counts for filter badges ──────────────────────────────────────────
  const counts = useMemo(() => ({
    all:       orders.filter((o) => !["served","paid","cancelled"].includes(o.status)).length,
    placed:    orders.filter((o) => o.status === "placed").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
  }), [orders]);

  const urgentCount = useMemo(() =>
    orders.filter((o) => {
      const mins = Math.floor((Date.now() - new Date(o.createdAt)) / 60000);
      return mins > 20 && !["served","paid","cancelled"].includes(o.status);
    }).length
  , [orders]);

  // ── Actions ───────────────────────────────────────────────────────────
  const handleUpdateStatus = async (orderId, status) => {
    setIsActing(true);
    try {
      await orderApi.updateStatus(restaurantId, orderId, status);
      updateOrderStatus(orderId, status);
    } catch (err) {
      console.error("[Kitchen] Update status failed:", err.message);
    } finally {
      setIsActing(false);
    }
  };

  const handleUpdateItemStatus = async (orderId, itemId, status) => {
    setIsActing(true);
    try {
      await orderApi.updateItemStatus(restaurantId, orderId, itemId, status);
      updateItemStatus(orderId, itemId, status);
    } catch (err) {
      console.error("[Kitchen] Update item status failed:", err.message);
    } finally {
      setIsActing(false);
    }
  };

  const handleRefresh = () => {
    setLastRefresh(Date.now());
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <header className="
        flex items-center gap-3 px-4 py-3
        bg-gray-900 border-b border-gray-800
        flex-shrink-0
      ">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mr-2">
          <div className="w-8 h-8 rounded-lg bg-brand-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            TW
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-white leading-none">Kitchen</p>
            <p className="text-xs text-gray-500 mt-0.5">{staffName}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 flex-1 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                whitespace-nowrap transition-colors flex-shrink-0
                ${filter === f.key
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                }
              `}
            >
              {f.label}
              {counts[f.key] > 0 && (
                <span className={`
                  w-4 h-4 rounded-full text-xs flex items-center justify-center
                  ${filter === f.key ? "bg-brand-400 text-white" : "bg-gray-600 text-gray-300"}
                `}>
                  {counts[f.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Urgent alert */}
          {urgentCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-900/60 border border-red-700 rounded-full animate-pulse">
              <Bell size={12} className="text-red-400" />
              <span className="text-xs text-red-300 font-medium">{urgentCount} urgent</span>
            </div>
          )}

          <ConnectionBadge connected={connected} />

          <button
            onClick={handleRefresh}
            className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-gray-700"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>

          <button
            onClick={logout}
            className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-gray-700"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* ── KOT Board ────────────────────────────────────────────────── */}
      {displayOrders.length === 0 ? (
        <EmptyBoard />
      ) : (
        <div className="
          flex-1 overflow-y-auto
          grid gap-4 p-4 content-start
          grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5
          auto-rows-min
        ">
          {displayOrders.map((order) => (
            <KOTCard
              key={order._id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
              onUpdateItemStatus={handleUpdateItemStatus}
              isActing={isActing}
            />
          ))}
        </div>
      )}

      {/* ── Footer status bar ─────────────────────────────────────────── */}
      <footer className="
        flex items-center justify-between
        px-4 py-2 bg-gray-950 border-t border-gray-800
        flex-shrink-0
      ">
        <p className="text-xs text-gray-600">
          {counts.all} active · {counts.preparing} preparing · {urgentCount} urgent
        </p>
        <p className="text-xs text-gray-600">
          {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </footer>

    </div>
  );
}