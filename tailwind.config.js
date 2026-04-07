/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'system-ui', 'sans-serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      colors: {
        brand: {
          green:  '#00ff9d',
          blue:   '#00b4ff',
          purple: '#c400ff',
          amber:  '#ff9d00',
          red:    '#ff4d6d',
        },
      },
    },
  },
  plugins: [],
};
