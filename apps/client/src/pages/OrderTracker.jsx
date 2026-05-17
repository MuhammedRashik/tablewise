import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, Clock, CheckCircle, Plus, ArrowLeft } from "lucide-react";
import { useOrderStore } from "../store/orderStore";
import { useOrder } from "../hooks/useOrder";
import OrderStatusChip from "../components/order/OrderStatusChip";
import BottomSheet from "../components/ui/BottomSheet";

const ITEM_ICON = {
  pending:   <Clock size={13} color="var(--text-3)" />,
  preparing: <ChefHat size={13} color="var(--gold)" />,
  served:    <CheckCircle size={13} color="var(--green)" />,
};

const PAYMENT_METHODS = [
  { id:"upi",  label:"UPI / GPay / PhonePe", icon:"📱" },
  { id:"cash", label:"Cash",                 icon:"💵" },
  { id:"card", label:"Card / Tap",           icon:"💳" },
];

export default function OrderTracker() {
  const navigate     = useNavigate();
  const {
    activeOrder,
    allSessionOrders, // ← we'll add this to the store
  } = useOrderStore();

  const restaurantId = activeOrder?.restaurantId;
  const { requestBill, isRequestingBill, cancelOrder, isCancelling } = useOrder(restaurantId);
  const [billOpen, setBillOpen]   = useState(false);
  const [payMethod, setPayMethod] = useState("upi");

  // Use allSessionOrders if available, else fall back to activeOrder only
  const orders = allSessionOrders?.length > 0
    ? allSessionOrders
    : activeOrder ? [activeOrder] : [];

  // Grand total across all session orders
 const activeOrders    = orders.filter((o) => o.status !== "cancelled");
const grandTotal      = activeOrders.reduce((sum, o) => sum + (o.total    || 0), 0);
const grandTax        = activeOrders.reduce((sum, o) => sum + (o.tax      || 0), 0);
const grandSub        = activeOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
const hasSomethingToPay = activeOrders.some((o) =>
  !["paid", "cancelled"].includes(o.status)
);

  // Latest unpaid order that can have bill requested
  const billableOrder = activeOrders.find((o) => o.status === "served");
  const allPaid       = orders.length > 0 && orders.every((o) => o.status === "paid");

  const cancellableOrder = orders.find((o) =>
  ["placed", "confirmed"].includes(o.status)
);

  if (orders.length === 0) {
    return (
      <div className="screen" style={{ alignItems:"center", justifyContent:"center", padding:"0 24px", textAlign:"center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🍽</div>
        <p style={{ color:"var(--text-2)", marginBottom: 12 }}>No active order</p>
        <button
          onClick={() => navigate("/menu")}
          style={{ color:"var(--gold)", fontSize:14, textDecoration:"underline", background:"none", border:"none", cursor:"pointer" }}
        >
          Go to menu
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="orb" style={{ width:400, height:400, background:"var(--gold)", top:-150, right:-150 }} />

      <div style={{ position:"relative", padding:"56px 24px 0", flex:1, display:"flex", flexDirection:"column", gap:16, overflowY:"auto", paddingBottom: 120 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom: 4 }}>
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
          <div style={{
            display:"flex", flexDirection:"column", alignItems:"center",
            background:"rgba(29,158,117,0.1)", border:"1px solid rgba(29,158,117,0.3)",
            borderRadius:16, padding:"20px 16px", textAlign:"center",
          }}>
            <CheckCircle size={32} color="var(--green)" style={{ marginBottom:8 }} />
            <p style={{ fontSize:16, fontWeight:500 }}>All bills settled!</p>
            <p style={{ fontSize:13, color:"var(--text-3)", marginTop:4 }}>Thank you, enjoy your meal 🙏</p>
          </div>
        )}

        {/* Each order */}
        {orders.map((order, idx) => (
  <div
    key={order._id}
    style={{
      background: order.status === "cancelled"
        ? "rgba(226,75,74,0.05)"        // ← red tint for cancelled
        : "var(--glass)",
      border: order.status === "cancelled"
        ? "1px solid rgba(226,75,74,0.2)"  // ← red border
        : "1px solid var(--border)",
      borderRadius: 16,
      overflow: "hidden",
      opacity: order.status === "cancelled" ? 0.6 : 1, // ← faded
    }}
  >
    {/* Order header */}
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 16px",
      borderBottom: "1px solid var(--border)",
      background: "rgba(255,255,255,0.03)",
    }}>
      <div>
        <p style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Order {idx + 1}
        </p>
        <p style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>
          {order.orderNumber}
        </p>
      </div>
      <OrderStatusChip status={order.status} />
    </div>

    {/* Items — strikethrough when cancelled */}
    <div style={{ padding: "8px 16px" }}>
      {order.items?.map((item) => (
        <div
          key={item._id}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 0",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ flexShrink: 0 }}>
            {order.status === "cancelled"
              ? <span style={{ fontSize: 12 }}>✕</span>
              : (ITEM_ICON[item.status] || ITEM_ICON.pending)
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 13,
              color: (item.status === "served" || order.status === "cancelled")
                ? "var(--text-3)"
                : "var(--text)",
              textDecoration: (item.status === "served" || order.status === "cancelled")
                ? "line-through"
                : "none",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {item.name}
            </p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ fontSize: 11, color: "var(--text-3)" }}>×{item.quantity}</p>
            <p style={{
              fontSize: 13, fontWeight: 500,
              color: order.status === "cancelled" ? "var(--text-3)" : "var(--gold)",
              textDecoration: order.status === "cancelled" ? "line-through" : "none",
            }}>
              ₹{item.price * item.quantity}
            </p>
          </div>
        </div>
      ))}
    </div>

    {/* Order subtotal */}
    <div style={{
      display: "flex", justifyContent: "space-between",
      padding: "10px 16px",
      borderTop: "1px solid var(--border)",
    }}>
      <span style={{ fontSize: 12, color: "var(--text-3)" }}>
        {order.status === "cancelled" ? "Cancelled" : "Order total"}
      </span>
      <span style={{
        fontSize: 13, fontWeight: 500,
        color: order.status === "cancelled" ? "var(--text-3)" : "var(--text)",
        textDecoration: order.status === "cancelled" ? "line-through" : "none",
      }}>
        ₹{order.total}
      </span>
    </div>
  </div>
))}

        {/* Grand total bill */}
        {/* Grand total — only show if there's something to pay */}
{hasSomethingToPay && (
  <div style={{
    background: "var(--glass-strong)",
    border: "1px solid var(--border-h)",
    borderRadius: 16, padding: "16px",
  }}>
    <p style={{ fontSize: 12, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
      Final bill
    </p>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-2)" }}>
        <span>Subtotal</span>
        <span>₹{grandSub.toFixed(2)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-2)" }}>
        <span>GST (5%)</span>
        <span>₹{grandTax.toFixed(2)}</span>
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontSize: 20, fontWeight: 500,
        paddingTop: 10, marginTop: 4,
        borderTop: "1px solid var(--border)",
      }}>
        <span>Total to pay</span>
        <span style={{ color: "var(--gold)" }}>₹{grandTotal.toFixed(2)}</span>
      </div>
    </div>
  </div>
)}
      </div>

      {/* Bottom actions */}
     {/* Bottom actions */}
<div style={{
  position: "fixed", bottom: 0, left: 0, right: 0,
  padding: "12px 24px 40px",
  background: "linear-gradient(to top, var(--bg) 60%, transparent)",
  display: "flex", flexDirection: "column", gap: 10,
}}>
  {billableOrder && (
    <button
      onClick={() => setBillOpen(true)}
      className="btn-gold"
      style={{ borderRadius: 16 }}
    >
      {isRequestingBill
        ? <span className="w-4 h-4 rounded-full border-2 animate-spin"
            style={{ borderColor:"rgba(0,0,0,0.2)", borderTopColor:"#0D0D0D" }} />
        : `Request bill · ₹${grandTotal.toFixed(2)}`
      }
    </button>
  )}

  {!allPaid && (
    <button
      onClick={() => navigate("/menu")}
      className="btn-ghost"
      style={{ borderRadius: 16 }}
    >
      <Plus size={15} /> Add more items
    </button>
  )}

  {/* Cancel order — only shown for placed or confirmed orders */}
  {cancellableOrder && (
    <button
      onClick={() => {
        if (window.confirm("Cancel this order? This cannot be undone.")) {
          cancelOrder(cancellableOrder._id);
        }
      }}
      disabled={isCancelling}
      style={{
        width: "100%", height: 48,
        borderRadius: 16, border: "1px solid rgba(226,75,74,0.3)",
        background: "transparent", color: "#E24B4A",
        fontSize: 14, fontWeight: 500, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}
    >
      {isCancelling ? "Cancelling…" : "Cancel order"}
    </button>
  )}
</div>

      {/* Payment method sheet */}
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
          onClick={() => {
            requestBill({ orderId: billableOrder._id, paymentMethod: payMethod });
            setBillOpen(false);
          }}
          className="btn-gold"
          style={{ borderRadius:16 }}
        >
          Confirm — request bill
        </button>
      </BottomSheet>
    </div>
  );
}