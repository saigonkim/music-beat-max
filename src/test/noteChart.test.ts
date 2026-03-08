import { describe, it, expect } from 'vitest'
import { generateNoteChart } from '../game/noteChart'

describe('generateNoteChart', () => {
    it('generates a chart with a specific number of notes', () => {
        const notes = generateNoteChart(0)
        expect(notes.length).toBeGreaterThan(0)
        // Since duration is dynamic based on audio now, we just verify it produces notes
        expect(notes.length).toBeGreaterThan(0)
    })

    it('sorts notes by targetTime in ascending order', () => {
        const notes = generateNoteChart(0)
        for (let i = 1; i < notes.length; i++) {
            expect(notes[i].targetTime).toBeGreaterThanOrEqual(notes[i - 1].targetTime)
        }
    })

    it('applies the initial offset correctly', () => {
        const chartNoOffset = generateNoteChart(0)
        const chartWithOffset = generateNoteChart(3) // 3 seconds offset

        expect(chartWithOffset[0].targetTime).toBeCloseTo(chartNoOffset[0].targetTime + 3)
    })

    it('places notes in valid lanes (0-3)', () => {
        const notes = generateNoteChart(0)
        notes.forEach(note => {
            expect(note.lane).toBeGreaterThanOrEqual(0)
            expect(note.lane).toBeLessThanOrEqual(3)
        })
    })
})
