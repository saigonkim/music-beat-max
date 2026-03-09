import { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../game/useGameStore'
import { useAudioSync } from '../../audio/useAudioSync'
import { useKeyInput } from '../../hooks/useKeyInput'
import { audioEngine } from '../../audio/AudioEngine'
import { Lane } from './Lane'
import { JudgmentLine } from './JudgmentLine'
import { JudgmentText } from './JudgmentText'
import { ScorePanel } from './ScorePanel'
import { Visualizer } from './Visualizer'
import { CountdownOverlay } from './CountdownOverlay'
import { LANE_COLORS, JUDGMENT_LINE_PCT } from '../../game/constants'
import type { LaneIndex } from '../../game/constants'
import { useRef, useMemo } from 'react'
import { useBeatBounce } from '../../hooks/useBeatBounce'
import { useWindowSize } from '../../hooks/useWindowSize'

// ============================================================
// GameScreen — 메인 게임 화면 (RAF 루프 최상위 구독)
// ============================================================

const LANE_COUNT = 4

export function GameScreen() {
    const { setScene, audioTime, comboTier, laneFlash, pressKey, currentBpm } = useGameStore()

    // Responsive Dimensions
    const size = useWindowSize()
    const GAME_WIDTH = useMemo(() => Math.min(size.width, 640), [size.width])
    const LANE_WIDTH = useMemo(() => Math.floor(GAME_WIDTH / LANE_COUNT), [GAME_WIDTH])
    const GAME_HEIGHT = size.height
    const JUDGMENT_Y = useMemo(() => Math.floor(GAME_HEIGHT * JUDGMENT_LINE_PCT), [GAME_HEIGHT])

    // RAF 루프 시작 (AudioContext.currentTime → Zustand)
    useAudioSync(true)
    // 키 입력 처리
    useKeyInput(true)

    // Beat Bounce 효과용 ref
    const laneContainerRef = useRef<HTMLDivElement>(null)
    useBeatBounce(laneContainerRef, true)

    // 오디오 시작 (3초 리드인 대기 후 재생)
    useEffect(() => {
        audioEngine.play(0, 3.0)
        return () => { audioEngine.stop() }
    }, [])

    // 곡 종료 감지 (노트가 모두 끝났거나, 오디오가 완전히 종료된 경우)
    useEffect(() => {
        // 모든 노트가 판정되었는지 확인
        const allNotesJudged = useGameStore.getState().notes.every(n => n.judged)
        const notesExist = useGameStore.getState().notes.length > 0

        // 오디오가 실질적으로 종료되었는지 확인 (여유 2초)
        const audioFinished = audioEngine.duration > 0 && audioTime >= audioEngine.duration + 2.0

        if ((notesExist && allNotesJudged) || audioFinished) {
            // 약간의 딜레이 후 결과 화면으로 이동하여 마지막 시각적 피드백 유지
            const timer = setTimeout(() => {
                setScene('result')
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [audioTime, setScene])




    // 터치 입력 핸들러 추가
    const handleHit = useCallback((lane: LaneIndex) => {
        pressKey(lane, audioEngine.currentTime)
    }, [pressKey])

    // 콤보 등급별 배경 강도
    const bgIntensity = [0, 0.05, 0.1, 0.2][comboTier]

    return (
        <div
            className="relative flex h-[100dvh] w-full flex-col items-center overflow-hidden bg-game-bg"
            role="main"
            aria-label="Game play area"
        >
            {/* Dynamic background glow (FBM Motivation) */}
            <motion.div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: `radial-gradient(ellipse at center, rgba(155,48,255,${bgIntensity}) 0%, transparent 70%)`,
                }}
                animate={{ opacity: comboTier > 0 ? 1 : 0 }}
                transition={{ duration: 0.5 }}
            />

            {/* Audio Visualizer (bottom) */}
            <Visualizer />

            {/* Countdown Overlay (3, 2, 1, GO!) */}
            <CountdownOverlay />

            {/* Score Panel (top-left) */}
            <ScorePanel />

            {/* Top-right info */}
            <div className="pointer-events-none absolute right-4 top-4 text-right">
                <p className="font-space text-xs uppercase tracking-widest text-white/50">
                    BEAT SYNC
                </p>
                <p className="font-mono text-sm font-bold text-neon-cyan">{currentBpm} BPM</p>
                <div className="mt-1 h-1 w-32 overflow-hidden rounded-full bg-white/20">
                    <div
                        className="h-full rounded-full bg-neon-cyan transition-all"
                        style={{
                            width: audioEngine.duration > 0
                                ? `${(audioTime / audioEngine.duration) * 100}%`
                                : '0%',
                        }}
                    />
                </div>
            </div>



            {/* Lane area */}
            <div
                ref={laneContainerRef}
                className="absolute flex origin-bottom transition-transform"
                style={{
                    width: GAME_WIDTH,
                    height: GAME_HEIGHT,
                    left: '50%',
                    transform: 'translateX(-50%)',
                }}
            >
                {([0, 1, 2, 3] as LaneIndex[]).map((i) => (
                    <Lane
                        key={i}
                        laneIndex={i}
                        laneHeightPx={GAME_HEIGHT}
                        laneWidthPx={LANE_WIDTH}
                        judgmentLineY={JUDGMENT_Y}
                    />
                ))}
            </div>

            {/* Judgment Line */}
            <JudgmentLine width={GAME_WIDTH} />

            {/* Judgment Text (center overlay) */}
            <JudgmentText />

            {/* Bottom key indicators */}
            <div
                className="absolute flex z-50 touch-none select-none"
                style={{
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bottom: 0,
                    width: GAME_WIDTH,
                    height: GAME_HEIGHT * (1 - JUDGMENT_LINE_PCT)
                }}
            >
                {(['D', 'F', 'J', 'K'] as const).map((label, i) => {
                    const active = laneFlash[i]
                    return (
                        <div
                            key={label}
                            onPointerDown={(e) => {
                                e.preventDefault() // 브라우저 기본 터치/스크롤 방지
                                handleHit(i as LaneIndex)
                            }}
                            className="flex cursor-pointer items-center justify-center text-xl font-black uppercase transition-all shadow-lg active:brightness-150"
                            style={{
                                width: LANE_WIDTH,
                                height: '100%',
                                borderTop: `2px solid ${LANE_COLORS[i as LaneIndex]}`,
                                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                color: active ? '#fff' : LANE_COLORS[i as LaneIndex],
                                backgroundColor: active ? `${LANE_COLORS[i as LaneIndex]}33` : 'rgba(255,255,255,0.02)',
                                boxShadow: active ? `inset 0 0 30px ${LANE_COLORS[i as LaneIndex]}` : 'none',
                            }}
                        >
                            {label}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
