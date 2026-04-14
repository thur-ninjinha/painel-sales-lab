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
      boxShadow: {
        'glow-brand': '0 0 24px rgba(108, 99, 255, 0.35)',
        'glow-brand-sm': '0 0 12px rgba(108, 99, 255, 0.25)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6C63FF 0%, #9B8FFF 100%)',
        'gradient-brand-subtle': 'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(155,143,255,0.08) 100%)',
        'gradient-success': 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)',
        'gradient-warning': 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
        'gradient-danger': 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
        'mesh-bg': "radial-gradient(ellipse 70% 40% at 15% -5%, rgba(108,99,255,0.13) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 85% 105%, rgba(108,99,255,0.08) 0%, transparent 60%)",
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
