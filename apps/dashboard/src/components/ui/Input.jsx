const Input = ({ label, value, onChange, placeholder = "", type = "text", error = "", className = "", ...rest }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-medium text-gray-600">{label}</label>}
    <input
      type={type} value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`input-base ${error ? "border-red-400" : ""} ${className}`}
      {...rest}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);
export default Input;