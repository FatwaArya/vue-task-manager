/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './index.html',
        './src/**/*.{vue,js,ts,jsx,tsx}',
        './node_modules/tailwindcss-primeui/**/*.{js,ts}',
    ],
    theme: {
        extend: {},
    },
    plugins: [require('tailwindcss-primeui')],
}


