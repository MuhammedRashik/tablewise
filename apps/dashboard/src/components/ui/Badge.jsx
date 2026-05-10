const VARIANTS = {
  green:  "bg-brand-50 text-brand-800 border border-brand-100",
  red:    "bg-red-50 text-red-700 border border-red-100",
  amber:  "bg-amber-50 text-amber-700 border border-amber-100",
  blue:   "bg-blue-50 text-blue-700 border border-blue-100",
  gray:   "bg-gray-100 text-gray-600",
  purple: "bg-purple-50 text-purple-700 border border-purple-100",
};
const Badge = ({ children, variant = "gray", className = "" }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${VARIANTS[variant]} ${className}`}>
    {children}
  </span>
);
export default Badge;