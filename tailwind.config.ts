import type { Config } from 'tailwindcss'
const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                approachable: '#58CC02',
                caution: '#FFA500',
                intense: '#FF4B4B',
                calm: '#1CB0F6',
                'approachable-light': '#E8F9D5',
                'caution-light': '#FFF3E0',
                'intense-light': '#FFE5E5',
                'calm-light': '#E3F6FE',
                'approachable-dark': '#3D9400',
                'caution-dark': '#CC7A00',
                'intense-dark': '#CC2E2E',
                'calm-dark': '#0A8CC9',
                surface: '#F8F9FA',
                'surface-2': '#F0F2F5',
                border: '#E4E6EA',
                'text-primary': '#1A1A2E',
                'text-secondary': '#6B7280',
                'text-muted': '#9CA3AF',
            },
            fontFamily: {
                sans: ['var(--font-assistant)', 'system-ui', 'sans-serif'],
            },
            animation: {
                'halo-breathe': 'haloBreathe 2s ease-in-out infinite',
                'fade-in': 'fadeIn 0.4s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'bounce-gentle': 'bounceGentle 1s ease-in-out infinite',
            },
            keyframes: {
                haloBreathe: {
                    '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
                    '50%': { opacity: '1', transform: 'scale(1.04)' },
                },
                fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                bounceGentle: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-4px)' },
                },
            },
            boxShadow: {
                card: '0 2px 12px rgba(0,0,0,0.06)',
                'card-hover': '0 8px 32px rgba(0,0,0,0.10)',
            },
        },
    },
    plugins: [],
}
export default config
