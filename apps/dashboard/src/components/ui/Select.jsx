const Select = ({ label, value, onChange, options = [], className = "" }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-medium text-gray-600">{label}</label>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`input-base bg-white ${className}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);
export default Select;