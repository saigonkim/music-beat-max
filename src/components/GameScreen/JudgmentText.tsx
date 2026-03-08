import { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../../game/useGameStore'

// ============================================================
// JudgmentText — PERFECT!/GOOD/MISS 팝업 이펙트 (FBM Trigger)
// ============================================================

const JUDGMENT_CONFIG = {
    PERFECT: {
        text: 'PERFECT!',
        color: '#facc15',
        shadow: '0 0 30px #facc15, 0 0 60px #facc1580',
        scale: [0.4, 1.15, 1.0],
    },
    GOOD: {
        text: 'GOOD',
        color: '#22c55e',
        shadow: '0 0 20px #22c55e',
        scale: [0.6, 1.05, 1.0],
    },
    MISS: {
        text: 'MISS',
        color: '#ef4444',
        shadow: '0 0 12px #ef4444',
        scale: [0.8, 1.0],
    },
} as const

export const JudgmentText = memo(function JudgmentText() {
    const lastJudgment = useGameStore((s) => s.lastJudgment)
    const lastJudgmentKey = useGameStore((s) => s.lastJudgmentKey)

    const config = lastJudgment ? JUDGMENT_CONFIG[lastJudgment] : null

    return (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
                {config && lastJudgment && (
                    <motion.p
                        key={lastJudgmentKey}
                        className="font-space text-6xl font-black tracking-tight select-none"
                        style={{ color: config.color, textShadow: config.shadow }}
                        initial={{ opacity: 0, scale: 0.4, y: 10 }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            scale: config.scale as unknown as number[],
                            y: [10, 0, 0, -20],
                        }}
                        transition={{ duration: 0.6, times: [0, 0.15, 0.6, 1] }}
                    >
                        {config.text}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    )
})
