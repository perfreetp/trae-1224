/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        mint: {
          50: '#F0FDFA', 100: '#CCFBF1', 200: '#99F6E4',
          300: '#5EEAD4', 400: '#2DD4BF', 500: '#4ECDC4',
          600: '#0D9488', 700: '#0F766E'
        },
        coral: {
          400: '#FF8A80', 500: '#FF6B6B', 600: '#FF5252'
        },
        sky2: {
          400: '#64C2E3', 500: '#45B7D1', 600: '#2FA4BF'
        },
        lemon: {
          400: '#FFED85', 500: '#FFE66D', 600: '#FFD93D'
        },
        lavender: {
          300: '#D9CCF4', 400: '#C7B8EA', 500: '#B39DDB'
        },
        warm: {
          50: '#FFFBF5', 100: '#FFF8EC'
        }
      },
      fontFamily: {
        display: ['"Quicksand"', '"PingFang SC"', 'sans-serif'],
        body: ['"Nunito"', '"PingFang SC"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem'
      },
      boxShadow: {
        soft: '0 10px 40px -10px rgba(0,0,0,0.08)',
        glow: '0 0 30px rgba(78, 205, 196, 0.3)',
        card: '0 8px 30px rgba(0,0,0,0.06)'
      },
      keyframes: {
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2.4)', opacity: '0' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'progress-fill': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        'bounce-soft': 'bounce-soft 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.24, 0, 0.38, 1) infinite',
        'slide-up': 'slide-up 0.4s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'shimmer': 'shimmer 2s linear infinite'
      }
    },
  },
  plugins: [],
};
