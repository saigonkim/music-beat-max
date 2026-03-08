import {
    PERFECT_WINDOW_MS,
    GOOD_WINDOW_MS,
    SCORE_PERFECT,
    SCORE_GOOD,
    SCORE_MISS,
} from './constants'
import type { Note, JudgmentType } from './types'
import type { LaneIndex } from './constants'

// ============================================================
// JudgeEngine — 판정 로직 (오디오 분석부)
// ============================================================

const SEC_TO_MS = 1000

export interface JudgeResult {
    type: JudgmentType
    score: number
    note: Note
}

/**
 * 레인에서 판정 가능한 가장 가까운 노트를 찾는다.
 * @param lane      입력된 레인 인덱스
 * @param pressTime 키 입력 시각 (AudioContext.currentTime 기준, 초)
 * @param notes     현재 활성 노트 배열
 */
export function findClosestNote(
    lane: LaneIndex,
    pressTime: number,
    notes: Note[]
): Note | null {
    const laneNotes = notes.filter(
        (n) => n.lane === lane && !n.judged
    )
    if (laneNotes.length === 0) return null

    // 판정선 기준 가장 가까운 노트 찾기
    let closest: Note | null = null
    let minDelta = Infinity

    for (const note of laneNotes) {
        const delta = Math.abs((pressTime - note.targetTime) * SEC_TO_MS)
        if (delta < minDelta && delta <= GOOD_WINDOW_MS) {
            minDelta = delta
            closest = note
        }
    }

    return closest
}

/**
 * 타이밍 차이(ms)를 판정 유형으로 변환한다.
 */
export function calcJudgment(deltaMs: number): JudgmentType {
    const abs = Math.abs(deltaMs)
    if (abs <= PERFECT_WINDOW_MS) return 'PERFECT'
    if (abs <= GOOD_WINDOW_MS) return 'GOOD'
    return 'MISS'
}

/**
 * 판정 유형 → 점수 반환
 */
export function judgmentToScore(type: JudgmentType): number {
    switch (type) {
        case 'PERFECT': return SCORE_PERFECT
        case 'GOOD': return SCORE_GOOD
        default: return SCORE_MISS
    }
}

/**
 * 키 입력 처리 메인 함수 — Note 배열에서 판정하고 결과를 반환
 */
export function judgeKeyPress(
    lane: LaneIndex,
    pressTimeSec: number,
    notes: Note[]
): JudgeResult | null {
    const note = findClosestNote(lane, pressTimeSec, notes)
    if (!note) return null

    const deltaMs = (pressTimeSec - note.targetTime) * SEC_TO_MS
    const type = calcJudgment(deltaMs)
    const score = judgmentToScore(type)

    return { type, score, note }
}
