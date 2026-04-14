/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#0A0A0A',
        surface:  '#111111',
        surface2: '#1A1A1A',
        surface3: '#222222',
        border:   '#2A2A2A',
        'border-light': '#3A3A3A',
        brand: {
          DEFAULT: '#7C6EFA',
          hover:   '#6A5DE8',
        },
        success: '#00D084',
        warning: '#F59E0B',
        danger:  '#FF4545',
        text: {
          primary:   '#FFFFFF',
          secondary: '#888888',
          muted:     '#555555',
        },
        ink: {
          DEFAULT: '#FFFFFF',
          soft:    '#F0F0F0',
          muted:   '#888888',
          faint:   '#444444',
        },
        cream: '#F2F0E8',
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Barlow Condensed', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['5rem',   { lineHeight: '0.9', fontWeight: '800', fontStyle: 'italic' }],
        'display-lg': ['3.5rem', { lineHeight: '0.95', fontWeight: '800', fontStyle: 'italic' }],
        'display-md': ['2.5rem', { lineHeight: '1', fontWeight: '700', fontStyle: 'italic' }],
      },
      letterSpacing: {
        widest2: '0.2em',
        widest3: '0.3em',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
