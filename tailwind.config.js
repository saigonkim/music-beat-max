/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'game-bg': '#06040f',
                'lane-d': '#00f0ff',
                'lane-f': '#39ff14',
                'lane-j': '#ffe500',
                'lane-k': '#ff2d9b',
                'judgment': '#ffffff',
                'perfect': '#facc15',
                'good': '#22c55e',
                'miss': '#ef4444',
                'neon-purple': '#9b30ff',
                'neon-cyan': '#00f0ff',
            },
            fontFamily: {
                'space': ['"Space Grotesk"', 'sans-serif'],
                'mono-game': ['"Space Mono"', 'monospace'],
            },
            animation: {
                'pulse-beat': 'pulse-beat 468.75ms ease-in-out infinite',
                'judgment-glow': 'judgment-glow 468.75ms ease-in-out infinite',
                'lane-flash': 'lane-flash 100ms ease-out forwards',
                'visualizer-bar': 'visualizer-bar 200ms ease-in-out',
            },
            keyframes: {
                'pulse-beat': {
                    '0%, 100%': { opacity: '0.6', boxShadow: '0 0 8px 2px white' },
                    '50%': { opacity: '1', boxShadow: '0 0 24px 6px white' },
                },
                'judgment-glow': {
                    '0%, 100%': { boxShadow: '0 0 10px 2px rgba(255,255,255,0.4)' },
                    '50%': { boxShadow: '0 0 30px 8px rgba(255,255,255,0.9)' },
                },
                'lane-flash': {
                    '0%': { backgroundColor: 'rgba(255,255,255,0.3)' },
                    '100%': { backgroundColor: 'transparent' },
                },
                'visualizer-bar': {
                    '0%, 100%': { transform: 'scaleY(0.3)' },
                    '50%': { transform: 'scaleY(1)' },
                },
            },
            boxShadow: {
                'neon-cyan': '0 0 20px 4px #00f0ff',
                'neon-green': '0 0 20px 4px #39ff14',
                'neon-yellow': '0 0 20px 4px #ffe500',
                'neon-magenta': '0 0 20px 4px #ff2d9b',
                'judgment': '0 0 20px 6px rgba(255,255,255,0.8)',
            },
        },
    },
    plugins: [],
}
