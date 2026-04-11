import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // This tells Tailwind to look in your 'src' folder
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Our custom craft-brand palette
        sage: {
          50: '#f4f7f4',
          600: '#7a967a', 
          700: '#637a63',
        },
        sand: {
          50: '#fdfbf7',
          200: '#f1e6d2',
          500: '#c2b280',
        },
      },
    },
  },
  plugins: [],
};
export default config;