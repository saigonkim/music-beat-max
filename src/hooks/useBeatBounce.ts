import { useEffect, useRef } from 'react'
import { audioEngine } from '../audio/AudioEngine'
import { useGameStore } from '../game/useGameStore'

/**
 * 오디오의 베이스 에너지를 분석하여 DOM 엘리먼트에 'Beat Bounce' 효과 적용
 * 콤보 티어가 올라갈수록 바운스 강도가 세짐
 */
export function useBeatBounce(
    targetRef: React.RefObject<HTMLElement>,
    enabled: boolean = true
) {
    const isRunning = useRef(false)

    useEffect(() => {
        if (!enabled || !targetRef.current) return
        isRunning.current = true

        let animationFrameId: number

        const updateBounce = () => {
            if (!isRunning.current) return

            const el = targetRef.current
            if (el) {
                // 현재 콤보 티어에 따라 바운스 스케일 배수 결정 (0=효과없음, 1=약함, 2=중간, 3=강함)
                const comboTier = useGameStore.getState().comboTier

                if (comboTier > 0) {
                    const bassEnergy = audioEngine.getBassEnergy() // 0.0 ~ 1.0
                    // energyThreshold를 주어 강한 비트에만 반응하도록
                    if (bassEnergy > 0.7) {
                        const intensity = (bassEnergy - 0.7) / 0.3 // 0 ~ 1
                        const scaleMultiplier = 0.02 * comboTier // 티어 1: 2%, 티어 3: 6% 확대
                        const scaleY = 1 + (intensity * scaleMultiplier)

                        el.style.transform = `translateX(-50%) scaleY(${scaleY})`
                    } else {
                        // 서서히 원래 크기로 복귀 (decay)
                        el.style.transform = `translateX(-50%) scaleY(1)`
                        el.style.transition = 'transform 0.1s ease-out'
                    }
                } else {
                    el.style.transform = `translateX(-50%) scaleY(1)`
                }
            }

            animationFrameId = requestAnimationFrame(updateBounce)
        }

        animationFrameId = requestAnimationFrame(updateBounce)

        return () => {
            isRunning.current = false
            cancelAnimationFrame(animationFrameId)
        }
    }, [enabled, targetRef])
}
