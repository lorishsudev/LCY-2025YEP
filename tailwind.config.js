/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'lcy-yellow': '#FFD700',
        'lcy-dark': '#1a202c',
        'lcy-slate': '#334155',
      },
    },
  },
  plugins: [],
};
