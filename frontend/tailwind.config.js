/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dde7ff',
          200: '#b3caff',
          300: '#809dff',
          400: '#4d6ef5',
          500: '#2a4fd4',
          600: '#1a38b3',
          700: '#122790',
          800: '#0d1e70',
          900: '#08134d',
          950: '#050d33',
        },
        surface: {
          50:  '#f8f9fb',
          100: '#f0f2f7',
          200: '#e3e7f0',
          300: '#ced4e3',
          400: '#9aa3be',
          500: '#6b7699',
          600: '#4e5878',
          700: '#363d5a',
          800: '#1e2235',
          900: '#141728',
          950: '#0d0f1e',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Syne"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
        'glow': '0 0 20px rgba(42,79,212,0.15)',
      }
    },
  },
  plugins: [],
}
