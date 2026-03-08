import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyInput } from '../hooks/useKeyInput'
import { useGameStore } from '../game/useGameStore'
import { audioEngine } from '../audio/AudioEngine'

describe('useKeyInput', () => {
    let mockPressKey: ReturnType<typeof vi.fn>

    beforeEach(() => {
        useGameStore.getState().resetGame()
        mockPressKey = vi.fn()
        useGameStore.setState({ pressKey: mockPressKey })
        vi.spyOn(audioEngine, 'currentTime', 'get').mockReturnValue(5.0)
    })

    it('should map keys to correct lanes when active', () => {
        renderHook(() => useKeyInput(true))

        // Test D -> Lane 0
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }))
        expect(mockPressKey).toHaveBeenCalledWith(0, 5.0)

        // Test F -> Lane 1
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }))
        expect(mockPressKey).toHaveBeenCalledWith(1, 5.0)

        // Test J -> Lane 2
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j' }))
        expect(mockPressKey).toHaveBeenCalledWith(2, 5.0)

        // Test K -> Lane 3
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }))
        expect(mockPressKey).toHaveBeenCalledWith(3, 5.0)
    })

    it('should not call pressKey for unmapped keys', () => {
        renderHook(() => useKeyInput(true))

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space' }))
        expect(mockPressKey).not.toHaveBeenCalled()
    })

    it('should not handle events when active is false', () => {
        renderHook(() => useKeyInput(false))

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }))
        expect(mockPressKey).not.toHaveBeenCalled()
    })
})
