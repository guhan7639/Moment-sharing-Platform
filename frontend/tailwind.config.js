/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#f43f5e', // rose-500
                    dark: '#e11d48', // rose-600
                },
                secondary: {
                    light: '#8b5cf6', // violet-500
                    dark: '#7c3aed', // violet-600
                }
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
