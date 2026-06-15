import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0F0F13',
        card: '#1A1A24',
        primary: '#6366F1',
        accent: '#22D3EE',
        border: '#2A2A36',
        muted: '#6B7280',
        // tailwind.config.ts — add inside theme.extend
        padding: {
        'safe-area-pb': 'env(safe-area-inset-bottom)',
        },
      },
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config