import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Note, JudgmentType, Scene, GameStats } from '../game/types'
import type { LaneIndex, ComboTier } from '../game/constants'
import {
    COMBO_TIER_THRESHOLDS,
    DEFAULT_SPEED_LEVEL,
    NOTE_SPEED_LEVELS,
} from '../game/constants'
import { judgeKeyPress } from '../game/JudgeEngine'

// ============================================================
// Zustand Game Store — 전역 게임 상태 관리
// ============================================================

interface GameStore {
    // ── Scene ──────────────────────────────
    scene: Scene
    setScene: (scene: Scene) => void

    currentBpm: number
    setCurrentBpm: (bpm: number) => void

    // ── Audio ──────────────────────────────
    audioTime: number
    setAudioTime: (t: number) => void

    // ── Notes ──────────────────────────────
    notes: Note[]
    initialNotes: Note[] // 재시도 시 복구용
    setNotes: (notes: Note[]) => void

    // ── Score ──────────────────────────────
    score: number
    combo: number
    maxCombo: number
    perfect: number
    good: number
    miss: number

    // ── UI State ───────────────────────────
    lastJudgment: JudgmentType
    lastJudgmentKey: number          // 판정 텍스트 재실행 트리거용 key
    lastJudgmentLane: LaneIndex | null
    comboTier: ComboTier
    laneFlash: [boolean, boolean, boolean, boolean] // D, F, J, K

    // ── Settings ───────────────────────────
    speedLevel: number               // 0~4 (NOTE_SPEED_LEVELS 인덱스)
    noteDropMs: number               // 실제 낙하 시간(ms)
    audioOffset: number              // 사운드 딜레이 보정 (초)

    // ── Actions ────────────────────────────
    pressKey: (lane: LaneIndex, pressTimeSec: number) => void
    checkMissedNotes: (audioTimeSec: number) => void
    resetGame: () => void
    setSpeedLevel: (level: number) => void
    setAudioOffset: (offset: number) => void
    getStats: () => GameStats
}

const calcComboTier = (combo: number): ComboTier => {
    for (let i = COMBO_TIER_THRESHOLDS.length - 1; i >= 0; i--) {
        if (combo >= COMBO_TIER_THRESHOLDS[i]) return i as ComboTier
    }
    return 0
}

const initState = {
    scene: 'title' as Scene,
    currentBpm: 128,
    audioTime: 0,
    notes: [] as Note[],
    initialNotes: [] as Note[],
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfect: 0,
    good: 0,
    miss: 0,
    lastJudgment: null as JudgmentType,
    lastJudgmentKey: 0,
    lastJudgmentLane: null as LaneIndex | null,
    comboTier: 0 as ComboTier,
    laneFlash: [false, false, false, false] as [boolean, boolean, boolean, boolean],
    speedLevel: DEFAULT_SPEED_LEVEL,
    noteDropMs: NOTE_SPEED_LEVELS[DEFAULT_SPEED_LEVEL],
    audioOffset: 0,
}

export const useGameStore = create<GameStore>()(
    subscribeWithSelector((set, get) => ({
        ...initState,

        setScene: (scene) => set({ scene }),
        setCurrentBpm: (bpm) => set({ currentBpm: bpm }),

        setAudioTime: (audioTime) => set({ audioTime }),

        setNotes: (notes) => {
            const fresh = notes.map(n => ({ ...n, judged: false, judgment: null }))
            set({ notes: fresh, initialNotes: [...fresh] })
        },

        setSpeedLevel: (level) => {
            const clamped = Math.max(0, Math.min(4, level))
            set({ speedLevel: clamped, noteDropMs: NOTE_SPEED_LEVELS[clamped] })
        },

        setAudioOffset: (offset) => set({ audioOffset: offset }),

        pressKey: (lane, pressTimeSec) => {
            const { notes } = get()
            const result = judgeKeyPress(lane, pressTimeSec, notes)

            // 레인 플래시 (키 입력 시 항상)
            const flash = [...get().laneFlash] as [boolean, boolean, boolean, boolean]
            flash[lane] = true
            set({ laneFlash: flash })
            setTimeout(() => {
                const f = [...get().laneFlash] as [boolean, boolean, boolean, boolean]
                f[lane] = false
                set({ laneFlash: f })
            }, 120)

            if (!result) {
                // 빈 입력 시 MISS 처리하지 않음 (그냥 무시하여 FBM 흐름 방해 최소화)
                // 만약 빈 입력을 MISS로 처리하고 싶다면 주석을 해제할 것.
                /*
                set((s) => ({
                    combo: 0,
                    miss: s.miss + 1,
                    lastJudgment: 'MISS',
                    lastJudgmentKey: s.lastJudgmentKey + 1,
                    lastJudgmentLane: lane,
                    comboTier: 0,
                }))
                */
                return
            }

            // 노트 판정 처리
            const updatedNotes = notes.map((n) =>
                n.id === result.note.id
                    ? { ...n, judged: true, judgment: result.type }
                    : n
            )

            set((s) => {
                const newCombo =
                    result.type === 'MISS' ? 0 : s.combo + 1
                const newMax = Math.max(newCombo, s.maxCombo)
                const newTier = calcComboTier(newCombo)

                return {
                    notes: updatedNotes,
                    score: s.score + result.score,
                    combo: newCombo,
                    maxCombo: newMax,
                    perfect: result.type === 'PERFECT' ? s.perfect + 1 : s.perfect,
                    good: result.type === 'GOOD' ? s.good + 1 : s.good,
                    miss: result.type === 'MISS' ? s.miss + 1 : s.miss,
                    lastJudgment: result.type,
                    lastJudgmentKey: s.lastJudgmentKey + 1,
                    lastJudgmentLane: lane,
                    comboTier: newTier,
                }
            })
        },

        checkMissedNotes: (audioTimeSec: number) => {
            set((s) => {
                let missedCount = 0
                const updatedNotes = s.notes.map((n) => {
                    if (!n.judged) {
                        // GOOD 윈도우(150ms)를 초과하여 지나가버린 노트는 자동 MISS 처리
                        const deltaMs = (audioTimeSec - n.targetTime) * 1000
                        if (deltaMs > 150) { // GOOD_WINDOW_MS
                            missedCount++
                            return { ...n, judged: true, judgment: 'MISS' as JudgmentType }
                        }
                    }
                    return n
                })

                if (missedCount === 0) return s

                return {
                    notes: updatedNotes,
                    combo: 0,
                    comboTier: 0,
                    miss: s.miss + missedCount,
                    lastJudgment: 'MISS',
                    lastJudgmentKey: s.lastJudgmentKey + 1,
                    lastJudgmentLane: null, // 특정 레인 강조 안함
                }
            })
        },

        resetGame: () =>
            set((state) => ({
                ...initState,
                scene: 'title',
                speedLevel: state.speedLevel,
                noteDropMs: state.noteDropMs,
                audioOffset: state.audioOffset,
                currentBpm: state.currentBpm,
                initialNotes: state.initialNotes, // 재시작을 위해 초기 노트 백업본 유지
            })),

        getStats: (): GameStats => {
            const { score, combo, maxCombo, perfect, good, miss } = get()
            const total = perfect + good + miss
            const accuracy = total > 0 ? ((perfect + good * 0.5) / total) * 100 : 0
            return { score, combo, maxCombo, perfect, good, miss, accuracy }
        },
    }))
)
