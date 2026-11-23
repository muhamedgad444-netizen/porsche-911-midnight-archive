/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#030406',
        carbon: '#080b10',
        shark: '#0070FF',
        cyanHud: '#00E5FF',
        acidBlue: '#38BDF8',
        titanium: '#E2E8F0',
      },
      fontFamily: {
        display: ['"Syncopate"', 'sans-serif'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        shark: '0 0 36px rgba(0, 112, 255, 0.35)',
        cyan: '0 0 32px rgba(0, 229, 255, 0.28)',
      },
    },
  },
  plugins: [],
};
