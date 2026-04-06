import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7f5',
          100: '#fde8e1',
          200: '#fcd0c3',
          300: '#f8a992',
          400: '#f28068',
          500: '#e8614a',
          600: '#d44832',
          700: '#b23826',
          800: '#933124',
          900: '#7a2e23',
          950: '#42140e',
        },
        secondary: {
          50: '#f8f8f9',
          100: '#eeeef1',
          200: '#d9dae0',
          300: '#b6b8c3',
          400: '#8e91a1',
          500: '#6f7286',
          600: '#5a5c6e',
          700: '#494b5a',
          800: '#3f404c',
          900: '#373842',
          950: '#24252c',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 3s',
        'gradient': 'gradient-shift 8s ease infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'blob': 'blob-morph 8s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'marquee': 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
        'reveal-up': 'reveal-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'line-grow': 'line-grow 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(232, 97, 74, 0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(232, 97, 74, 0.25)' },
        },
        'blob-morph': {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '25%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
          '50%': { borderRadius: '50% 60% 30% 60% / 30% 40% 70% 60%' },
          '75%': { borderRadius: '60% 40% 60% 30% / 70% 30% 50% 60%' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'reveal-up': {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'line-grow': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-editorial': 'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(232, 97, 74, 0.08) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(111, 114, 134, 0.06) 0%, transparent 40%), #faf9f8',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [
    function({ addComponents, addUtilities }) {
      addComponents({
        '.glass': {
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
        },
        '.glass-card': {
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid #d9dae0',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -2px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
          transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.85)',
            borderColor: '#f8a992',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(232, 97, 74, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            transform: 'translateY(-4px)',
          },
        },
        '.section-shell': {
          paddingTop: '8rem',
          paddingBottom: '8rem',
          position: 'relative',
        },
        '.container-editorial': {
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 2rem',
        },
        '.btn-sheen': {
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
            transition: 'left 0.6s ease',
          },
          '&:hover::before': {
            left: '100%',
          },
        },
        '.marquee-wrap': {
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        },
        '.marquee-track': {
          display: 'inline-flex',
          animation: 'marquee 30s linear infinite',
        },
        '.marquee-track-reverse': {
          display: 'inline-flex',
          animation: 'marquee-reverse 30s linear infinite',
        },
        '.grain-overlay': {
          position: 'fixed',
          inset: '0',
          pointerEvents: 'none',
          zIndex: '9999',
          opacity: '0.03',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        },
      });
      
      addUtilities({
        '.text-balance': {
          textWrap: 'balance',
        },
        '.line-clamp-2': {
          display: '-webkit-box',
          WebkitLineClamp: '2',
          lineClamp: '2',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        },
        '.line-clamp-3': {
          display: '-webkit-box',
          WebkitLineClamp: '3',
          lineClamp: '3',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        },
        '.animation-delay-100': {
          animationDelay: '100ms',
        },
        '.animation-delay-200': {
          animationDelay: '200ms',
        },
        '.animation-delay-300': {
          animationDelay: '300ms',
        },
        '.animation-delay-500': {
          animationDelay: '500ms',
        },
        '.animation-delay-700': {
          animationDelay: '700ms',
        },
        '.animation-delay-1000': {
          animationDelay: '1000ms',
        },
      });
    },
  ],
};

export default config;
