import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../game/useGameStore'

// ============================================================
// ScorePanel — 상단 점수 + 콤보 패널
// ============================================================

export const ScorePanel = memo(function ScorePanel() {
    const score = useGameStore((s) => s.score)
    const combo = useGameStore((s) => s.combo)

    return (
        <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1" aria-live="polite">
            {/* Score */}
            <div>
                <p className="font-space text-xs uppercase tracking-widest text-white/50">Score</p>
                <p className="font-mono text-4xl font-bold tabular-nums text-white">
                    {score.toLocaleString()}
                </p>
            </div>

            {/* Combo */}
            <AnimatePresence>
                {combo > 1 && (
                    <motion.div
                        key={combo}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        <p
                            className="font-space text-2xl font-black"
                            style={{
                                color: combo >= 50 ? '#ff2d9b' : combo >= 30 ? '#ffe500' : '#00f0ff',
                                textShadow: combo >= 50
                                    ? '0 0 16px #ff2d9b'
                                    : combo >= 30
                                        ? '0 0 12px #ffe500'
                                        : '0 0 8px #00f0ff',
                            }}
                        >
                            {combo}
                            <span className="ml-1 text-base font-bold opacity-70">COMBO</span>
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
})
