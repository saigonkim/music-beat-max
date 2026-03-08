import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Note } from '../components/GameScreen/Note'

describe('Note component', () => {
    const defaultProps = {
        note: { id: 'test-1', lane: 0 as const, targetTime: 5.0, judged: false, judgment: null },
        color: '#ff0000',
        glowShadow: '0 0 10px #ff0000',
        laneHeightPx: 800,
        judgmentLineY: 680,
        noteDropMs: 2000,
    }

    it('renders null when note is out of bounds (before spawn time)', () => {
        // Spawn time is targetTime - noteDropSec = 5.0 - 2.0 = 3.0s
        // If audioTime is 2.0s, elapsed = 2.0 - 3.0 = -1.0
        // progress = -0.5 -> y is out of screen (-340)
        const { container } = render(<Note {...defaultProps} audioTime={2.0} />)
        expect(container.firstChild).toBeNull()
    })

    it('renders note at correct Y position during drop', () => {
        // Audio time 4.0 -> elapsed 1.0s -> progress 0.5 -> y = 340 - 32 = 308
        const { container } = render(<Note {...defaultProps} audioTime={4.0} />)
        const noteDiv = container.firstChild as HTMLElement
        expect(noteDiv).not.toBeNull()
        expect(noteDiv.style.transform).toBe('translateY(308px)')
    })

    it('reaches judgment line exactly at target time', () => {
        // Audio time 5.0 -> elapsed 2.0s -> progress 1.0 -> y = 680 - 32 = 648
        const { container } = render(<Note {...defaultProps} audioTime={5.0} />)
        const noteDiv = container.firstChild as HTMLElement
        expect(noteDiv).not.toBeNull()
        expect(noteDiv.style.transform).toBe('translateY(648px)')
    })
})
