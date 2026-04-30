/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f1fbec',
          100: '#e0f7d3',
          200: '#c3f0a7',
          300: '#a2e678',
          400: '#8bd856',
          500: '#7BC74D',
          600: '#63a63e',
          700: '#4c842f',
          800: '#386421',
          900: '#274417',
          950: '#17280d',
        },
        surface: {
          50:  '#f7f7f7',
          100: '#eeeeee',
          200: '#d9d9db',
          300: '#b9bbbf',
          400: '#8b8f97',
          500: '#393E46',
          600: '#2f333a',
          700: '#25282e',
          800: '#1d1f24',
          900: '#15171b',
          950: '#222831',
        },
        accent: {
          500: '#EEEEEE',
        },
      },
      fontFamily: {
        sans: ['"Urbanist"', 'Georgia', 'serif'],
        display: ['"Urbanist"', 'Georgia', 'serif'],
        formal: ['"Urbanist"', 'Georgia', 'serif'],
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


