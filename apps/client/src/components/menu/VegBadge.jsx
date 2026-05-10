export default function VegBadge({ isVeg }) {
  return isVeg
    ? <span className="veg-box" title="Veg" />
    : <span className="nonveg-box" title="Non-veg" />;
}