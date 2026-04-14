/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#080B12',
        surface: '#0F1320',
        surface2: '#171C2E',
        surface3: '#1E2438',
        border: '#252D45',
        brand: {
          DEFAULT: '#7C6EFA',
          hover: '#6A5DE8',
          light: '#A99BFF',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#F43F5E',
        text: {
          primary: '#F0F2FF',
          secondary: '#7B82A0',
          muted: '#4B5275',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0,0,0,0.5)',
        'md': '0 4px 16px rgba(0,0,0,0.5)',
        'lg': '0 8px 32px rgba(0,0,0,0.6)',
        'brand': '0 0 0 1px rgba(124,110,250,0.3), 0 4px 16px rgba(124,110,250,0.2)',
        'brand-lg': '0 0 0 1px rgba(124,110,250,0.4), 0 8px 32px rgba(124,110,250,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
