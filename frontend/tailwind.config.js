/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#ff8c00', // Arancio vibrante
                    hover: '#ffa500',
                    active: '#e67e00',
                    light: 'rgba(255, 140, 0, 0.15)',
                },
                background: {
                    DEFAULT: '#f5f5dc', // Beige classico
                    light: '#ececce', // Gradient end
                },
                surface: {
                    DEFAULT: 'rgba(255, 255, 255, 0.7)',
                    border: 'rgba(255, 255, 255, 0.5)',
                },
                text: {
                    primary: '#2c2c2c',
                    secondary: '#5a5a5a',
                },
                error: '#d32f2f',
                success: '#388e3c',
            },
            fontFamily: {
                heading: ['Montserrat', 'sans-serif'],
                body: ['Poppins', 'sans-serif'],
            },
            borderRadius: {
                'xl': '20px',
                '2xl': '28px',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
                'primary': '0 4px 16px rgba(255, 140, 0, 0.25)',
            }
        },
    },
    plugins: [],
}
