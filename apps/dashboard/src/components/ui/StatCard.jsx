const StatCard = ({ label, value, sub, color = "gray", icon: Icon }) => {
  const colors = {
    green:  "text-brand-600 bg-brand-50",
    amber:  "text-amber-600 bg-amber-50",
    blue:   "text-blue-600 bg-blue-50",
    red:    "text-red-500 bg-red-50",
    gray:   "text-gray-500 bg-gray-100",
    purple: "text-purple-600 bg-purple-50",
  };
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        {Icon && (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors[color]}`}>
            <Icon size={14} />
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
};
export default StatCard;