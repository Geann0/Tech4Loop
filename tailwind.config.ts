import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0F2A", // Novo fundo azul-marinho da logo
        "neon-blue": "#00D1FF", // Novo azul ciano da logo
        "electric-purple": "#934CFF", // Novo roxo da logo
        "burnt-orange": "#FF8C00",
      },
      fontFamily: {
        sans: ["Poppins", "Roboto", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 15px 5px rgba(0, 191, 255, 0.3)", // Efeito glow azul neon
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
export default config;
