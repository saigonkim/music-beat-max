import { memo, useMemo } from 'react'
import type { LaneIndex } from '../../game/constants'
import { LANE_COLORS, LANE_GLOW } from '../../game/constants'
import { useGameStore } from '../../game/useGameStore'
import { Note } from './Note'

// ============================================================
// Lane — 단일 레인 컴포넌트 (React.memo로 최적화)
// ============================================================

interface LaneProps {
    laneIndex: LaneIndex
    laneHeightPx: number
    laneWidthPx: number
    judgmentLineY: number // px from top
}

export const Lane = memo(function Lane({
    laneIndex,
    laneHeightPx,
    laneWidthPx,
    judgmentLineY,
}: LaneProps) {
    const color = LANE_COLORS[laneIndex]
    const glow = LANE_GLOW[laneIndex]
    const flash = useGameStore((s) => s.laneFlash[laneIndex])
    const noteDropMs = useGameStore((s) => s.noteDropMs)
    const audioTime = useGameStore((s) => s.audioTime)
    const notes = useGameStore((s) => s.notes)

    // 이 레인에 속하는 미판정 노트만 필터링
    const laneNotes = useMemo(
        () => notes.filter((n) => n.lane === laneIndex && !n.judged),
        [notes, laneIndex]
    )

    return (
        <div
            className="relative overflow-hidden"
            style={{
                width: laneWidthPx,
                height: laneHeightPx,
                borderLeft: `1px solid ${color}30`,
                borderRight: `1px solid ${color}30`,
                background: flash ? `linear-gradient(to top, ${color}60 0%, ${color}00 80%)` : 'transparent',
                transition: 'background 80ms ease-out',
            }}
            aria-label={`Lane ${laneIndex}`}
        >
            {/* Lane accent line (top glow) */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{ background: color, boxShadow: glow, opacity: 0.4 }}
            />

            {/* Notes */}
            {laneNotes.map((note) => (
                <Note
                    key={note.id}
                    note={note}
                    color={color}
                    glowShadow={glow}
                    laneHeightPx={laneHeightPx}
                    judgmentLineY={judgmentLineY}
                    noteDropMs={noteDropMs}
                    audioTime={audioTime}
                />
            ))}
        </div>
    )
})
