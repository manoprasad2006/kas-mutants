/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        // Primary greys
        'dark-primary': '#1f1f1f',
        'dark-secondary': '#2c2c2c', 
        'dark-tertiary': '#3d3d3d',
        'dark-quaternary': '#4a4a4a',
        // Turquoise accents
        'turquoise-primary': '#1dd8d1',
        'turquoise-secondary': '#18c7bd',
        'turquoise-light': '#2fe4e0',
        'turquoise-dark': '#0fa29d',
        // Additional utility colors
        'grey-light': '#8b8b8b',
        'grey-medium': '#6b6b6b',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #1dd8d1, 0 0 10px #1dd8d1, 0 0 15px #1dd8d1' },
          '100%': { boxShadow: '0 0 10px #1dd8d1, 0 0 20px #1dd8d1, 0 0 30px #1dd8d1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};