export default function Spinner({ size = "md" }) {
  const s = { sm: 16, md: 28, lg: 44 }[size] || 28;
  return (
    <div
      className="rounded-full border-2 animate-spin"
      style={{
        width: s, height: s,
        borderColor: "var(--border-h)",
        borderTopColor: "var(--gold)",
      }}
    />
  );
}