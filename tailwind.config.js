/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Ajuste conforme a estrutura do seu projeto
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
    fontFamily: {
      sans: ['Poppins', 'sans-serif'], // Configura a fonte padrão global
    },

    
    
  },
  plugins: [],
};
