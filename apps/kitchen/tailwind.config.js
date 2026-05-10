/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#E1F5EE",
          100: "#9FE1CB",
          400: "#1D9E75",
          600: "#0F6E56",
          800: "#085041",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      // Kitchen display uses large readable text
      fontSize: {
        "kot-xl": ["2rem",    { lineHeight: "1.1", fontWeight: "600" }],
        "kot-lg": ["1.25rem", { lineHeight: "1.3", fontWeight: "500" }],
        "kot-md": ["1rem",    { lineHeight: "1.4", fontWeight: "400" }],
        "kot-sm": ["0.875rem",{ lineHeight: "1.4", fontWeight: "400" }],
      },
      keyframes: {
        "pulse-ring": {
          "0%,100%": { transform: "scale(1)",    opacity: "1"   },
          "50%":      { transform: "scale(1.05)", opacity: "0.8" },
        },
        "slide-in": {
          from: { transform: "translateY(-8px)", opacity: "0" },
          to:   { transform: "translateY(0)",    opacity: "1" },
        },
        "flash-new": {
          "0%,100%": { borderColor: "transparent"  },
          "50%":      { borderColor: "#1D9E75"      },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
        "slide-in":   "slide-in 0.2s ease-out",
        "flash-new":  "flash-new 1s ease-in-out 3",
      },
    },
  },
  plugins: [],
};