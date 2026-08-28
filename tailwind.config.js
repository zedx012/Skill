/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paper / backgrounds — warm off-white "blueprint paper"
        paper: {
          50: '#FBFAF7',
          100: '#F6F4EE',
          200: '#EEEAE0',
          300: '#E2DDD0',
          400: '#D0CABA',
        },
        // Ink — graphite-navy for text and structure
        ink: {
          900: '#1A1D24',
          800: '#242832',
          700: '#2F3441',
          600: '#454B5A',
          500: '#5C6373',
          400: '#7A8194',
          300: '#9CA3B2',
          200: '#C4CAD6',
          100: '#E0E3EA',
        },
        // Blueprint blue — flat confident primary
        blueprint: {
          50: '#EAF0F7',
          100: '#D4E1EF',
          200: '#A9C3DF',
          300: '#7EA5CF',
          400: '#4D7DB0',
          500: '#2B5E91',
          600: '#1F4A77',
          700: '#163960',
          800: '#0E2848',
          900: '#081A32',
        },
        // Brass — XP and gamification tokens
        brass: {
          50: '#FBF6E9',
          100: '#F5EAC8',
          200: '#EBD494',
          300: '#DDB85A',
          400: '#CDA03A',
          500: '#B8862A',
          600: '#9A6E22',
          700: '#7C571D',
          800: '#5E4118',
          900: '#3F2C12',
        },
        // Coral — streaks, urgency, signals
        signal: {
          50: '#FCEEEB',
          100: '#F9D9D2',
          200: '#F2B4A6',
          300: '#E88670',
          400: '#DC6450',
          500: '#C84A36',
          600: '#A83B2B',
          700: '#873024',
          800: '#65251C',
          900: '#441913',
        },
        // Moss — success / completed states
        moss: {
          50: '#EAF0EA',
          100: '#D4DFD4',
          200: '#A9BFA9',
          300: '#7E9E7E',
          400: '#5A7E5A',
          500: '#426742',
          600: '#345234',
          700: '#273E27',
          800: '#1B2B1B',
          900: '#101810',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Tight tracking for display, relaxed for body
        'display-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-md': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-sm': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '600' }],
      },
      letterSpacing: {
        eyebrow: '0.18em',
        tightish: '-0.015em',
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(26,29,36,0.04), 0 0 0 1px rgba(26,29,36,0.06)',
        lifted: '0 4px 24px -8px rgba(26,29,36,0.18), 0 0 0 1px rgba(26,29,36,0.06)',
        focus: '0 0 0 3px rgba(43,94,145,0.35)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fadeIn 0.4s ease both',
        'slide-in': 'slideIn 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'count': 'count 0.6s cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        count: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
