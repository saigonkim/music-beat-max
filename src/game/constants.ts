// ============================================================
// Game Constants — 128 BPM 기반 모든 타이밍 상수
// ============================================================

export const BPM = 128

/** 1박자(beat) 시간(ms) = 60 / BPM * 1000 */
export const BEAT_DURATION_MS = (60 / BPM) * 1000 // 468.75ms

/** 1박자 시간(초) — Web Audio API currentTime 단위 */
export const BEAT_DURATION_SEC = 60 / BPM // 0.46875s

/** 판정 윈도우 (milliseconds) */
export const PERFECT_WINDOW_MS = 50
export const GOOD_WINDOW_MS = 150

/** 레인 키 매핑 */
export const LANE_KEYS = ['d', 'f', 'j', 'k'] as const
export type LaneKey = (typeof LANE_KEYS)[number]
export type LaneIndex = 0 | 1 | 2 | 3

/** 키 → 레인 인덱스 맵 */
export const KEY_TO_LANE: Record<LaneKey, LaneIndex> = {
    d: 0,
    f: 1,
    j: 2,
    k: 3,
}

/** 레인별 색상 (Tailwind arbitrary값 포함) */
export const LANE_COLORS: Record<LaneIndex, string> = {
    0: '#00f0ff', // Cyan — D
    1: '#39ff14', // Neon Green — F
    2: '#ffe500', // Yellow — J
    3: '#ff2d9b', // Magenta — K
}

export const LANE_GLOW: Record<LaneIndex, string> = {
    0: '0 0 20px 6px #00f0ff',
    1: '0 0 20px 6px #39ff14',
    2: '0 0 20px 6px #ffe500',
    3: '0 0 20px 6px #ff2d9b',
}

/** Note 낙하 설정 */
export const NOTE_SPEED_LEVELS = [3000, 2000, 1500, 1200, 1000] as const // ms to fall full lane
export const DEFAULT_SPEED_LEVEL = 1 // index into NOTE_SPEED_LEVELS (2000ms = 레벨 2)

/** 판정선 위치: 화면 높이의 % */
export const JUDGMENT_LINE_PCT = 0.85

/** 콤보 단계 임계값 → Visualizer 이펙트 강도 */
export const COMBO_TIER_THRESHOLDS = [0, 10, 30, 50] as const
export type ComboTier = 0 | 1 | 2 | 3

/** 점수 */
export const SCORE_PERFECT = 300
export const SCORE_GOOD = 100
export const SCORE_MISS = 0
