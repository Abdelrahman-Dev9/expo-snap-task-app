/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand — deep indigo primary with a warm coral accent.
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        accent: {
          400: "#fb7185",
          500: "#f43f5e",
        },
        // Neutral surface tokens.
        surface: "#ffffff",
        canvas: "#f6f7fb",
        ink: {
          900: "#0f172a",
          700: "#334155",
          500: "#64748b",
          400: "#94a3b8",
          200: "#e2e8f0",
          100: "#f1f5f9",
        },
      },
      borderRadius: {
        "2xl": "20px",
        "3xl": "28px",
      },
      fontSize: {
        display: ["34px", { lineHeight: "40px", letterSpacing: "-0.5px" }],
      },
    },
  },
  plugins: [],
};
