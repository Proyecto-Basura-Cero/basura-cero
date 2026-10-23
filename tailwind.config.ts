import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  // Clases de color derivadas del tipo de reto (viven en objetos de datos en
  // src/lib/challenge-types.ts). Safelist para garantizar que Tailwind las
  // genere aunque se construyan dinamicamente.
  safelist: [
    "bg-eco-400",
    "bg-sky-400",
    "bg-sun-400",
    "bg-grape-400",
    "text-eco-900",
    "text-sky-900",
    "text-sun-600",
    "text-grape-600"
  ],
  theme: {
    extend: {
      colors: {
        // Verde de marca (escala completa). 500 y 700 conservan los valores originales.
        eco: {
          50: "#f3faf5",
          100: "#dff5e6",
          200: "#baeacc",
          300: "#86dca6",
          400: "#4cc07e",
          500: "#2a9d5b",
          600: "#1f8a4e",
          700: "#1f7a46",
          800: "#195f38",
          900: "#144c2e"
        },
        // Acentos infantiles por significado (estilo Duolingo).
        // sun: recompensa / XP / racha
        sun: {
          50: "#fffbea",
          100: "#fff4cc",
          300: "#ffdf70",
          400: "#ffcf33",
          500: "#f4b000",
          600: "#b8860b"
        },
        // sky: juego / pistas / información
        sky: {
          50: "#e0f4fe",
          100: "#bae6fd",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0c6a9c",
          700: "#075985"
        },
        // coral: error amable / ánimo (no punitivo)
        coral: {
          50: "#fff1f1",
          100: "#ffe0e0",
          400: "#ff6b6b",
          500: "#e23d3d",
          600: "#c42b2b"
        },
        // grape: insignias raras / premium
        grape: {
          50: "#f5f1ff",
          100: "#ede4ff",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"]
      },
      gridTemplateColumns: {
        // 13 columnas: 52 semanas en 4 filas exactas (calendario compacto).
        13: "repeat(13, minmax(0, 1fr))"
      },
      keyframes: {
        // aparicion con rebotito
        pop: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "70%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        // celebracion: balanceo alegre
        wiggle: {
          "0%, 100%": { transform: "rotate(-6deg)" },
          "50%": { transform: "rotate(6deg)" }
        },
        // error amable: sacudida corta horizontal
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-5px)" },
          "40%, 80%": { transform: "translateX(5px)" }
        },
        // flotar suave (idle)
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" }
        },
        // caida de confeti
        "confetti-fall": {
          "0%": { transform: "translateY(-20px) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(320px) rotate(540deg)", opacity: "0" }
        }
      },
      animation: {
        pop: "pop 0.35s ease-out",
        wiggle: "wiggle 0.6s ease-in-out 2",
        shake: "shake 0.4s ease-in-out",
        float: "float 3s ease-in-out infinite",
        "confetti-fall": "confetti-fall 1.4s ease-in forwards"
      }
    }
  },
  plugins: []
};

export default config;
