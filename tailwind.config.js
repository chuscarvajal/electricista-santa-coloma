/** Config para generar el CSS estático purgado (reemplaza el CDN de Tailwind). */
module.exports = {
  content: ['./public/**/*.html'],
  theme: {
    extend: {
      colors: {
        gold:    { DEFAULT: '#f7b72f', dark: '#e0a11c', light: '#ffca55' },
        ink:     { DEFAULT: '#1c1f24', deep: '#141619', soft: '#2a2e35' },
        surface: '#f4f5f7',
        mute:    '#6b7280',
      },
      fontFamily: { display: ['Lato', 'sans-serif'], body: ['Lato', 'sans-serif'] },
      fontWeight: { 500: '500', 600: '600', 700: '700', 800: '800', 900: '900' },
      boxShadow: {
        card:  '0 20px 45px -22px rgba(28,31,36,0.28)',
        float: '0 34px 70px -30px rgba(28,31,36,0.40)',
        gold:  '0 18px 36px -16px rgba(247,183,47,0.55)',
      },
    },
  },
};
