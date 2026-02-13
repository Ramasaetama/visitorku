/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors (Orange/Yellow)
        primary: {
          50: '#FEF9F0',
          100: '#FCEBCF',
          200: '#FAD89F',
          300: '#F7C46F',
          400: '#F4B13F',
          500: '#EE9D0F', // BASE
          600: '#BE7E0C',
          700: '#8F5E09',
          800: '#5F3F06',
          900: '#301F03',
        },
        // Gray Colors
        gray: {
          25: '#FCFCFD',
          50: '#F9FAFB',
          100: '#F2F4F7',
          200: '#EAECF0',
          300: '#D0D5DD',
          400: '#98A2B3',
          500: '#667085',
          600: '#475467',
          700: '#344054',
          800: '#1D2939',
          900: '#101828',
        },
        // Background
        background: '#F9FBFE',
        // Accent
        accent: '#FFC765',
        // Divider
        divider: '#D9D9D9',
      },
      fontFamily: {
        // Primary font for headings and body
        poppins: ['Poppins', 'sans-serif'],
        // Secondary font for UI elements
        inter: ['Inter', 'sans-serif'],
      },
      fontSize: {
        // Headings (Poppins)
        'h1': ['40px', { lineHeight: '60px', fontWeight: '700' }],
        'h2': ['38px', { lineHeight: '57px', fontWeight: '700' }],
        // Titles
        'title-1': ['34px', { lineHeight: '51px', fontWeight: '600' }],
        'title-2': ['30px', { lineHeight: '50px', fontWeight: '600' }],
        'title-3': ['27px', { lineHeight: '50px', fontWeight: '600' }],
        'title-4': ['24px', { lineHeight: '50px', fontWeight: '600' }],
        // Body
        'body-1': ['20px', { lineHeight: '32px', fontWeight: '400' }],
        'body-2': ['18px', { lineHeight: '32px', fontWeight: '400' }],
        'body-3': ['16px', { lineHeight: '30px', fontWeight: '400' }],
        'body-4': ['14px', { lineHeight: '28px', fontWeight: '400' }],
        'body-5': ['13px', { lineHeight: '24px', fontWeight: '400' }],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '30px', // Main border radius from Figma
        'full': '9999px',
      },
    },
  },
  plugins: [],
}
