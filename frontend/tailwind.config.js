/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: {
          50: '#FDFBF7',
          100: '#F9F6F0',
          200: '#F0EBE1',
          300: '#E1D7C6',
          400: '#D1C2A8',
          500: '#C2A884',
          900: '#524334',
        },
        brown: {
          50: '#F7F3F0',
          100: '#EFE6E1',
          200: '#DFCCC3',
          300: '#CBAEA0',
          400: '#B68E7A',
          500: '#A17058',
          600: '#8C5B45',
          700: '#734836',
          800: '#5E3C2E',
          900: '#4F3328',
          950: '#2A1A14',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
