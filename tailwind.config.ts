import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          50: "#f3faf5",
          100: "#dff5e6",
          500: "#2a9d5b",
          700: "#1f7a46"
        }
      }
    }
  },
  plugins: []
};

export default config;
