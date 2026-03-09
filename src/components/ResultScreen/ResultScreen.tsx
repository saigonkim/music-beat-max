import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../game/useGameStore'
import { useCountUp } from '../../hooks/useCountUp'
import { auth, signInWithGoogle, db } from '../../lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

// ============================================================
// ResultScreen — 게임 결과 화면
// ============================================================

const RANK_THRESHOLDS = [
    { rank: 'S', minAccuracy: 95, color: '#facc15', glow: '0 0 30px #facc15' },
    { rank: 'A', minAccuracy: 80, color: '#00f0ff', glow: '0 0 20px #00f0ff' },
    { rank: 'B', minAccuracy: 60, color: '#39ff14', glow: '0 0 16px #39ff14' },
    { rank: 'C', minAccuracy: 40, color: '#ff2d9b', glow: '0 0 12px #ff2d9b' },
    { rank: 'D', minAccuracy: 0, color: '#666', glow: 'none' },
]

export function ResultScreen() {
    const { getStats, resetGame, setScene, currentSongId } = useGameStore()
    const stats = getStats()

    const rank = RANK_THRESHOLDS.find((r) => stats.accuracy >= r.minAccuracy)!

    const [user, setUser] = useState<User | null>(null)
    const [hasSaved, setHasSaved] = useState(false)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
        })
        return () => unsubscribe()
    }, [])

    useEffect(() => {
        const saveScore = async () => {
            if (user && !hasSaved && stats.score > 0) {
                try {
                    setHasSaved(true)
                    await addDoc(collection(db, 'user_records'), {
                        uid: user.uid,
                        displayName: user.displayName || 'Anonymous',
                        songId: currentSongId || 'unknown',
                        score: stats.score,
                        accuracy: stats.accuracy,
                        maxCombo: stats.maxCombo,
                        perfect: stats.perfect,
                        good: stats.good,
                        miss: stats.miss,
                        createdAt: serverTimestamp()
                    })
                } catch (e) {
                    console.error('Error saving score', e)
                    setHasSaved(false)
                }
            }
        }
        saveScore()
    }, [user, hasSaved, stats.score, stats.accuracy, stats.maxCombo, stats.perfect, stats.good, stats.miss, currentSongId])

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle()
        } catch (error) {
            console.error(error)
        }
    }

    // Count Up Animations for Stats
    const displayScore = Math.floor(useCountUp(stats.score, 1500))
    const displayAccuracy = useCountUp(stats.accuracy, 1200)
    const displayCombo = Math.floor(useCountUp(stats.maxCombo, 1000))
    const displayPerfect = Math.floor(useCountUp(stats.perfect, 800))
    const displayGood = Math.floor(useCountUp(stats.good, 800))
    const displayMiss = Math.floor(useCountUp(stats.miss, 800))

    const retry = useCallback(() => {
        // 오디오 버퍼 조작 없이, 초기 노트 세팅으로만 재시작
        const initial = useGameStore.getState().initialNotes
        resetGame()
        useGameStore.getState().setNotes(initial)
        setScene('game')
    }, [resetGame, setScene])

    return (
        <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-6 overflow-hidden bg-game-bg px-4">
            {/* Rank badge */}
            <motion.div
                className="font-space text-9xl font-black"
                style={{ color: rank.color, textShadow: rank.glow }}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
            >
                {rank.rank}
            </motion.div>

            {/* Stats table */}
            <motion.div
                className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="grid grid-cols-2 gap-3 text-center">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                        <StatItem label="Score" value={displayScore.toLocaleString()} color="white" />
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                        <StatItem label="Accuracy" value={`${displayAccuracy.toFixed(1)}%`} color="#00f0ff" />
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                        <StatItem label="Max Combo" value={displayCombo.toLocaleString()} color="#ffe500" />
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                        <StatItem label="PERFECT" value={displayPerfect.toString()} color="#facc15" />
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                        <StatItem label="GOOD" value={displayGood.toString()} color="#22c55e" />
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
                        <StatItem label="MISS" value={displayMiss.toString()} color="#ef4444" />
                    </motion.div>
                </div>
            </motion.div>

            {/* Actions */}
            <motion.div
                className="flex gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
            >
                <button
                    className="rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple px-10 py-3 text-lg font-black uppercase text-black hover:scale-105 active:scale-95 transition-transform"
                    onClick={retry}
                    aria-label="Retry"
                >
                    RETRY
                </button>
                <button
                    className="rounded-xl border border-white/20 px-8 py-3 text-lg font-bold uppercase text-white hover:bg-white/10 active:scale-95 transition-all"
                    onClick={() => setScene('title')}
                    aria-label="Back to menu"
                >
                    MENU
                </button>
            </motion.div>

            {/* Login Prompt for Unauthenticated Users */}
            {!user && (
                <motion.div
                    className="mt-4 flex flex-col items-center gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                >
                    <p className="text-sm text-white/60">Want to save your high scores?</p>
                    <button
                        onClick={handleGoogleLogin}
                        className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-white/20 active:scale-95"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign in with Google
                    </button>
                </motion.div>
            )}

            {/* Authenticated User Info */}
            {user && (
                <motion.div
                    className="mt-4 flex flex-col items-center gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                >
                    <p className="text-xs text-white/40">Logged in as</p>
                    <p className="text-sm font-bold text-neon-cyan">{user.displayName || user.email}</p>
                </motion.div>
            )}
        </div>
    )
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="rounded-lg bg-white/5 p-3">
            <p className="text-xs uppercase tracking-wider text-white/40">{label}</p>
            <p className="mt-1 font-mono text-xl font-bold" style={{ color }}>
                {value}
            </p>
        </div>
    )
}
