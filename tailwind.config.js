/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  darkMode: 'class',
  theme: {
    screens: {
      xs: "376px",
      sm: "500px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    letterSpacing: {
      tightest: "-0.5em"
    },
    extend: {
      colors: {
        primary: "#0c0a09",
        darkPrimary: "#f8f8f8",
        dim: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
          950: "#0c0a09",
        },
      },
      fontFamily: {
        sans: ['Karla', 'Arial', 'Helvetica', 'sans-serif', 'Georgia', 'serif'],
      },
      transitionProperty: {
        main: 'all 150ms ease-out'
      },
      animation: {

      },
      keyframes: {

      }
    },
  },
  plugins: [],
}

