import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Shrek 초록
        brand: {
          50: '#f3f8ec',
          100: '#e4f0d3',
          200: '#c9e1a8',
          300: '#a6cc72',
          400: '#86b447',
          500: '#6a9a2c',
          600: '#527b20',
          700: '#405f1c',
          800: '#354d1b',
          900: '#2d421a',
        },
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'system-ui', '-apple-system', 'Segoe UI', 'Malgun Gothic', 'sans-serif'],
      },
    },
  },
  plugins: [typography],
}

export default config
