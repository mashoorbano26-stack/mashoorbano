/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black:  '#0A0A0A',
          white:  '#F5F5F0',
          accent: '#FF3B00',
          muted:  '#1A1A1A',
          border: '#2A2A2A',
          text:   '#CCCCCC',
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        wordUp:  'wordUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        fadeIn:  'fadeIn 0.6s ease forwards',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        wordUp: {
          '0%':   { transform: 'translateY(110%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
