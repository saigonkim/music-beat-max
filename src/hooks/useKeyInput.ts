import { useEffect, useCallback } from 'react'
import { audioEngine } from '../audio/AudioEngine'
import { useGameStore } from '../game/useGameStore'
import { KEY_TO_LANE, LANE_KEYS } from '../game/constants'
import type { LaneKey } from '../game/constants'

// ============================================================
// useKeyInput — 이벤트 처리부: keydown → pressKey(lane, audioTime)
// ============================================================

export function useKeyInput(enabled: boolean) {
    const pressKey = useGameStore((s) => s.pressKey)

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!enabled) return
            // 반복 입력 무시 (키 꾹 누름)
            if (e.repeat) return

            const key = e.key.toLowerCase() as LaneKey
            if (!LANE_KEYS.includes(key)) return

            const lane = KEY_TO_LANE[key]
            // pressTime: AudioContext.currentTime - audioOffset
            // (If offset > 0, the audio was played earlier, so current song position is advanced.
            // Wait, standard timing: actual song time = audioEngine.currentTime - offset)
            const audioOffset = useGameStore.getState().audioOffset
            const pressTime = audioEngine.currentTime - audioOffset
            pressKey(lane, pressTime)
        },
        [enabled, pressKey]
    )

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [handleKeyDown])
}
