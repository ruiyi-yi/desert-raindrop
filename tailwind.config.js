/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Inter"', '"Noto Sans SC"', 'sans-serif'],
        body: ['"Noto Sans SC"', 'sans-serif'],
      },
      colors: {
        sky: {
          pale: '#E8F4FD',
          mist: '#D4EAF7',
          haze: '#B8DCF0',
          rain: '#7EC8E3',
          deep: '#5B9BD5',
          dark: '#3A7DB8',
        },
        ink: {
          light: '#6B7D8E',
          DEFAULT: '#3D5060',
          dark: '#2C3E50',
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.18)',
          strong: 'rgba(255, 255, 255, 0.28)',
          border: 'rgba(255, 255, 255, 0.25)',
          blue: 'rgba(180, 220, 240, 0.2)',
        },
        pearl: '#F5F9FC',
      },
      backgroundImage: {
        'sky-gradient': 'linear-gradient(180deg, #D4EAF7 0%, #E8F4FD 40%, #F0F7FC 70%, #E8F4FD 100%)',
        'sky-gradient-reverse': 'linear-gradient(0deg, #D4EAF7 0%, #E8F4FD 40%, #F0F7FC 70%, #E8F4FD 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(60, 100, 140, 0.08)',
        'glass-hover': '0 12px 40px rgba(60, 100, 140, 0.14)',
        'card': '0 4px 24px rgba(44, 62, 80, 0.06), 0 1px 4px rgba(44, 62, 80, 0.04)',
        'soft': '0 2px 16px rgba(44, 62, 80, 0.04)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'drift': 'drift 20s linear infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'ripple': 'ripple 1.5s ease-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-8px) rotate(1deg)' },
          '66%': { transform: 'translateY(4px) rotate(-1deg)' },
        },
        drift: {
          '0%': { transform: 'translateX(0) translateY(0)' },
          '25%': { transform: 'translateX(10px) translateY(-5px)' },
          '50%': { transform: 'translateX(0) translateY(-10px)' },
          '75%': { transform: 'translateX(-10px) translateY(-5px)' },
          '100%': { transform: 'translateX(0) translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.6' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
