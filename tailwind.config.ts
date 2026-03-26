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
        ink:     '#0e0e0e',
        paper:   '#f7f5f0',
        emerald: { DEFAULT: '#1a6b4a', light: '#e8f5ee', dark: '#0f3d2a' },
        gold:    { DEFAULT: '#c9a84c', light: '#fdf6e3' },
      },
    },
  },
  plugins: [],
}
export default config