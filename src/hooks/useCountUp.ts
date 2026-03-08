import { useEffect, useState } from 'react'

export function useCountUp(target: number, durationMs: number = 1000) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let startTime: number
        let animationFrameId: number

        const update = (time: number) => {
            if (!startTime) startTime = time
            const progress = Math.min((time - startTime) / durationMs, 1)

            // easeOutExpo
            const easeOutProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
            setCount(target * easeOutProgress)

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(update)
            } else {
                setCount(target)
            }
        }

        animationFrameId = requestAnimationFrame(update)
        return () => cancelAnimationFrame(animationFrameId)
    }, [target, durationMs])

    return count
}
