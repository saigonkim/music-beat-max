import type { Note } from './types'
import type { LaneIndex } from './constants'
import { BEAT_DURATION_SEC } from './constants'

// ============================================================
// noteChart — 128 BPM EDM 노트 차트 데이터 및 스크립트 파서
// ============================================================

export interface ChartSegment {
    startTime: number // 구간 시작 (초)
    endTime: number   // 구간 종료 (초)
    phrase: string    // 구간 명칭 (Intro, Drop 등)
    density: number   // 노트 밀도 (0.0 ~ 2.0 등)
    patterns: string[]// 설명 혹은 렌더 힌트
}

const BEAT = BEAT_DURATION_SEC

/**
 * 노트 차트 데이터를 생성한다.
 * @param offsetSec 곡 시작 기준 오프셋 (초) — 카운트다운 보정용
 * @param totalDurationSec 곡 전체 길이 (초) - 길이에 맞춰 패턴 반복
 */
export function generateNoteChart(offsetSec: number = 0, totalDurationSec: number = 40): Note[] {
    const notes: Note[] = []
    let id = 0

    const addNote = (beat: number, lane: LaneIndex) => {
        notes.push({
            id: `note-${id++}`,
            lane,
            targetTime: offsetSec + beat * BEAT,
            judged: false,
            judgment: null,
        })
    }

    const totalBeats = Math.floor(totalDurationSec / BEAT) - 4 // 마지막 2초(약 4비트)는 노트 생성 여유

    // ──────────────────────────────────────────────────────────
    // Section 1: Intro (beat 0~15, 느린 패턴 — FBM Ability)
    // ──────────────────────────────────────────────────────────
    const introMax = Math.min(15, totalBeats)
    for (let b = 0; b <= introMax; b += 2) {
        addNote(b, (b / 2) % 4 as LaneIndex)
    }

    // ──────────────────────────────────────────────────────────
    // Section 2: Build-up, Drop, Pattern loop
    // ──────────────────────────────────────────────────────────
    const dropPattern: LaneIndex[] = [0, 1, 2, 3, 2, 1, 0, 3]

    for (let b = 16; b <= totalBeats; b++) {
        // 매 64비트마다 패턴 변화 (Build-up, Drop 반복)
        const cycle = b % 64

        if (cycle < 16) {
            // Build Up
            addNote(b, (b % 4) as LaneIndex)
        } else if (cycle < 48) {
            // Drop 밀도 높은 패턴
            addNote(b, dropPattern[b % dropPattern.length])
            // 짝수 비트에 동시타
            if (b % 2 === 0) {
                const secondLane = ((dropPattern[b % dropPattern.length] + 2) % 4) as LaneIndex
                addNote(b + 0.5, secondLane)
            }
        } else {
            // Outro or break
            if (b % 2 === 0) {
                addNote(b, ((b / 2) % 4) as LaneIndex)
            }
        }
    }

    return notes.sort((a, b) => a.targetTime - b.targetTime)
}

/**
 * Procedural Script(구간 배열)를 읽어 실제 곡 길이에 맞춘 노트를 런타임에 배열한다.
 * @param script ChartSegment 배열 (구간별 노트 규칙)
 * @param offsetSec 오프셋/리드인 딜레이 (초)
 * @param bpm 곡의 실제 BPM
 * @param totalDurationSec 곡 재생 총 시간 (초)
 */
export function parseChartScript(
    script: ChartSegment[],
    offsetSec: number,
    bpm: number,
    totalDurationSec: number
): Note[] {
    const notes: Note[] = []
    let id = 0

    // 비트당 시간 계산 (초)
    const beatDurationSec = 60 / bpm

    script.forEach(segment => {
        const start = segment.startTime
        // 구간의 끝점은 해당 segment의 endTime 또는 곡 전체 길이 중 작은 값
        const end = Math.min(segment.endTime, totalDurationSec)

        let currentTime = start

        while (currentTime < end) {
            // 밀도(Density)에 따라 노트를 찍는 간격(Gap)을 구한다.
            // density 1.0 = 반박자(8분음표)마다 1개
            // density 0.5 = 1박자(4분음표)마다 1개
            // density 2.0 = 1/4박자(16분음표) 조합 등
            let gapBeats = 1
            if (segment.density >= 1.5) gapBeats = 0.25
            else if (segment.density >= 1.0) gapBeats = 0.5
            else if (segment.density >= 0.8) gapBeats = (Math.random() > 0.5 ? 0.5 : 1)
            else if (segment.density >= 0.5) gapBeats = 1
            else if (segment.density >= 0.3) gapBeats = 2
            else gapBeats = 4

            currentTime += gapBeats * beatDurationSec

            if (currentTime >= end) break;

            // 라인(레인) 배정 (밀도가 높으면 규칙적, 낮으면 단순 랜덤 등 응용 가능)
            // 여기서는 단순성을 위해 난수를 사용하되, density가 높을수록 동시치기 확률 상승
            const lane = Math.floor(Math.random() * 4) as LaneIndex
            notes.push({
                id: `note-${id++}`,
                lane,
                targetTime: offsetSec + currentTime,
                judged: false,
                judgment: null,
            })

            // 밀도가 1.2 이상이면 30% 확률로 동시치기(이중 노트) 추가
            if (segment.density >= 1.2 && Math.random() > 0.7) {
                const lane2 = (lane + 2) % 4 as LaneIndex
                notes.push({
                    id: `note-${id++}`,
                    lane: lane2,
                    targetTime: offsetSec + currentTime,
                    judged: false,
                    judgment: null,
                })
            }
        }
    })

    // 최종적으로 시간순 정렬하여 리턴
    return notes.sort((a, b) => a.targetTime - b.targetTime)
}
