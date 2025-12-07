/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#6ee7ff',
        accent: '#64f5a1',
        'dark-bg': '#0b0d10',
        'dark-panel': '#11151a',
        'dark-border': '#1e2630',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Ubuntu', 'Cantarell', 'Helvetica Neue', 'Arial', 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow': '0 10px 30px rgba(0,0,0,0.35)',
        'glow-brand': '0 8px 25px rgba(110, 231, 255, 0.3)',
      },
      borderRadius: {
        'xl': '16px',
      },
    },
  },
  plugins: [],
}

