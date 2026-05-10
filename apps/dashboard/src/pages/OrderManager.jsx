import { Bell } from "lucide-react";
import { useActiveOrders } from "../hooks/useActiveOrders";
import OrderCard from "../components/orders/OrderCard";
import StatCard from "../components/ui/StatCard";
import Spinner from "../components/ui/Spinner";

export default function OrderManager() {
  const {
    activeOrders, isLoading,
    newOrderAlert, billAlert,
    clearNewOrderAlert, clearBillAlert,
    updateOrderStatus, markPaid, isActing,
  } = useActiveOrders();

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  const grouped = {
    placed:    activeOrders.filter((o) => o.status === "placed"),
    confirmed: activeOrders.filter((o) => o.status === "confirmed"),
    preparing: activeOrders.filter((o) => o.status === "preparing"),
    billed:    activeOrders.filter((o) => o.status === "billed"),
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Alerts */}
      {newOrderAlert && (
        <div className="flex items-center justify-between bg-brand-50 border border-brand-200 px-4 py-3 rounded-xl">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-brand-600" />
            <p className="text-sm text-brand-800 font-medium">
              New order {newOrderAlert.orderNumber} — Table {newOrderAlert.tableId?.tableNumber || ""}
            </p>
          </div>
          <button onClick={clearNewOrderAlert} className="text-brand-600 text-xs font-medium">Dismiss</button>
        </div>
      )}

      {billAlert && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-amber-600" />
            <p className="text-sm text-amber-800 font-medium">
              Bill requested — {billAlert.orderNumber} · ₹{billAlert.total} via {billAlert.paymentMethod}
            </p>
          </div>
          <button onClick={clearBillAlert} className="text-amber-600 text-xs font-medium">Dismiss</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="New orders"  value={grouped.placed.length}    color="blue"   />
        <StatCard label="Confirmed"   value={grouped.confirmed.length}  color="purple" />
        <StatCard label="Preparing"   value={grouped.preparing.length}  color="amber"  />
        <StatCard label="Awaiting bill" value={grouped.billed.length}   color="green"  />
      </div>

      {/* Columns — kanban style */}
      {activeOrders.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-sm text-gray-400">No active orders right now</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {Object.entries(grouped).map(([status, orders]) => (
            <div key={status}>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2 px-1">
                {status} ({orders.length})
              </p>
              {orders.length === 0 ? (
                <div className="card border-dashed text-center py-6">
                  <p className="text-xs text-gray-300">Empty</p>
                </div>
              ) : (
                orders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onUpdateStatus={updateOrderStatus}
                    onMarkPaid={markPaid}
                    isActing={isActing}
                  />
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}