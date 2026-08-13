/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF9F6',
        ink: '#0F172A',
        juniper: {
          DEFAULT: '#0F2C59',
          dark: '#0B1E3F',
          light: '#23497F',
        },
        mustard: {
          DEFAULT: '#FF6B35',
          dark: '#E04F1A',
        },
        clay: '#E11D48',
        line: '#E2E8F0',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
