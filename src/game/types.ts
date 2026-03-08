import type { LaneIndex } from './constants'

// ============================================================
// Core Game Types
// ============================================================

export type JudgmentType = 'PERFECT' | 'GOOD' | 'MISS' | null

export interface Note {
    /** 유니크 ID */
    id: string
    /** 노트가 속한 레인 (0=D, 1=F, 2=J, 3=K) */
    lane: LaneIndex
    /** 판정선에 도달해야 하는 오디오 시각 (AudioContext.currentTime 기준, 초) */
    targetTime: number
    /** 판정 완료 여부 */
    judged: boolean
    /** 판정 결과 */
    judgment: JudgmentType
}

export interface JudgmentEvent {
    type: JudgmentType
    lane: LaneIndex
    timestamp: number
    noteId: string
}

export type Scene = 'title' | 'countdown' | 'game' | 'result'

export interface GameStats {
    score: number
    combo: number
    maxCombo: number
    perfect: number
    good: number
    miss: number
    accuracy: number // 0~100
}
