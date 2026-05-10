/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      screens: {
        xs: "375px",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body:    ["'DM Sans'",          "sans-serif"],
      },
      borderRadius: {
        "2xl": "20px",
        "3xl": "28px",
      },
      keyframes: {
        "slide-up": {
          from: { transform: "translateY(100%)", opacity: "0" },
          to:   { transform: "translateY(0)",    opacity: "1" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.35s cubic-bezier(.16,1,.3,1) both",
      },
    },
  },
  plugins: [],
};