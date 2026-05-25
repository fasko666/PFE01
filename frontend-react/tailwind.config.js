/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── Brand colors ───────────────────────────────────── */
        primary: {
          50:  '#f0f4ff', 100: '#e0e9ff', 200: '#c0d2ff', 300: '#94b0ff',
          400: '#6685ff', 500: '#4361ff', 600: '#2d45f0', 700: '#2234cc',
          800: '#1e2ca8', 900: '#1a2780', 950: '#111660',
        },
        accent: {
          50:  '#f5f0ff', 100: '#ede0ff', 200: '#d9c1ff', 300: '#bf93ff',
          400: '#a35aff', 500: '#8b2fff', 600: '#7a1af0', 700: '#6614cc',
          800: '#5412a8', 900: '#461080',
        },
        success: {
          DEFAULT: '#14a800',
          50: '#f0fff4', 100: '#dcffe4', 200: '#a7f3c1', 300: '#6ee7a0',
          400: '#34d96a', 500: '#14a800', 600: '#0e8500', 700: '#0a6600',
        },
        warning: {
          DEFAULT: '#f5a623',
          50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
          400: '#fbbf24', 500: '#f5a623', 600: '#d97706', 700: '#b45309',
        },
        danger: {
          DEFAULT: '#ef4444',
          50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
          400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
        },
        gold: '#f59e0b',

        /* ── Semantic palette (CSS variables — auto-inverts per theme) ──
           dark-950 = page background   (near-black dark / near-white light)
           dark-900 = card/surface      (slightly elevated)
           dark-800 = input / raised surface
           dark-700 = strong border
           dark-600 = subtle border
           dark-500 = muted text
           dark-400 = secondary text
           dark-300 = secondary text light
           dark-200 = body text
           dark-100 = primary text      (near-white dark / near-black light)
           dark-50  = bold text         (pure white dark / pure black light)
        ─────────────────────────────────────────────────────────────── */
        dark: {
          50:  'rgb(var(--c-dark-50)  / <alpha-value>)',
          100: 'rgb(var(--c-dark-100) / <alpha-value>)',
          200: 'rgb(var(--c-dark-200) / <alpha-value>)',
          300: 'rgb(var(--c-dark-300) / <alpha-value>)',
          400: 'rgb(var(--c-dark-400) / <alpha-value>)',
          500: 'rgb(var(--c-dark-500) / <alpha-value>)',
          600: 'rgb(var(--c-dark-600) / <alpha-value>)',
          700: 'rgb(var(--c-dark-700) / <alpha-value>)',
          800: 'rgb(var(--c-dark-800) / <alpha-value>)',
          900: 'rgb(var(--c-dark-900) / <alpha-value>)',
          950: 'rgb(var(--c-dark-950) / <alpha-value>)',
        },
      },

      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      boxShadow: {
        /* Glow effects */
        'glow':        '0 0 24px rgba(67,97,255,0.25)',
        'glow-lg':     '0 0 48px rgba(67,97,255,0.35)',
        'glow-accent': '0 0 24px rgba(139,47,255,0.25)',
        'glow-green':  '0 0 24px rgba(20,168,0,0.2)',

        /* Card hierarchy */
        'card':        '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover':  '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
        'float':       '0 24px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.08)',
        'dialog':      '0 32px 80px rgba(0,0,0,0.24), 0 12px 32px rgba(0,0,0,0.12)',

        /* Inset glows for premium surfaces */
        'inset-glow':  'inset 0 1px 0 rgba(255,255,255,0.08)',
        'inset-glow-strong': 'inset 0 1px 0 rgba(255,255,255,0.15)',

        /* Colored elevation */
        'primary-glow': '0 8px 32px rgba(67,97,255,0.3)',
        'sm-dark': '0 1px 4px rgba(0,0,0,0.24), 0 1px 2px rgba(0,0,0,0.16)',
      },

      animation: {
        'float':        'float 6s ease-in-out infinite',
        'pulse-slow':   'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer':      'shimmer 2s linear infinite',
        'fade-in':      'fadeIn 0.3s ease-out',
        'slide-up':     'slideUp 0.4s cubic-bezier(0.4,0,0.2,1)',
        'slide-down':   'slideDown 0.3s cubic-bezier(0.4,0,0.2,1)',
        'scale-in':     'scaleIn 0.25s cubic-bezier(0.4,0,0.2,1)',
        'spin-slow':    'spin 8s linear infinite',
        'gradient':     'gradientShift 8s ease infinite',
        'bounce-soft':  'bounceSoft 2s ease-in-out infinite',
      },

      keyframes: {
        float:         { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-20px)' } },
        shimmer:       { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        fadeIn:        { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:       { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown:     { from: { opacity: '0', transform: 'translateY(-10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:       { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        gradientShift: { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        bounceSoft:    { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },

      backgroundSize: { '300%': '300%' },
      backdropBlur:   { xs: '2px', '4xl': '64px' },

      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
};
