/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { 50:'#f0f4ff',100:'#e0e9ff',200:'#c0d2ff',300:'#94b0ff',400:'#6685ff',500:'#4361ff',600:'#2d45f0',700:'#2234cc',800:'#1e2ca8',900:'#1a2780',950:'#111660' },
        accent:  { 50:'#f5f0ff',100:'#ede0ff',200:'#d9c1ff',300:'#bf93ff',400:'#a35aff',500:'#8b2fff',600:'#7a1af0',700:'#6614cc',800:'#5412a8',900:'#461080' },

        /* dark-* palette mapped to CSS variables — inverts automatically between light/dark */
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

        success: { DEFAULT:'#14a800',50:'#f0fff4',100:'#dcffe4',200:'#a7f3c1',300:'#6ee7a0',400:'#34d96a',500:'#14a800',600:'#0e8500',700:'#0a6600',800:'#064d00',900:'#033300' },
        warning: { DEFAULT:'#f5a623',50:'#fffbeb',100:'#fef3c7',200:'#fde68a',300:'#fcd34d',400:'#fbbf24',500:'#f5a623',600:'#d97706',700:'#b45309',800:'#92400e',900:'#78350f' },
        danger:  { DEFAULT:'#ef4444',50:'#fef2f2',100:'#fee2e2',200:'#fecaca',300:'#fca5a5',400:'#f87171',500:'#ef4444',600:'#dc2626',700:'#b91c1c',800:'#991b1b',900:'#7f1d1d' },
        gold: '#f59e0b',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      borderRadius: { '4xl':'2rem', '5xl':'2.5rem' },
      boxShadow: {
        'glow':       '0 0 20px rgba(67,97,255,0.3)',
        'glow-lg':    '0 0 40px rgba(67,97,255,0.4)',
        'glow-accent':'0 0 20px rgba(139,47,255,0.3)',
        'card':       '0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 10px 40px rgba(0,0,0,0.1)',
        'float':      '0 20px 60px rgba(0,0,0,0.15)',
        'inset-glow': 'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      animation: {
        'float':      'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in':   'scaleIn 0.3s ease-out',
        'spin-slow':  'spin 8s linear infinite',
        'gradient':   'gradientShift 8s ease infinite',
      },
      keyframes: {
        float:         { '0%,100%':{ transform:'translateY(0)' },'50%':{ transform:'translateY(-20px)' } },
        shimmer:       { '0%':{ backgroundPosition:'-200% 0' },'100%':{ backgroundPosition:'200% 0' } },
        fadeIn:        { from:{ opacity:'0' },to:{ opacity:'1' } },
        slideUp:       { from:{ opacity:'0',transform:'translateY(20px)' },to:{ opacity:'1',transform:'translateY(0)' } },
        slideDown:     { from:{ opacity:'0',transform:'translateY(-20px)' },to:{ opacity:'1',transform:'translateY(0)' } },
        scaleIn:       { from:{ opacity:'0',transform:'scale(0.95)' },to:{ opacity:'1',transform:'scale(1)' } },
        gradientShift: { '0%,100%':{ backgroundPosition:'0% 50%' },'50%':{ backgroundPosition:'100% 50%' } },
      },
      backgroundSize: { '300%':'300%' },
      backdropBlur:   { xs:'2px' },
    },
  },
  plugins: [],
};
