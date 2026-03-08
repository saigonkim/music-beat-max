import { ChartSegment } from '../noteChart'

export const ordinaryDaysWithYouScript: ChartSegment[] = [
    {
        startTime: 0,
        endTime: 20,
        phrase: 'Intro - 발단부',
        density: 0.4,
        patterns: ['정박 중심, 4비트 느낌', '주로 D와 K 사용']
    },
    {
        startTime: 20,
        endTime: 50,
        phrase: 'Verse 1 - 멜로디 전개',
        density: 0.6,
        patterns: ['메인 비트(8분 음표) 간격으로 노트 등장', '기본적인 리듬감']
    },
    {
        startTime: 50,
        endTime: 70,
        phrase: 'Build-up - 고조되는 구간',
        density: 0.9,
        patterns: ['노트 갯수 점진적 증가', '8분 음표 빈도 상승']
    },
    {
        startTime: 70,
        endTime: 105,
        phrase: 'Drop - 사비 (가장 신나는 구간)',
        density: 1.2,
        patterns: ['동시치기(다중 노트) 생성', '경쾌한 템포감 연출']
    },
    {
        startTime: 105,
        endTime: 140,
        phrase: 'Verse 2 / Interlude',
        density: 0.7,
        patterns: ['다시 차분해지는 구간', '완급 조절용 패시지']
    },
    {
        startTime: 140,
        endTime: 180,
        phrase: 'Final Drop - 피날레 폭발',
        density: 1.4,
        patterns: ['곡의 최고조 하이라이트', '양손 교차 히트 및 빈번한 동시치기 (최대 난이도 1.4)']
    },
    {
        startTime: 180,
        endTime: 210,
        phrase: 'Outro - 곡 마무리',
        density: 0.3,
        patterns: ['노트 서서히 감소', '잔향과 함께 종료되므로 띄엄띄엄 배치']
    }
]
