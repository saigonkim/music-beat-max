import { useEffect, useRef } from 'react'
import { audioEngine } from '../audio/AudioEngine'
import { useGameStore } from '../game/useGameStore'

// ============================================================
// useAudioSync — RAF 루프: AudioContext.currentTime → Zustand
// ============================================================
// setInterval을 사용하지 않고 requestAnimationFrame 루프로
// 오디오 타임을 게임 스토어에 동기화한다.

export function useAudioSync(enabled: boolean) {
    const setAudioTime = useGameStore((s) => s.setAudioTime)
    const rafRef = useRef<number>(0)

    useEffect(() => {
        if (!enabled) {
            cancelAnimationFrame(rafRef.current)
            return
        }

        const loop = () => {
            // Single Source of Truth: AudioContext.currentTime, 오프셋 보정 반영
            const current = audioEngine.currentTime
            const offset = useGameStore.getState().audioOffset
            const syncTime = current - offset

            setAudioTime(syncTime)
            useGameStore.getState().checkMissedNotes(syncTime)
            rafRef.current = requestAnimationFrame(loop)
        }

        rafRef.current = requestAnimationFrame(loop)

        return () => {
            cancelAnimationFrame(rafRef.current)
        }
    }, [enabled, setAudioTime])
}
