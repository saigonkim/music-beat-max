import { motion, AnimatePresence } from 'framer-motion'

export function CountdownOverlay() {
    return (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-50">
            {[3, 2, 1].map((n, idx) => (
                <AnimateNumber key={n} n={n} delay={idx * 1} />
            ))}
            <AnimatePresence>
                <motion.p
                    key="go"
                    className="absolute text-8xl font-black font-space text-neon-cyan"
                    style={{ textShadow: '0 0 40px #00f0ff' }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 0.8, delay: 3.0, times: [0, 0.3, 0.6, 1] }}
                >
                    GO!
                </motion.p>
            </AnimatePresence>
        </div>
    )
}

function AnimateNumber({ n, delay }: { n: number; delay: number }) {
    return (
        <motion.p
            className="absolute text-9xl font-black font-space text-white"
            style={{ textShadow: '0 0 20px rgba(255,255,255,0.8)' }}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: [1.5, 1, 0.5], opacity: [0, 1, 0] }}
            transition={{ duration: 1, delay, ease: 'easeInOut' }}
        >
            {n}
        </motion.p>
    )
}
