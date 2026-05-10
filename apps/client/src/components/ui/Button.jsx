import { useRef } from "react";

const Button = ({
  children, onClick, variant = "gold",
  disabled = false, loading = false,
  className = "", type = "button", size = "lg",
}) => {
  const base  = variant === "gold" ? "btn-gold" : "btn-ghost";
  const small = size === "sm" ? "!h-10 !text-xs px-4 !w-auto" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${small} ${className}`}
    >
      {loading ? (
        <span
          className="w-4 h-4 rounded-full border-2 animate-spin"
          style={{ borderColor: "rgba(0,0,0,0.2)", borderTopColor: "#0D0D0D" }}
        />
      ) : children}
    </button>
  );
};

export default Button