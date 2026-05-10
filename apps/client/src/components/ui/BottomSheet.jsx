import { useEffect } from "react";

export default function BottomSheet({ isOpen, onClose, title, children }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />
      <div
        className="relative anim-slide-up"
        style={{
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: "28px 28px 0 0",
          maxHeight: "88vh",
          overflowY: "auto",
        }}
      >
        <div style={{ width: 36, height: 4, background: "var(--border-h)", borderRadius: 2, margin: "14px auto 0" }} />
        {title && (
          <div style={{ padding: "16px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 16, fontFamily: "'Playfair Display',serif" }}>{title}</h3>
            <button onClick={onClose} style={{ color: "var(--text-3)", fontSize: 20, lineHeight: 1, background: "none", border: "none", cursor: "pointer" }}>✕</button>
          </div>
        )}
        <div style={{ padding: "16px 24px 40px" }}>{children}</div>
      </div>
    </div>
  );
}