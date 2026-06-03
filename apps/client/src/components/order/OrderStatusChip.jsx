const MAP = {
  placed:    { label: "Order placed",  bg: "rgba(55,138,221,0.15)", color: "#85B7EB"  },
  confirmed: { label: "Confirmed",     bg: "rgba(127,119,221,0.15)",color: "#AFA9EC"  },
  preparing: { label: "Preparing…",    bg: "rgba(201,168,76,0.15)", color: "#C9A84C"  },
  served:    { label: "Served",        bg: "rgba(29,158,117,0.15)", color: "#25C490"  },
  billed:    { label: "Bill raised",   bg: "rgba(255,255,255,0.06)",color: "#A09890"  },
  paid:      { label: "Paid",          bg: "rgba(29,158,117,0.15)", color: "#25C490"  },
  cancelled: { label: "Cancelled",     bg: "rgba(226,75,74,0.15)",  color: "#E24B4A"  },
};

export default function OrderStatusChip({ status }) {
  const s = MAP[status] || MAP.placed;
  return (
   <span
  style={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
    background: s.bg,
    color: s.color,
    textAlign: "center",
    minWidth: "100px", // optional
  }}
>
  {status === "preparing" && (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: s.color,
        display: "inline-block",
        animation: "pulse-soft 1.2s ease-in-out infinite",
      }}
    />
  )}
  {s.label}
</span>
  );
}