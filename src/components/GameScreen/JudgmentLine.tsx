import { memo } from 'react'

// ============================================================
// JudgmentLine — 하단 판정선 (FBM Trigger 구현)
// ============================================================

interface JudgmentLineProps {
    width: number
}

export const JudgmentLine = memo(function JudgmentLine({ width }: JudgmentLineProps) {
    return (
        <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ width, bottom: '15%' }}
            aria-label="Judgment line"
        >
            {/* 메인 판정선 — animate-pulse-beat (468.75ms, 128BPM) */}
            <div
                className="judgment-line"
                style={{
                    height: 4,
                    background: 'linear-gradient(90deg, transparent 0%, white 15%, white 85%, transparent 100%)',
                    borderRadius: 2,
                }}
            />
            {/* 보조 글로우 레이어 */}
            <div
                style={{
                    height: 2,
                    marginTop: 2,
                    background: 'rgba(255,255,255,0.3)',
                    filter: 'blur(4px)',
                }}
            />
            {/* 좌우 삼각형 마커 */}
            <div className="absolute -left-1 top-1/2 -translate-y-1/2">
                <div
                    style={{
                        width: 0,
                        height: 0,
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent',
                        borderLeft: '12px solid white',
                        filter: 'drop-shadow(0 0 4px white)',
                    }}
                />
            </div>
            <div className="absolute -right-1 top-1/2 -translate-y-1/2">
                <div
                    style={{
                        width: 0,
                        height: 0,
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent',
                        borderRight: '12px solid white',
                        filter: 'drop-shadow(0 0 4px white)',
                    }}
                />
            </div>
        </div>
    )
})
