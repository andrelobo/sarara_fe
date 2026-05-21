module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#0E2A24',
          gold: '#E6B450',
          cream: '#F2F2F2',
          sand: '#CDAF7D',
          black: '#1C1C1C',
        },
        primary: {
          DEFAULT: '#E6B450',
          light: '#F0C56A',
          dark: '#B8892F',
        },
        secondary: {
          DEFAULT: '#CDAF7D',
          light: '#E3CAA2',
          dark: '#9C7F56',
        },
        background: {
          DEFAULT: '#0E2A24',
          light: '#15362F',
          dark: '#081A16',
        },
        surface: {
          DEFAULT: '#1C1C1C',
          soft: '#232323',
          elevated: '#202722',
        },
        text: {
          DEFAULT: '#F2F2F2',
          dark: '#CDAF7D',
          muted: '#D7CFBF',
        },
        border: {
          DEFAULT: 'rgba(242, 242, 242, 0.12)',
          strong: 'rgba(230, 180, 80, 0.28)',
        },
        error: {
          DEFAULT: '#B94132',
          light: '#D45D4E',
        },
        success: {
          DEFAULT: '#2E8B57',
          light: '#48A86F',
        },
        status: {
          free: '#2E8B57',
          occupied: '#E6B450',
          closing: '#C97A2B',
          danger: '#B94132',
          offline: '#7C3AED',
          sync: '#2563EB',
        },
      },
      fontFamily: {
        logo: ['"Playfair Display"', 'Georgia', 'serif'],
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        ui: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        ambient: '0 25px 80px rgba(8, 26, 22, 0.35)',
      },
    },
  },
  plugins: [],
}
