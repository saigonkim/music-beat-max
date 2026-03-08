import { memo, useMemo } from 'react'
import type { Note as NoteType } from '../../game/types'

// ============================================================
// Note — 개별 노트 블록 컴포넌트 (GPU 가속 translateY 사용)
// ============================================================

interface NoteProps {
    note: NoteType
    color: string
    glowShadow: string
    laneHeightPx: number
    judgmentLineY: number   // px from top
    noteDropMs: number      // 낙하에 걸리는 시간 (ms)
    audioTime: number       // AudioContext.currentTime (초)
}

const NOTE_HEIGHT = 32 // px

export const Note = memo(function Note({
    note,
    color,
    glowShadow,
    judgmentLineY,
    noteDropMs,
    audioTime,
}: NoteProps) {
    // 노트 y 위치 계산 (GPU 레이어에서 translateY로 이동)
    // spawnTime = targetTime - noteDropDuration
    const noteDropSec = useMemo(() => noteDropMs / 1000, [noteDropMs])

    const spawnTime = note.targetTime - noteDropSec
    const elapsed = audioTime - spawnTime        // 0 → noteDropSec

    // 예고 쉐도우 렌더링 (낙하 0.5초 전부터)
    if (elapsed < 0 && elapsed >= -0.5) {
        const shadowOpacity = (0.5 + elapsed) * 0.8 // 0 -> 0.4
        return (
            <div
                className="absolute top-0 left-1 right-1 gpu-layer rounded-md"
                style={{
                    height: NOTE_HEIGHT,
                    transform: `translateY(0px)`,
                    backgroundColor: color,
                    opacity: shadowOpacity,
                    boxShadow: glowShadow,
                }}
                aria-hidden="true"
            />
        )
    }

    const progress = elapsed / noteDropSec        // 0.0 ~ 1.0+
    const y = progress * judgmentLineY - NOTE_HEIGHT // 음수 → 화면 위, 양수 → 판정선

    // 화면 범위 밖이면 렌더 스킵
    if (y > judgmentLineY + NOTE_HEIGHT || elapsed < -0.5) return null

    // 판정선 근처일수록 노트 밝기 증가 (트리거 인지 강화)
    const brightness = Math.min(1, Math.max(0.6, 0.6 + progress * 0.4))

    return (
        <div
            className="absolute top-0 left-1 right-1 gpu-layer rounded-md transition-shadow"
            style={{
                height: NOTE_HEIGHT,
                transform: `translateY(${y}px)`,
                backgroundColor: color,
                opacity: brightness,
                boxShadow: glowShadow,
                // 노트 내부 하이라이트
                backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 100%)`,
            }}
            aria-hidden="true"
        />
    )
})
