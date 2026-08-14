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
      // Lets the codebase use font-400 / font-500 / font-600 / font-700
      // alongside the standard font-bold / font-semibold utilities —
      // several components already relied on the numeric classes.
      fontWeight: {
        400: '400',
        500: '500',
        600: '600',
        700: '700',
        800: '800',
      },
    },
  },
  plugins: [],
};
