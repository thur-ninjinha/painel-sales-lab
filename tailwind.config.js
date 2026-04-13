/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F1117',
        surface: '#1A1D27',
        surface2: '#252836',
        border: '#2E3248',
        brand: {
          DEFAULT: '#6C63FF',
          hover: '#5A52E8',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        text: {
          primary: '#F1F2F6',
          secondary: '#8B8FA8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
