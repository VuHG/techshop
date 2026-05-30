import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Xanh dương chủ đạo TechShop (#2563EB)
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
        },
        // Đỏ/cam cho flash-sale & % giảm giá
        sale: {
          DEFAULT: '#EF4444',
          dark: '#DC2626',
        },
        // Footer xanh đen (slate)
        footer: '#1E293B',
      },
      backgroundImage: {
        'flash-gradient': 'linear-gradient(90deg, #F97316 0%, #EF4444 100%)',
      },
      fontFamily: {
        sans: ['var(--font-be-vietnam-pro)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.15s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
