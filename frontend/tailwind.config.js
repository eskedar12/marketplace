/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // paper/ink/line/juniper are backed by CSS variables holding raw
        // "R G B" triplets (defined in globals.css: light under :root,
        // dark under .dark), wrapped in rgb(... / <alpha-value>) so
        // Tailwind's opacity modifiers (text-ink/70, bg-juniper/10, etc.
        // — used ~130 times across the app) keep working. A plain hex
        // or bare var() string can't compute that alpha blend. Every
        // existing bg-paper / text-ink / border-line / bg-juniper class
        // across the app automatically re-themes when <html> gets the
        // .dark class — no component files need to change. mustard and
        // clay stay static hex: both are vivid enough to read fine on
        // either background.
        paper: 'rgb(var(--color-paper) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        juniper: {
          DEFAULT: 'rgb(var(--color-juniper) / <alpha-value>)',
          dark: 'rgb(var(--color-juniper-dark) / <alpha-value>)',
          light: 'rgb(var(--color-juniper-light) / <alpha-value>)',
        },
        mustard: {
          DEFAULT: '#FF6B35',
          dark: '#E04F1A',
        },
        clay: '#E11D48',
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
