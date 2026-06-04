import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        samparka: {
          light: '#E8F7F1',
          mid: '#d0f0e4',
          DEFAULT: '#1D9E75',
          dark: '#157a5a',
        },
      },
      fontFamily: {
        receipt: ['"Courier New"', 'Courier', 'monospace'],
      },
      keyframes: {
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        nfcPulse: {
          '0%':   { transform: 'scale(0.5)', opacity: '0.8' },
          '100%': { transform: 'scale(2)',   opacity: '0' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translateX(-50%) translateY(24px)' },
          to:   { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
        },
      },
      animation: {
        'slide-up':  'slideUp 0.55s cubic-bezier(0.22,1,0.36,1) forwards',
        'fade-in':   'fadeIn 0.4s ease forwards',
        'nfc-pulse': 'nfcPulse 2.4s ease-out infinite',
        'toast-in':  'toastIn 0.3s cubic-bezier(0.22,1,0.36,1) forwards',
      },
    },
  },
  plugins: [],
};

export default config;
