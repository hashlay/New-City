/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Premium Minimal 3-Color Hierarchy:
        background: '#f8fafc',
        foreground: '#0f172a',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
        },
        primary: {
          DEFAULT: '#0f172a', // Deep obsidian
          hover: '#1e293b',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#2563eb', // Minimal functional accent (clean sapphire)
          hover: '#1d4ed8',
          foreground: '#ffffff',
          light: '#eff6ff',
        },
        muted: {
          DEFAULT: '#64748b',
          light: '#f1f5f9',
          border: '#e2e8f0',
        },
        success: {
          DEFAULT: '#059669',
          light: '#ecfdf5',
        },
        warning: {
          DEFAULT: '#d97706',
          light: '#fffbeb',
        },
        danger: {
          DEFAULT: '#dc2626',
          light: '#fef2f2',
        }
      },
      fontFamily: {
        // Premium store typography standard:
        // 1. Sans: Plus Jakarta Sans - Clean, modern, luxury geometric grotesque
        // 2. Display: Cinzel - High-end Roman luxury store & jewelry display serif
        // 3. Serif: Playfair Display - Classical editorial serif
        // 4. Mono: Tabular figures for amounts and tokens
        sans: ['var(--font-sans)', '"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', '"Cinzel"', 'Georgia', 'serif'],
        serif: ['var(--font-serif)', '"Playfair Display"', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.035em',
        tighter: '-0.025em',
        tight: '-0.015em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
        luxury: '0.15em',
      },
    },
  },
  plugins: [],
};
