import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { User } from 'firebase/auth'

interface RecordItem {
    id: string
    songId: string
    score: number
    accuracy: number
    maxCombo: number
    createdAt: number
}

interface RecordsModalProps {
    isOpen: boolean
    onClose: () => void
    user: User | null
}

export function RecordsModal({ isOpen, onClose, user }: RecordsModalProps) {
    const [records, setRecords] = useState<RecordItem[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchRecords = async () => {
            if (!isOpen || !user) return
            setLoading(true)
            try {
                const q = query(
                    collection(db, 'user_records'),
                    where('uid', '==', user.uid),
                    orderBy('score', 'desc'),
                    limit(50)
                )
                const querySnapshot = await getDocs(q)
                const data: RecordItem[] = []
                querySnapshot.forEach((doc) => {
                    data.push({
                        id: doc.id,
                        songId: doc.data().songId,
                        score: doc.data().score,
                        accuracy: doc.data().accuracy,
                        maxCombo: doc.data().maxCombo,
                        createdAt: doc.data().createdAt?.toMillis() || Date.now()
                    })
                })
                setRecords(data)
            } catch (error) {
                console.error('Error fetching records:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchRecords()
    }, [isOpen, user])

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="relative max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl border border-white/20 bg-black/60 shadow-2xl backdrop-blur-md"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫히지 않음
                >
                    <div className="border-b border-white/10 px-6 py-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">My Records</h2>
                        <button
                            onClick={onClose}
                            className="text-white/50 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(80vh - 70px)' }}>
                        {!user ? (
                            <p className="text-center text-white/50 py-8">Please login to view records.</p>
                        ) : loading ? (
                            <p className="text-center text-white/50 py-8">Loading records...</p>
                        ) : records.length === 0 ? (
                            <p className="text-center text-white/50 py-8">No records found yet. Play a song!</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {records.map((r, i) => (
                                    <div
                                        key={r.id}
                                        className="flex items-center justify-between rounded-xl bg-white/5 p-4 border border-white/10"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 font-bold text-white/80">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm capitalize">{r.songId.replace(/-/g, ' ')}</p>
                                                <p className="text-xs text-white/40">
                                                    {new Date(r.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono text-lg font-black text-neon-cyan">
                                                {r.score.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-white/60">
                                                Acc: {r.accuracy.toFixed(1)}% | Max: {r.maxCombo}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
