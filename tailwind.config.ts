import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // CORES DARK NOIR PREMIUM
      colors: {
        // Backgrounds
        noir: {
          950: '#0a0a0a',  // Background principal
          900: '#121212',  // Cards/Modais
          800: '#1a1a1a',  // Elementos elevados
          700: '#252525',  // Hover states
        },
        // Cor Primária - Dourado Champagne
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E5C158',
          dark: '#B8960F',
          muted: '#D4AF3720',
        },
        // Cor de Acento - Roxo Real
        royal: {
          DEFAULT: '#4B0082',
          light: '#6B238E',
          dark: '#3A006B',
          muted: '#4B008220',
        },
        // Textos
        silk: {
          100: '#F5F5F5',  // Títulos
          200: '#E0E0E0',  // Subtítulos
          300: '#A0A0A0',  // Texto secundário
          400: '#707070',  // Texto muted
          500: '#555555',  // Texto desabilitado
        },
      },
      
      // TIPOGRAFIA
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      
      // ANIMAÇÕES
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #D4AF37, 0 0 10px #D4AF3750' },
          '100%': { boxShadow: '0 0 10px #D4AF37, 0 0 20px #D4AF3780' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-gold': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      
      // TRANSIÇÕES
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.25, 0.8, 0.25, 1)',
      },
      
      // BACKDROP BLUR
      backdropBlur: {
        'xl': '24px',
        '2xl': '40px',
      },
      
      // BOX SHADOW
      boxShadow: {
        'gold': '0 0 20px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 0 40px rgba(212, 175, 55, 0.4)',
        'royal': '0 0 20px rgba(75, 0, 130, 0.3)',
        'card': '0 4px 30px rgba(0, 0, 0, 0.5)',
        'elevated': '0 8px 40px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
