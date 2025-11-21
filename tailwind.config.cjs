/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        glass: "rgba(255,255,255,0.05)",
      },
      boxShadow: {
        neon: "0 0 25px rgba(0,150,255,0.4)",
      },
    },
  },
  plugins: [],
};
