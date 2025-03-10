/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  darkMode: 'class', // enable dark mode
  theme: {
    extend: {
      backgroundImage: {
        'bgImg': "url('assets/images/bg-img.jpg')"
      },
      colors: {
        customBlue: '#525FE1',
        customOrange: '#F86F03',
        customGray: '#6F6B80',
        customDark: '#231F40',
        // Add other custom colors as needed
      },
      fontFamily: {
        sans: ['Urbanist', 'sans-serif'],
        // You can replace 'Urbanist' with your desired font family
      },
      screens: {
        'sm': '320px',
      },
    },
  },
  plugins: [],
}

