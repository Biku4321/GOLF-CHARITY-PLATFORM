import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans:    ['DM Sans', 'sans-serif'],
      },
      colors: {
        ink:     '#111827',
        paper:   '#fdfcf9',
        emerald: { 
          DEFAULT: '#10b981', 
          light: '#d1fae5', 
          dark: '#059669' 
        },
        gold: { 
          DEFAULT: '#fbbf24', 
          light: '#fef3c7' 
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease both',
        'fade-in': 'fadeIn 0.5s ease both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}

export default config