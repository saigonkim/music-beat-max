import { memo, useEffect, useRef } from 'react'
import { audioEngine } from '../../audio/AudioEngine'

// ============================================================
// Visualizer — 콤보 기반 배경 Audio Visualizer (FBM Motivation)
// ============================================================

const BAR_COUNT = 48

export const Visualizer = memo(function Visualizer() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animRef = useRef<number>(0)

    useEffect(() => {
        // 항상 애니메이션 수행
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const draw = () => {
            const freqData = audioEngine.getFrequencyData()
            const w = canvas.width
            const h = canvas.height
            ctx.clearRect(0, 0, w, h)

            const barWidth = w / BAR_COUNT

            // 일정한 투명도 (Title 화면처럼 은은하게 유지)
            const opacity = 0.2

            for (let i = 0; i < BAR_COUNT; i++) {
                const idx = Math.floor((i / BAR_COUNT) * freqData.length)
                const value = freqData.length > 0 ? freqData[idx] / 255 : Math.random() * 0.2
                // 최소 높이 보장
                const barHeight = Math.max(value * h * 0.8, 5)

                // 위치에 따른 색상 그라디언트 (Cyan 계열로 고정하여 차분하게)
                ctx.fillStyle = `rgba(0, 240, 255, ${opacity})`

                // 둥근 사각형 느낌을 위해
                ctx.fillRect(
                    i * barWidth + 1,
                    h - barHeight,
                    barWidth - 2,
                    barHeight
                )
            }
            animRef.current = requestAnimationFrame(draw)
        }

        animRef.current = requestAnimationFrame(draw)
        return () => cancelAnimationFrame(animRef.current)
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{ width: '100%', height: '20%' }}
            width={800}
            height={150}
            aria-hidden="true"
        />
    )
})
