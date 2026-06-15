import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        card:       'rgb(var(--color-card) / <alpha-value>)',
        primary:    'rgb(var(--color-primary) / <alpha-value>)',
        secondary:  'rgb(var(--color-secondary) / <alpha-value>)',  // ← add
        accent:     'rgb(var(--color-accent) / <alpha-value>)',
        border:     'rgb(var(--color-border) / <alpha-value>)',
        muted:      'rgb(var(--color-muted) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        error:      'rgb(var(--color-error) / <alpha-value>)',      // ← add
      },
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      padding: {
        'safe-area-pb': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}

export default config