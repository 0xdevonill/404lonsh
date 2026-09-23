/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0a0b0d",
        neon: "#ccff00",
        mint: "#7fe7d8",
        lime: "#baf25a",
      },
      fontFamily: {
        sans: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Chakra Petch", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(204,255,0,.25), 0 8px 40px -8px rgba(204,255,0,.35)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(204,255,0,.35)" },
          "50%": { boxShadow: "0 0 0 10px rgba(204,255,0,0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 2.6s ease-in-out infinite",
        marquee: "marquee 42s linear infinite",
      },
    },
  },
  plugins: [],
};
