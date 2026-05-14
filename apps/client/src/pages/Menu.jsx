import { useState } from "react";
import { ShoppingBag, Receipt } from "lucide-react";
import { useQueueStore } from "../store/queueStore";
import { useOrderStore } from "../store/orderStore";
import { useMenu } from "../hooks/useMenu";
import { useOrder } from "../hooks/useOrder";
import MenuItemCard from "../components/menu/MenuItemCard";
import CartDrawer from "../components/menu/CartDrawer";
import Spinner from "../components/ui/Spinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import { useNavigate } from "react-router-dom";

const CAT_LABELS = {
  starter:"Starters", main:"Mains", bread:"Breads", rice:"Rice",
  dessert:"Desserts", beverage:"Drinks", sides:"Sides", specials:"Specials",
};

export default function Menu() {
  const navigate      = useNavigate();
  const { entry }     = useQueueStore();
  const restaurantId  = entry?.restaurantId;
  const tableId       = entry?.assignedTableId?._id || entry?.assignedTableId;
  const [cartOpen, setCartOpen] = useState(false);
  const { cart, cartCount, cartTotal } = useOrderStore();
  const { activeOrder } = useOrderStore(); // ← get active order

  const {
    menu, categories, restaurant, isLoading, error,
    vegFilter, setVegFilter, activeCategory, setActiveCategory,
  } = useMenu(restaurantId);

  const { placeOrder, isPlacing } = useOrder(restaurantId);

  const handlePlaceOrder = () => {
    if (!tableId) { alert("No table assigned. Please check with staff."); return; }
    placeOrder({ tableId });
    setCartOpen(false);
  };

  if (isLoading) {
    return <div className="screen" style={{ alignItems:"center", justifyContent:"center" }}><Spinner size="lg" /></div>;
  }
  if (error) {
    return <div className="screen"><ErrorMessage message={error} /></div>;
  }

  const count = cartCount();

  return (
    <div className="screen">
      {/* ── Sticky header ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 30,
        background: "rgba(13,13,13,0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 20px",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop: 52, paddingBottom: 14 }}>
          <div>
            <h1 style={{ fontSize: 22, lineHeight: 1.1 }}>Menu</h1>
            <p style={{ fontSize: 12, color:"var(--text-3)", marginTop: 2 }}>{restaurant?.name}</p>
          </div>
          <div style={{ display:"flex", gap: 8, alignItems:"center" }}>
            {/* View current order button */}
            {activeOrder && (
              <button
                onClick={() => navigate("/order-tracker")}
                style={{
                  display:"flex", alignItems:"center", gap: 6,
                  background:"var(--glass)", border:"1px solid var(--border)",
                  borderRadius: 12, padding:"8px 12px",
                  fontSize: 12, fontWeight: 500, color:"var(--text-2)",
                  cursor:"pointer",
                }}
              >
                <Receipt size={14} />
                My order
              </button>
            )}
            {count > 0 && (
              <button
                onClick={() => setCartOpen(true)}
                style={{
                  display:"flex", alignItems:"center", gap: 8,
                  background:"var(--gold)", color:"#0D0D0D",
                  borderRadius: 12, padding:"8px 14px",
                  fontSize: 13, fontWeight: 500, border:"none", cursor:"pointer",
                }}
              >
                <ShoppingBag size={14} />
                {count}
              </button>
            )}
          </div>
        </div>

        {/* Veg filter */}
        <div style={{ display:"flex", gap: 8, paddingBottom: 12 }}>
          {[{label:"All",val:null},{label:"🟢 Veg",val:true},{label:"🔴 Non-veg",val:false}].map((f) => (
            <button
              key={String(f.val)}
              onClick={() => setVegFilter(vegFilter === f.val ? null : f.val)}
              style={{
                padding:"6px 14px", borderRadius: 30, fontSize: 12, fontWeight: 500,
                background: vegFilter === f.val ? "var(--gold)" : "var(--glass)",
                color: vegFilter === f.val ? "#0D0D0D" : "var(--text-2)",
                border: vegFilter === f.val ? "none" : "1px solid var(--border)",
                cursor:"pointer", transition:"all 0.15s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Category tabs */}
        <div style={{ display:"flex", gap: 8, overflowX:"auto", paddingBottom: 14 }} className="scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              style={{
                padding:"7px 16px", borderRadius: 30, fontSize: 12, fontWeight: 500,
                whiteSpace:"nowrap", flexShrink: 0,
                background: activeCategory === cat ? "#F0EDE8" : "var(--glass)",
                color: activeCategory === cat ? "#0D0D0D" : "var(--text-2)",
                border: activeCategory === cat ? "none" : "1px solid var(--border)",
                cursor:"pointer", transition:"all 0.15s",
              }}
            >
              {CAT_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Active order summary banner ── */}
      {activeOrder && (
        <div
          onClick={() => navigate("/order-tracker")}
          style={{
            margin:"12px 20px 0",
            background:"rgba(201,168,76,0.08)",
            border:"1px solid rgba(201,168,76,0.2)",
            borderRadius: 14, padding:"12px 16px",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            cursor:"pointer",
          }}
        >
          <div>
            <p style={{ fontSize:13, fontWeight:500, color:"var(--gold)" }}>
              Active order — {activeOrder.orderNumber}
            </p>
            <p style={{ fontSize:11, color:"var(--text-3)", marginTop: 3 }}>
              {activeOrder.items?.length} items · ₹{activeOrder.total} total · tap to view
            </p>
          </div>
          <div style={{ fontSize:18, color:"var(--gold)" }}>↗</div>
        </div>
      )}

      {/* ── Menu items ── */}
      <div style={{ flex:1, padding:"8px 20px 120px" }}>
        {Object.entries(menu).map(([cat, items]) => items.length > 0 && (
          <div key={cat} style={{ marginTop: 28 }}>
            <div style={{ display:"flex", alignItems:"center", gap: 12, marginBottom: 4 }}>
              <h2 style={{ fontSize: 18 }}>{CAT_LABELS[cat] || cat}</h2>
              <div style={{ flex:1, height:1, background:"var(--border)" }} />
              <span style={{ fontSize:12, color:"var(--text-3)" }}>{items.length}</span>
            </div>
            <div>
              {items.map((item) => <MenuItemCard key={item._id} item={item} />)}
            </div>
          </div>
        ))}
      </div>

      {/* ── Sticky cart bar ── */}
      {count > 0 && (
        <div style={{
          position:"fixed", bottom:0, left:0, right:0,
          padding:"12px 20px 32px",
          background:"linear-gradient(to top, var(--bg) 60%, transparent)",
        }}>
          <button
            onClick={() => setCartOpen(true)}
            className="btn-gold"
            style={{ borderRadius:18, boxShadow:"0 8px 32px rgba(201,168,76,0.25)" }}
          >
            <ShoppingBag size={17} />
            <span style={{ flex:1, textAlign:"center" }}>View cart · {count} items</span>
            <span>₹{(cartTotal() * 1.05).toFixed(0)}</span>
          </button>
        </div>
      )}

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onPlaceOrder={handlePlaceOrder}
        isPlacing={isPlacing}
      />
    </div>
  );
}