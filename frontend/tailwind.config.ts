import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f111a',
        card: '#1a1d2e',
        'card-elevated': '#252836',
        input: '#2d2f3d',
        border: '#3d4152',
        primary: '#3b82f6',
        'primary-hover': '#2563eb',
        muted: '#9ca3af',
        'muted-dark': '#6b7280',
        success: '#22c55e',
        warning: '#f59e0b',
        'warning-border': '#f97316',
        // Linea-style light theme (app)
        app: '#F8F7F5',
        'app-sidebar': '#F5F4F2',
        'app-card': '#F3EFF9',
        'app-card-hover': '#EBE5F5',
        accent: '#2C007C',
        'accent-hover': '#3F008F',
        lavender: '#E8E0F5',
        'text-app': '#1a1a1a',
        'text-muted-app': '#6b7280',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-montserrat)', 'Montserrat', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
