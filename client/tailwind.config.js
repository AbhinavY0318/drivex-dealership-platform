/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F5FF',
          100: '#E0EBFF',
          200: '#C2D7FF',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#0F172A',
        },
        dark: {
          DEFAULT: '#0B1120',
          card: '#131D31',
          surface: '#1E293B',
          border: '#2A374F',
          muted: '#64748B',
        },
        accent: {
          red: '#E11D48',
          amber: '#F59E0B',
          emerald: '#10B981',
          blue: '#0284C7',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -5px rgba(2, 6, 23, 0.08), 0 4px 6px -2px rgba(2, 6, 23, 0.04)',
        'premium-hover': '0 20px 40px -10px rgba(2, 6, 23, 0.14), 0 8px 12px -3px rgba(2, 6, 23, 0.08)',
        'glow': '0 0 25px -5px rgba(37, 99, 235, 0.3)',
      }
    },
  },
  plugins: [],
}
