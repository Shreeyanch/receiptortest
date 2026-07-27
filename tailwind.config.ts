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
        ink:    '#1C1F1B',
        paper:  '#F4F2EC',
        pine:   '#1C6B4F',
        marigold: '#E0A331',
        ash:    '#8A8578',
        background: 'oklch(0.952 0.008 85)',
        foreground: 'oklch(0.18 0.012 85)',
        card: 'oklch(1 0 0)',
        primary: {
          DEFAULT: 'oklch(0.52 0.11 162)',
          foreground: 'oklch(0.99 0.01 150)',
        },
        secondary: 'oklch(0.94 0.005 90)',
        muted: {
          DEFAULT: 'oklch(0.94 0.006 100)',
          foreground: 'oklch(0.48 0.015 85)',
        },
        accent: 'oklch(0.93 0.03 160)',
        destructive: 'oklch(0.58 0.22 25)',
        success: 'oklch(0.6 0.13 155)',
        warning: 'oklch(0.72 0.14 65)',
        border: 'oklch(0.88 0.008 100)',
        ring: 'oklch(0.52 0.11 162)',
      },
      fontFamily: {
        sans:  ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
        receipt: ['var(--font-geist-mono)', 'Courier New', 'monospace'],
      },
      borderRadius: {
        xl: '1.1rem',
        '2xl': '1.1rem',
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
        receiptRise: {
          from: { opacity: '0', transform: 'translateY(14px) scale(0.985)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeSlideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        softPop: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          '60%':  { transform: 'scale(1.04)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        pulseRing: {
          '0%':   { boxShadow: '0 0 0 0 color-mix(in oklab, oklch(0.52 0.11 162) 45%, transparent)' },
          '70%':  { boxShadow: '0 0 0 18px transparent' },
          '100%': { boxShadow: '0 0 0 0 transparent' },
        },
        trendFade: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      animation: {
        'slide-up':      'slideUp 0.55s cubic-bezier(0.22,1,0.36,1) forwards',
        'fade-in':       'fadeIn 0.4s ease forwards',
        'nfc-pulse':     'nfcPulse 2.4s ease-out infinite',
        'toast-in':      'toastIn 0.3s cubic-bezier(0.22,1,0.36,1) forwards',
        'receipt-rise':  'receiptRise 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'fade-slide-down': 'fadeSlideDown 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'soft-pop':      'softPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        'pulse-ring':    'pulseRing 2.4s ease-out infinite',
        'trend-fade':    'trendFade 0.8s cubic-bezier(0.22,1,0.36,1) forwards',
      },
    },
  },
  plugins: [],
};

export default config;
