module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#15508c',
          light: '#1a6cb8',
          dark: '#0f3a66',
        },
        secondary: {
          DEFAULT: '#c69f56',
          light: '#d4b77d',
          dark: '#a88743',
        },
        background: {
          DEFAULT: '#111827',
          light: '#1f2937',
        },
        text: {
          DEFAULT: '#e5e7eb',
          dark: '#9ca3af',
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#f87171',
        },
        success: {
          DEFAULT: '#22c55e',
          light: '#4ade80',
        },
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
    },
  },
  plugins: [],
}

