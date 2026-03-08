import { describe, it, expect } from 'vitest'
import { calcJudgment, judgeKeyPress } from '../game/JudgeEngine'
import type { Note } from '../game/types'

// ============================================================
// JudgeEngine 유닛 테스트 (TDD — Phase 4 검증)
// ============================================================

describe('calcJudgment', () => {
    it('returns PERFECT for |Δt| ≤ 50ms', () => {
        expect(calcJudgment(0)).toBe('PERFECT')
        expect(calcJudgment(49)).toBe('PERFECT')
        expect(calcJudgment(-49)).toBe('PERFECT')
        expect(calcJudgment(50)).toBe('PERFECT')
    })

    it('returns GOOD for 50ms < |Δt| ≤ 150ms', () => {
        expect(calcJudgment(51)).toBe('GOOD')
        expect(calcJudgment(150)).toBe('GOOD')
        expect(calcJudgment(-150)).toBe('GOOD')
    })

    it('returns MISS for |Δt| > 150ms', () => {
        expect(calcJudgment(151)).toBe('MISS')
        expect(calcJudgment(-200)).toBe('MISS')
    })
})

describe('judgeKeyPress', () => {
    const makeNote = (id: string, targetTime: number, lane = 0): Note => ({
        id,
        lane: lane as 0 | 1 | 2 | 3,
        targetTime,
        judged: false,
        judgment: null,
    })

    it('returns null when no notes in window', () => {
        const notes = [makeNote('n1', 10.0)]
        const result = judgeKeyPress(0, 0.0, notes) // delta = 10s → no match
        expect(result).toBeNull()
    })

    it('finds the closest note and returns PERFECT', () => {
        const notes = [makeNote('n1', 5.000)]
        const result = judgeKeyPress(0, 5.03, notes) // 30ms delta
        expect(result).not.toBeNull()
        expect(result!.type).toBe('PERFECT')
        expect(result!.score).toBe(300)
    })

    it('ignores already judged notes', () => {
        const judgedNote: Note = { ...makeNote('n1', 5.0), judged: true }
        const result = judgeKeyPress(0, 5.0, [judgedNote])
        expect(result).toBeNull()
    })

    it('picks closest note when multiple are within window', () => {
        const notes = [
            makeNote('n1', 5.000), // 0ms away — PERFECT
            makeNote('n2', 5.100), // 100ms away — GOOD
        ]
        const result = judgeKeyPress(0, 5.0, notes)
        expect(result!.note.id).toBe('n1')
        expect(result!.type).toBe('PERFECT')
    })

    it('ignores notes in different lanes', () => {
        const notes = [makeNote('n1', 5.0, 1)] // lane 1
        const result = judgeKeyPress(0, 5.0, notes)  // pressing lane 0
        expect(result).toBeNull()
    })
})
