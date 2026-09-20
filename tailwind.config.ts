/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          50:  '#FAF7F0',
          100: '#F5F0E8',
          200: '#EDEBE3',
          300: '#E0DBD0',
          400: '#C8C2B5',
        },
        ink: {
          900: '#1A1814',
          700: '#4A4640',
          500: '#8A8480',
          300: '#D5D0C8',
          100: '#F0EDE8',
        },
        burnt: {
          700: '#8B4020',
          500: '#C4622D',
          300: '#E8956A',
          100: '#FBE8DC',
        },
        forest: {
          700: '#2A3F32',
          500: '#3D5A47',
          300: '#6B8C75',
          100: '#DCE8E0',
        },
        navy: {
          700: '#1A2F47',
          500: '#2B4B6F',
          300: '#5C7FA3',
          100: '#DCE5EF',
        },
        amber: {
          700: '#5E460D',
          500: '#8B6914',
          300: '#C4A84A',
          100: '#F5EDCC',
        },
        crimson: {
          700: '#5E2626',
          500: '#8B3A3A',
          300: '#C47070',
          100: '#F5DADA',
        },
        synthetic: {
          500: '#6B5A8A',
          100: '#E8E3F0',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display':    ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'headline':   ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'title':      ['1.5rem', { lineHeight: '1.35' }],
        'label':      ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.08em' }],
      },
      animation: {
        'fade-in':   'fadeIn 0.4s ease-out forwards',
        'slide-up':  'slideUp 0.4s ease-out forwards',
        'draw-line': 'drawLine 1.5s ease-in-out forwards',
        'pulse-soft':'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        drawLine:  { from: { strokeDashoffset: '1000' }, to: { strokeDashoffset: '0' } },
        pulseSoft: { '0%, 100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
      },
      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    },
  },
  plugins: [],
};
