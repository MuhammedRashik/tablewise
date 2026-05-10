const PositionBadge = ({ position, status }) => {
  if (status === "called") {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="w-28 h-28 rounded-full bg-brand-50 border-4 border-brand-400 flex items-center justify-center">
          <span className="text-4xl">🎉</span>
        </div>
        <p className="text-brand-600 font-medium text-sm mt-2">Your table is ready!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-28 h-28 rounded-full bg-brand-50 border-4 border-brand-200 flex items-center justify-center">
        <span className="text-5xl font-semibold text-brand-600">{position ?? "—"}</span>
      </div>
      <p className="text-gray-500 text-xs mt-1">your position</p>
    </div>
  );
};
export default PositionBadge;