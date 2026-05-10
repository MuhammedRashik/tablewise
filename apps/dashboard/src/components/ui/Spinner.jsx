const Spinner = ({ size = "md" }) => {
  const s = { sm: "w-4 h-4 border-2", md: "w-6 h-6 border-2", lg: "w-10 h-10 border-2" }[size];
  return <div className={`${s} border-brand-200 border-t-brand-400 rounded-full animate-spin`} />;
};
export default Spinner;