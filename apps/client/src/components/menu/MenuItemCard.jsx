import { Plus, Minus } from "lucide-react";
import VegBadge from "./VegBadge";
import { useOrderStore } from "../../store/orderStore";

const SPICE = { mild: "🌶", medium: "🌶🌶", hot: "🌶🌶🌶", extra_hot: "🌶🌶🌶🌶" };

export default function MenuItemCard({ item }) {
  const { cart, addToCart, updateQuantity } = useOrderStore();
  const cartItem = cart.find((i) => i.menuItemId === item._id);
  const qty = cartItem?.quantity || 0;

  return (
    <div
      style={{
        display: "flex", gap: 14, padding: "14px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Photo */}
      {item.photoUrl ? (
        <img
          src={item.photoUrl}
          alt={item.name}
          style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover", flexShrink: 0 }}
        />
      ) : (
        <div
          style={{
            width: 72, height: 72, borderRadius: 12, flexShrink: 0,
            background: "var(--bg3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24,
          }}
        >
          🍽
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
          <VegBadge isVeg={item.isVeg} />
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.name}
          </p>
        </div>
        {item.description && (
          <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 6 }}>
            {item.description}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: "var(--gold)" }}>₹{item.price}</span>
          {item.spiceLevel && <span style={{ fontSize: 11 }}>{SPICE[item.spiceLevel]}</span>}
          {item.tags?.includes("bestseller") && (
            <span style={{ fontSize: 10, background: "rgba(201,168,76,0.15)", color: "var(--gold)", padding: "2px 8px", borderRadius: 20, fontWeight: 500, border: "1px solid rgba(201,168,76,0.2)" }}>
              bestseller
            </span>
          )}
        </div>
      </div>

      {/* Qty control */}
      <div style={{ display: "flex", alignItems: "flex-end", flexShrink: 0, paddingBottom: 2 }}>
        {qty === 0 ? (
          <button
            onClick={() => addToCart({ menuItemId: item._id, name: item.name, price: item.price, isVeg: item.isVeg })}
            style={{
              width: 34, height: 34, borderRadius: 10,
              background: "var(--gold)", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "transform 0.15s",
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <Plus size={16} color="#0D0D0D" />
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => updateQuantity(item._id, qty - 1)}
              style={{ width: 30, height: 30, borderRadius: 9, background: "var(--bg3)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Minus size={13} color="var(--text-2)" />
            </button>
            <span style={{ fontSize: 14, fontWeight: 500, minWidth: 16, textAlign: "center" }}>{qty}</span>
            <button
              onClick={() => addToCart({ menuItemId: item._id, name: item.name, price: item.price, isVeg: item.isVeg })}
              style={{ width: 30, height: 30, borderRadius: 9, background: "var(--gold)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Plus size={13} color="#0D0D0D" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}