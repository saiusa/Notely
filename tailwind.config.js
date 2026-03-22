/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './resources/**/*.blade.php',
        './resources/**/*.js',
        './resources/**/*.jsx',
        './src/**/*.js',
        './src/**/*.jsx',
    ],
    theme: {
        extend: {
            colors: {
                background: '#1B1C24',
                secondary: '#21232C',
                highlight: '#323848',
                primary: '#6750A4',
            },
        },
    },
    plugins: [],
};
