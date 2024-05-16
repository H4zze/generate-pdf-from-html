/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";

module.exports = {
  content: ["./src/templates/**/*.{html,js,ejs}"],
  theme: {
    extend: {
      backgroundImage: {
        logo: "url('images/utbetalning-logo.png')",
      },
      fontFamily: {
        sans: ["Open Sans", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
