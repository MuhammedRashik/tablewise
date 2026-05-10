import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, Clock, CheckCircle, Plus } from "lucide-react";
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
  { id: "upi",  label: "UPI / GPay / PhonePe", icon: "📱" },
  { id: "cash", label: "Cash",                 icon: "💵" },
  { id: "card", label: "Card / Tap",           icon: "💳" },
];

export default function OrderTracker() {
  const navigate = useNavigate();
  const { activeOrder } = useOrderStore();
  const restaurantId    = activeOrder?.restaurantId;
  const { requestBill, isRequestingBill } = useOrder(restaurantId);
  const [billOpen, setBillOpen]         = useState(false);
  const [payMethod, setPayMethod]       = useState("upi");

  if (!activeOrder) {
    return (
      <div className="screen" style={{ alignItems: "center", justifyContent: "center", padding: "0 24px", textAlign: "center" }}>
        <p style={{ color: "var(--text-2)", marginBottom: 12 }}>No active order</p>
        <button onClick={() => navigate("/menu")} style={{ color: "var(--gold)", fontSize: 14, textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>
          Go to menu
        </button>
      </div>
    );
  }

  const canRequestBill = activeOrder.status === "served";
  const isPaid         = activeOrder.status === "paid";

  return (
    <div className="screen">
      <div className="orb" style={{ width: 400, height: 400, background: "var(--gold)", top: -150, right: -150 }} />

      <div style={{ position: "relative", padding: "56px 24px 0", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <div className="anim-fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 12, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {activeOrder.orderNumber}
            </p>
            <h1 style={{ fontSize: 26, marginTop: 4 }}>Your order</h1>
          </div>
          <OrderStatusChip status={activeOrder.status} />
        </div>

        {/* Status banner */}
        {activeOrder.status === "preparing" && (
          <div className="anim-fade-in glass" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px" }}>
            <ChefHat size={20} color="var(--gold)" />
            <div>
              <p style={{ fontSize: 14, fontWeight: 500 }}>Being prepared</p>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Your food is almost ready!</p>
            </div>
          </div>
        )}
        {isPaid && (
          <div className="anim-scale-in glass" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px", textAlign: "center", borderColor: "rgba(29,158,117,0.3)" }}>
            <CheckCircle size={36} color="var(--green)" style={{ marginBottom: 10 }} />
            <p style={{ fontSize: 16, fontWeight: 500 }}>Payment confirmed</p>
            <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>Enjoy your meal!</p>
          </div>
        )}

        {/* Items */}
        <div className="anim-fade-up delay-1 glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontSize: 12, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Items</p>
          </div>
          <div style={{ padding: "4px 18px 14px" }}>
            {activeOrder.items?.map((item) => (
              <div key={item._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                {ITEM_ICON[item.status] || ITEM_ICON.pending}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 14, color: item.status === "served" ? "var(--text-3)" : "var(--text)",
                    textDecoration: item.status === "served" ? "line-through" : "none",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {item.name}
                  </p>
                  {item.notes && <p style={{ fontSize: 11, color: "var(--gold)", marginTop: 2 }}>{item.notes}</p>}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 11, color: "var(--text-3)" }}>×{item.quantity}</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gold)" }}>₹{item.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bill */}
        <div className="anim-fade-up delay-2 glass" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-3)" }}>
            <span>Subtotal</span><span>₹{activeOrder.subtotal}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-3)" }}>
            <span>GST (5%)</span><span>₹{activeOrder.tax}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 500, paddingTop: 8, borderTop: "1px solid var(--border)", marginTop: 4 }}>
            <span>Total</span>
            <span style={{ color: "var(--gold)" }}>₹{activeOrder.total}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="anim-fade-up delay-3" style={{ paddingBottom: 48, display: "flex", flexDirection: "column", gap: 12, marginTop: "auto" }}>
          {canRequestBill && (
            <button onClick={() => setBillOpen(true)} className="btn-gold" style={{ borderRadius: 16 }}>
              {isRequestingBill
                ? <span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(0,0,0,0.2)", borderTopColor: "#0D0D0D" }} />
                : "Request bill"
              }
            </button>
          )}
          <button
            onClick={() => navigate("/menu")}
            className="btn-ghost"
            style={{ borderRadius: 16 }}
          >
            <Plus size={15} /> Add more items
          </button>
        </div>
      </div>

      {/* Payment method sheet */}
      <BottomSheet isOpen={billOpen} onClose={() => setBillOpen(false)} title="How would you like to pay?">
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setPayMethod(m.id)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "16px 18px", borderRadius: 14,
                background: payMethod === m.id ? "rgba(201,168,76,0.1)" : "var(--glass)",
                border: payMethod === m.id ? "1.5px solid var(--gold)" : "1px solid var(--border)",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 20 }}>{m.icon}</span>
              <p style={{ fontSize: 14, fontWeight: 500, color: payMethod === m.id ? "var(--gold)" : "var(--text)" }}>
                {m.label}
              </p>
              {payMethod === m.id && (
                <div style={{ marginLeft: "auto", width: 18, height: 18, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#0D0D0D", fontSize: 11, fontWeight: 700 }}>✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={() => { requestBill({ orderId: activeOrder._id, paymentMethod: payMethod }); setBillOpen(false); }}
          className="btn-gold"
          style={{ borderRadius: 16 }}
        >
          Confirm — request bill
        </button>
      </BottomSheet>
    </div>
  );
}