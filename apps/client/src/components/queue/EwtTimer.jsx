const EwtTimer = ({ minutes }) => {
  if (!minutes || minutes === 0) return null;

  const hrs  = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const display = hrs > 0 ? `${hrs}h ${mins}m` : `~${mins} min`;

  return (
    <div className="card text-center py-3">
      <p className="text-2xl font-semibold text-gray-900">{display}</p>
      <p className="text-xs text-gray-400 mt-0.5">estimated wait</p>
    </div>
  );
};
export default EwtTimer;