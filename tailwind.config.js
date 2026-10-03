/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#141414',
          alt: '#0f0f0f',
        },
        surface: {
          DEFAULT: '#181818',
          hover: '#232323',
          elevated: '#2a2a2a',
          card: '#1f1f1f',
        },
        brand: {
          DEFAULT: '#E50914',
          hover: '#F6121D',
          dark: '#B81D24',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B3B3B3',
          muted: '#757575',
        },
        status: {
          success: '#46D369',
          warning: '#F5C518',
          error: '#E50914',
        },
      },
      fontSize: {
        hero: ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.06' }],
        section: ['clamp(1.25rem, 2vw, 1.5rem)', { lineHeight: '1.3' }],
        body: ['1rem', { lineHeight: '1.5' }],
        caption: ['0.75rem', { lineHeight: '1.5' }],
        metadata: ['0.875rem', { lineHeight: '1.5' }],
      },
      spacing: { gutter: 'clamp(1.25rem, 4vw, 4rem)' },
      borderRadius: { card: '0.5rem', button: '0.25rem' },
      boxShadow: { card: '0 14px 40px rgb(0 0 0 / 0.55)', nav: '0 1px 0 rgb(255 255 255 / 0.06)' },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'scale-up': 'scaleUp 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

