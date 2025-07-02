import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        input: {
          DEFAULT: "hsl(var(--input))",
          text: "hsl(var(--input-text))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          text: "hsl(var(--info-text))",
        },
        active: {
          DEFAULT: "hsl(var(--active))",
          text: "hsl(var(--active-text))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          text: "hsl(var(--card-text))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "breathing": {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.65' },
        },
        "update-a": {
          '0%': {
            color: 'hsl(var(--active))',
          },
          '100%': {
            color: 'hsl(var(--input-text))',
          },
        },
        "update-b": {
          '0%': {
            color: 'hsl(var(--active))',
          },
          '100%': {
            color: 'hsl(var(--input-text))',
          },
        },
        "magic-a": {
          '0%': {
            filter: 'drop-shadow(0px 0px 2px hsl(var(--active)/100%))',
          },
          '100%': {
            filter: 'drop-shadow(0px 0px 2px hsl(var(--active)/0%))',
          },
        },
        "magic-b": {
          '0%': {
            filter: 'drop-shadow(0px 0px 2px hsl(var(--active)/100%))',
          },
          '100%': {
            filter: 'drop-shadow(0px 0px 2px hsl(var(--active)/0%))',
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "breathing": 'breathing 3s ease-out infinite',
        "update-a": 'update-a 2s ease-in-out',
        "update-b": 'update-b 2s ease-in-out',
        "magic-a": 'magic-a 2s ease-in-out, update-a 2s ease-in-out',
        "magic-b": 'magic-b 2s ease-in-out, update-b 2s ease-in-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
