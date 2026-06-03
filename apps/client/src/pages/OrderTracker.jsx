import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, Clock, CheckCircle, Plus, ArrowLeft, X } from "lucide-react";
import { useOrderStore } from "../store/orderStore";
import { useOrder } from "../hooks/useOrder";
import OrderStatusChip from "../components/order/OrderStatusChip";
import BottomSheet from "../components/ui/BottomSheet";

const ITEM_ICON = {
  pending:   <Clock size={13} color="var(--text-3)" />,
  preparing: <ChefHat size={13} color="var(--gold)" />,
  served:    <CheckCircle size={13} color="var(--green)" />,
  cancelled: <X size={13} color="var(--red,#E24B4A)" />,
};

const PAYMENT_METHODS = [
  { id:"upi",  label:"UPI / GPay / PhonePe", icon:"📱" },
  { id:"cash", label:"Cash",                 icon:"💵" },
  { id:"card", label:"Card / Tap",           icon:"💳" },
];

export default function OrderTracker() {
  const navigate     = useNavigate();
  const { allSessionOrders } = useOrderStore();
  const orders = allSessionOrders?.length > 0 ? allSessionOrders : [];

  const restaurantId = orders[0]?.restaurantId;
  const {
    requestBill, isRequestingBill,
    cancelOrder, isCancelling,
    cancelItem, isCancellingItem,
  } = useOrder(restaurantId);

  const [billOpen, setBillOpen]   = useState(false);
  const [payMethod, setPayMethod] = useState("upi");

  // Only non-cancelled orders count toward the bill
  const activeOrders      = orders.filter((o) => o.status !== "cancelled");
  const grandTotal        = activeOrders.reduce((s, o) => {
    // For each order, only sum non-cancelled items
    const orderActive = o.items?.filter((i) => i.status !== "cancelled") || [];
    const sub  = orderActive.reduce((a, i) => a + i.price * i.quantity, 0);
    const tax  = parseFloat((sub * 0.05).toFixed(2));
    return s + sub + tax;
  }, 0);

  const hasSomethingToPay = activeOrders.some(
    (o) => !["paid"].includes(o.status)
  );
  const billableOrder  = activeOrders.find((o) => o.status === "served");
  const allPaid        = orders.length > 0 &&
    orders.every((o) => ["paid", "cancelled"].includes(o.status));

  // Per-order cancel — only if placed or confirmed
  const canCancelOrder = (order) =>
    ["placed", "confirmed"].includes(order.status);

  // Per-item cancel — only if item is pending AND order is not already cancelled
  const canCancelItem = (order, item) =>
    item.status === "pending" &&
    !["cancelled", "served", "paid", "billed"].includes(order.status);

  if (orders.length === 0) {
    return (
      <div className="screen" style={{ alignItems:"center", justifyContent:"center", padding:"0 24px", textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🍽</div>
        <p style={{ color:"var(--text-2)", marginBottom:12 }}>No active order</p>
        <button onClick={() => navigate("/menu")} style={{ color:"var(--gold)", fontSize:14, textDecoration:"underline", background:"none", border:"none", cursor:"pointer" }}>
          Go to menu
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="orb" style={{ width:400, height:400, background:"var(--gold)", top:-150, right:-150 }} />

      <div style={{ position:"relative", padding:"56px 24px 0", flex:1, display:"flex", flexDirection:"column", gap:16, overflowY:"auto", paddingBottom:140 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
          <button
            onClick={() => navigate("/menu")}
            style={{ width:36, height:36, borderRadius:10, background:"var(--glass)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}
          >
            <ArrowLeft size={16} color="var(--text-2)" />
          </button>
          <div>
            <h1 style={{ fontSize:22 }}>Your orders</h1>
            <p style={{ fontSize:12, color:"var(--text-3)", marginTop:2 }}>
              {orders.length} order{orders.length > 1 ? "s" : ""} this session
            </p>
          </div>
        </div>

        {/* All paid celebration */}
        {allPaid && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", background:"rgba(29,158,117,0.1)", border:"1px solid rgba(29,158,117,0.3)", borderRadius:16, padding:"20px 16px", textAlign:"center" }}>
            <CheckCircle size={32} color="var(--green)" style={{ marginBottom:8 }} />
            <p style={{ fontSize:16, fontWeight:500 }}>All bills settled!</p>
            <p style={{ fontSize:13, color:"var(--text-3)", marginTop:4 }}>Thank you, enjoy your meal 🙏</p>
          </div>
        )}

        {/* Each order card */}
        {orders.map((order, idx) => {
          const isCancelled = order.status === "cancelled";
          return (
            <div
              key={order._id}
              style={{
                background: isCancelled ? "rgba(226,75,74,0.05)" : "var(--glass)",
                border: isCancelled ? "1px solid rgba(226,75,74,0.2)" : "1px solid var(--border)",
                borderRadius:16, overflow:"hidden",
                opacity: isCancelled ? 0.65 : 1,
              }}
            >
              {/* Order header */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderBottom:"1px solid var(--border)", background:"rgba(255,255,255,0.03)" }}>
                <div>
                  <p style={{ fontSize:11, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                    Order {idx + 1}
                  </p>
                  <p style={{ fontSize:13, fontWeight:500, marginTop:2 }}>{order.orderNumber}</p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <OrderStatusChip status={order.status} />
                  {/* Cancel whole order button */}
                  {canCancelOrder(order) && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Cancel order ${order.orderNumber}?`)) {
                          cancelOrder(order._id);
                        }
                      }}
                      disabled={isCancelling}
                      style={{
                        padding:"4px 10px", borderRadius:8,
                        background:"rgba(226,75,74,0.1)",
                        border:"1px solid rgba(226,75,74,0.25)",
                        color:"#E24B4A", fontSize:11, fontWeight:500,
                        cursor:"pointer", transition:"all 0.15s",
                        flexShrink:0,
                      }}
                    >
                      {isCancelling ? "…" : "Cancel order"}
                    </button>
                  )}
                </div>
              </div>

              {/* Items list */}
              <div style={{ padding:"4px 16px 8px" }}>
                {order.items?.map((item) => {
                  const itemCancelled = item.status === "cancelled";
                  const cancellable   = canCancelItem(order, item);
                  return (
                    <div
                      key={item._id}
                      style={{
                        display:"flex", alignItems:"center", gap:10,
                        padding:"10px 0",
                        borderBottom:"1px solid var(--border)",
                        opacity: itemCancelled ? 0.5 : 1,
                      }}
                    >
                      {/* Status icon */}
                      <div style={{ flexShrink:0, width:16, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {ITEM_ICON[item.status] || ITEM_ICON.pending}
                      </div>

                      {/* Item name + notes */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{
                          fontSize:13,
                          color: itemCancelled ? "var(--text-3)" : "var(--text)",
                          textDecoration: itemCancelled ? "line-through" : "none",
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                        }}>
                          {item.name}
                        </p>
                        {item.notes && (
                          <p style={{ fontSize:11, color:"var(--gold)", marginTop:2 }}>{item.notes}</p>
                        )}
                      </div>

                      {/* Price */}
                      <div style={{ textAlign:"right", flexShrink:0, marginRight:8 }}>
                        <p style={{ fontSize:11, color:"var(--text-3)" }}>×{item.quantity}</p>
                        <p style={{
                          fontSize:13, fontWeight:500,
                          color: itemCancelled ? "var(--text-3)" : "var(--gold)",
                          textDecoration: itemCancelled ? "line-through" : "none",
                        }}>
                          ₹{item.price * item.quantity}
                        </p>
                      </div>

                      {/* Per-item cancel button */}
                      <button
                        onClick={() => {
                          if (!cancellable) return;
                          if (window.confirm(`Remove ${item.name} from your order?`)) {
                            cancelItem({ orderId: order._id, itemId: item._id });
                          }
                        }}
                        disabled={!cancellable || isCancellingItem}
                        title={
                          itemCancelled ? "Already cancelled" :
                          !cancellable   ? `Cannot cancel — ${item.status}` :
                          `Cancel ${item.name}`
                        }
                        style={{
                          flexShrink:0,
                          width:28, height:28,
                          borderRadius:8,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          border:"1px solid",
                          // Active = red tint, disabled = faded gray
                          borderColor: cancellable
                            ? "rgba(226,75,74,0.3)"
                            : "var(--border)",
                          background: cancellable
                            ? "rgba(226,75,74,0.08)"
                            : "transparent",
                          color: cancellable
                            ? "#E24B4A"
                            : "var(--text-3)",
                          cursor: cancellable ? "pointer" : "not-allowed",
                          transition:"all 0.15s",
                          fontSize:10, fontWeight:500,
                        }}
                      >
                        {/* Show X when active, lock icon when not cancellable */}
                        {itemCancelled ? "✕" : cancellable ? "✕" : "🔒"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Order subtotal — only active items */}
              {!isCancelled && (() => {
                const activeItems = order.items?.filter((i) => i.status !== "cancelled") || [];
                const sub  = activeItems.reduce((a, i) => a + i.price * i.quantity, 0);
                const tax  = parseFloat((sub * 0.05).toFixed(2));
                const tot  = (sub + tax).toFixed(2);
                return (
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 16px", borderTop:"1px solid var(--border)" }}>
                    <span style={{ fontSize:12, color:"var(--text-3)" }}>Order total</span>
                    <span style={{ fontSize:13, fontWeight:500, color:"var(--text)" }}>₹{tot}</span>
                  </div>
                );
              })()}

              {/* Cancelled label */}
              {isCancelled && (
                <div style={{ padding:"10px 16px", borderTop:"1px solid rgba(226,75,74,0.15)", display:"flex", justifyContent:"center" }}>
                  <span style={{ fontSize:12, color:"#E24B4A" }}>Order cancelled</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Grand total bill */}
        {hasSomethingToPay && (
          <div style={{ background:"var(--glass-strong)", border:"1px solid var(--border-h)", borderRadius:16, padding:"16px" }}>
            <p style={{ fontSize:12, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:12 }}>
              Final bill
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {activeOrders.map((o) => {
                const activeItems = o.items?.filter((i) => i.status !== "cancelled") || [];
                const sub  = activeItems.reduce((a, i) => a + i.price * i.quantity, 0);
                if (sub === 0) return null;
                return (
                  <div key={o._id} style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"var(--text-3)" }}>
                    <span>{o.orderNumber}</span>
                    <span>₹{(sub * 1.05).toFixed(2)}</span>
                  </div>
                );
              })}
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:20, fontWeight:500, paddingTop:10, marginTop:4, borderTop:"1px solid var(--border)" }}>
                <span>Total to pay</span>
                <span style={{ color:"var(--gold)" }}>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, padding:"12px 24px 40px", background:"linear-gradient(to top, var(--bg) 60%, transparent)", display:"flex", flexDirection:"column", gap:10 }}>
        {billableOrder && (
          <button onClick={() => setBillOpen(true)} className="btn-gold" style={{ borderRadius:16 }}>
            {isRequestingBill
              ? <span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor:"rgba(0,0,0,0.2)", borderTopColor:"#0D0D0D" }} />
              : `Request bill · ₹${grandTotal.toFixed(2)}`
            }
          </button>
        )}
        {!allPaid && (
          <button onClick={() => navigate("/menu")} className="btn-ghost" style={{ borderRadius:16 }}>
            <Plus size={15} /> Add more items
          </button>
        )}
      </div>

      {/* Payment bottom sheet */}
      <BottomSheet isOpen={billOpen} onClose={() => setBillOpen(false)} title="How would you like to pay?">
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setPayMethod(m.id)}
              style={{
                display:"flex", alignItems:"center", gap:14,
                padding:"16px 18px", borderRadius:14,
                background: payMethod === m.id ? "rgba(201,168,76,0.1)" : "var(--glass)",
                border: payMethod === m.id ? "1.5px solid var(--gold)" : "1px solid var(--border)",
                cursor:"pointer", transition:"all 0.15s",
              }}
            >
              <span style={{ fontSize:20 }}>{m.icon}</span>
              <p style={{ fontSize:14, fontWeight:500, color: payMethod === m.id ? "var(--gold)" : "var(--text)" }}>
                {m.label}
              </p>
              {payMethod === m.id && (
                <div style={{ marginLeft:"auto", width:18, height:18, borderRadius:"50%", background:"var(--gold)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ color:"#0D0D0D", fontSize:11, fontWeight:700 }}>✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={() => { requestBill({ orderId: billableOrder._id, paymentMethod: payMethod }); setBillOpen(false); }}
          className="btn-gold"
          style={{ borderRadius:16 }}
        >
          Confirm — request bill
        </button>
      </BottomSheet>
    </div>
  );
}