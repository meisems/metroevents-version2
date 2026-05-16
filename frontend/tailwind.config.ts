import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#C9A84C',
          'gold-light': '#E8C96B',
          dark: '#1A1A2E',
          sidebar: '#16213E',
          'sidebar-hover': '#0F3460',
        },
        status: {
          planning: '#3B82F6',
          production: '#EAB308',
          ready: '#14B8A6',
          'event-day': '#8B5CF6',
          done: '#22C55E',
          cancelled: '#EF4444',
        },
        crm: {
          new: '#6B7280',
          ocular: '#3B82F6',
          proposal: '#F59E0B',
          reserved: '#8B5CF6',
          booked: '#10B981',
          done: '#22C55E',
          cancelled: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
