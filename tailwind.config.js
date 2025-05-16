import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'pulse-glow': 'pulse 2s infinite',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-out': 'fadeOut 0.6s ease-in-out forwards',
        'wave': 'wave-bounce 0.6s infinite ease-in-out',
      },
      keyframes: {
        pulse: {
          '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(59,130,246,0.7)' },
          '70%': { transform: 'scale(1.1)', boxShadow: '0 0 0 10px rgba(59,130,246,0)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(59,130,246,0)' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(0.25rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '0.9' },
          '100%': { opacity: '0', visibility: 'hidden' },
        },
        'wave-bounce': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '1' },
          '50%': { transform: 'translateY(-6px)', opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
