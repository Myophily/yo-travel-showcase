/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#fff",
        "grey-900": "#020202",
        mistyrose: "#ffe4e1",
        "grey-400": "#bdbdbd",
        silver: "#bdbdbd",
        darkslategray: {
          100: "#333",
          200: "#303030",
        },
        orangered: "#ff3c26",
        lightslategray: {
          100: "#90949c",
          200: "#91929f",
        },
        systemblack: "#000",
        cornflowerblue: "#4267b2",
        darkslateblue: "#385898",
        whitesmoke: {
          100: "#f7f7f8",
          200: "#f7f7f7",
          300: "#efefef",
          400: "#eeeef0",
        },
        gray: {
          100: "#fcfcfc",
          200: "#26262c",
        },
        gainsboro: {
          100: "#d9d9de",
          200: "#d9d9d9",
        },
        dimgray: "#4c4c57",
      },
      spacing: {},
      fontFamily: {
        "open-sans": "'Open Sans'",
        inter: "Inter",
      },
      borderRadius: {
        "81xl": "100px",
        "29xl": "48px",
        "41xl": "60px",
        "981xl": "1000px",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            img: {
              marginTop: "1rem",
              marginBottom: "1rem",
            },
          },
        },
      },
    },
    fontSize: {
      xs: "12px",
      "3xs": "10px",
      "5xs": "8px",
      sm: "14px",
      xl: "20px",
      mini: "15px",
      base: "16px",
      smi: "13px",
      inherit: "inherit",
    },
    screens: {
      mq165: {
        raw: "screen and (max-width: 165px)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
  corePlugins: {
    preflight: false,
  },
};
