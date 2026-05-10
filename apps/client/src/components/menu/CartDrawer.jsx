import { ShoppingBag, Trash2 } from "lucide-react";
import BottomSheet from "../ui/BottomSheet";
import VegBadge from "./VegBadge";
import { useOrderStore } from "../../store/orderStore";

export default function CartDrawer({ isOpen, onClose, onPlaceOrder, isPlacing }) {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount } = useOrderStore();
  const subtotal = cartTotal();
  const tax      = parseFloat((subtotal * 0.05).toFixed(2));
  const total    = (subtotal + tax).toFixed(2);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Your order">
      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <ShoppingBag size={36} color="var(--text-3)" style={{ margin: "0 auto 10px" }} />
          <p style={{ color: "var(--text-3)", fontSize: 14 }}>Your cart is empty</p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
            {cart.map((item) => (
              <div key={item.menuItemId} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <VegBadge isVeg={item.isVeg} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-3)" }}>₹{item.price} each</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} style={{ width: 26, height: 26, borderRadius: 8, background: "var(--bg3)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)", fontSize: 16 }}>−</button>
                  <span style={{ fontSize: 14, fontWeight: 500, minWidth: 14, textAlign: "center" }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} style={{ width: 26, height: 26, borderRadius: 8, background: "var(--gold)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#0D0D0D" }}>+</button>
                  <button onClick={() => removeFromCart(item.menuItemId)} style={{ marginLeft: 4, background: "none", border: "none", cursor: "pointer", color: "var(--text-3)" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bill breakdown */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginBottom: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-2)" }}>
              <span>Subtotal ({cartCount()} items)</span><span>₹{subtotal}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-2)" }}>
              <span>GST (5%)</span><span>₹{tax}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 500, marginTop: 4 }}>
              <span>Total</span>
              <span style={{ color: "var(--gold)" }}>₹{total}</span>
            </div>
          </div>

          <button
            onClick={onPlaceOrder}
            disabled={isPlacing}
            className="btn-gold"
          >
            {isPlacing ? (
              <span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(0,0,0,0.2)", borderTopColor: "#0D0D0D" }} />
            ) : (
              <>Place order · ₹{total}</>
            )}
          </button>
        </>
      )}
    </BottomSheet>
  );
}