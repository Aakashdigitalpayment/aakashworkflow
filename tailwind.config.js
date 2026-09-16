/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'calc(var(--radius) - 4px)',
        md: 'var(--radius)',
        lg: 'calc(var(--radius) + 2px)',
        xl: 'calc(var(--radius) + 6px)',
        '2xl': 'calc(var(--radius) + 12px)',
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'var(--font-dm-sans)', 'sans-serif'],
      },
      fontWeight: {
        '400': '400',
        '500': '500',
        '600': '600',
        '700': '700',
        '800': '800',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '-0.005em' }],
        'sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '-0.01em' }],
        'base': ['1rem', { lineHeight: '1.65', letterSpacing: '-0.01em' }],
        'lg': ['1.125rem', { lineHeight: '1.5', letterSpacing: '-0.015em' }],
        'xl': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.02em' }],
        '2xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.025em' }],
        '3xl': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.03em' }],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px 0 rgba(0,0,0,0.08), 0 2px 6px -1px rgba(0,0,0,0.04)',
        modal: '0 24px 64px -12px rgba(0,0,0,0.18), 0 8px 24px -4px rgba(0,0,0,0.1)',
        sidebar: '2px 0 8px 0 rgba(0,0,0,0.05)',
        topbar: '0 1px 4px 0 rgba(0,0,0,0.05)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      keyframes: {
        shrink: {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
      animation: {
        shrink: 'shrink 3.5s linear forwards',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};