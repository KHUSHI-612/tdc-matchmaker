/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#A4243B',
          50: '#FDF2F4',
          100: '#F2E0E3',
          200: '#E8C4CB',
          300: '#D4586A',
          400: '#C93B52',
          500: '#A4243B',
          600: '#8E1F33',
          700: '#7B1A2E',
          800: '#5C1322',
          900: '#3D0D17',
        },
        warm: {
          50: '#FDFBF9',
          100: '#FAF5F0',
          200: '#F3EDE8',
          300: '#EDE4DD',
          400: '#D5C8BD',
          500: '#9A8A82',
          600: '#6B5B54',
          700: '#4A3830',
          800: '#2C1810',
          900: '#1A0E08',
        },
        status: {
          active: '#2D7D5F',
          'active-bg': '#E8F5EE',
          matched: '#3B6FB5',
          'matched-bg': '#E5EFF9',
          hold: '#B5873B',
          'hold-bg': '#FDF3E5',
        }
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(44, 24, 16, 0.04), 0 4px 12px rgba(44, 24, 16, 0.06)',
        'card-hover': '0 8px 16px rgba(44, 24, 16, 0.06), 0 16px 40px rgba(164, 36, 59, 0.08)',
        'sidebar': '4px 0 24px rgba(44, 24, 16, 0.08)',
        'input': '0 1px 2px rgba(44, 24, 16, 0.04)',
        'button': '0 1px 3px rgba(164, 36, 59, 0.2), 0 2px 8px rgba(164, 36, 59, 0.12)',
      },
    },
  },
  plugins: [],
}
