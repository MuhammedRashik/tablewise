const Input = ({
  label, value, onChange, placeholder = "",
  type = "text", error = "", disabled = false,
  inputMode, maxLength, className = "",
}) => (
  <div className="flex flex-col gap-2">
    {label && (
      <label style={{ color: "var(--text-2)", fontSize: "12px", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      inputMode={inputMode}
      maxLength={maxLength}
      className={`input-dark ${disabled ? "opacity-40" : ""} ${className}`}
    />
    {error && (
      <p style={{ color: "var(--red)", fontSize: "12px" }}>{error}</p>
    )}
  </div>
);
export default Input;