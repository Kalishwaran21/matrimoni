/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        maroon: {
          50:  "#fff1f4",
          100: "#ffe4ea",
          200: "#fecdd8",
          300: "#fda4ba",
          400: "#fb7193",
          500: "#be244d",
          600: "#9f1239",
          700: "#881337",
          800: "#6b0f2d",
          900: "#4c0519",
          950: "#2d0310"
        },
        rosegold: "#c98f7a"
      },
      boxShadow: {
        soft:  "0 4px 24px rgba(76, 5, 25, 0.08)",
        md:    "0 8px 32px rgba(76, 5, 25, 0.12)",
        lg:    "0 16px 48px rgba(76, 5, 25, 0.16)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system"],
        display: ["Inter", "ui-sans-serif", "system-ui"]
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem"
      },
      animation: {
        "slide-in": "slide-in 0.3s ease-out",
        "fade-up":  "fade-up 0.4s ease-out"
      },
      keyframes: {
        "slide-in": {
          "0%":   { opacity: "0", transform: "translateX(100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};
