/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cal: {
          bg: "#ffffff",
          subtle: "#F3F4F6",
          border: "#E1E1E1",
          text: "#111827",
          muted: "#6B7280",
        },
      },
    },
  },
  plugins: [],
};
