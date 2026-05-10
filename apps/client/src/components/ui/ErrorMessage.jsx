export default function ErrorMessage({ message, onRetry }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 32 }}>⚠</div>
      <p style={{ color: "var(--text-2)", fontSize: 14 }}>{message || "Something went wrong"}</p>
      {onRetry && (
        <button onClick={onRetry} style={{ color: "var(--gold)", fontSize: 13, textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>
          Try again
        </button>
      )}
    </div>
  );
}