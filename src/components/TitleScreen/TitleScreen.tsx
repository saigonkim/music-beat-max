import { useCallback, useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../game/useGameStore'
import { LANE_KEYS, NOTE_SPEED_LEVELS } from '../../game/constants'
import { audioEngine } from '../../audio/AudioEngine'
import { generateNoteChart, parseChartScript, type ChartSegment } from '../../game/noteChart'
import { ordinaryDaysWithYouScript } from '../../game/charts/ordinaryDaysWithYou'

// ============================================================
// TitleScreen — 타이틀 및 곡 선택 화면 (Stitch 디자인 기반)
// ============================================================

export interface SongMetadata {
    id: string
    title: string
    artist: string
    duration: string
    bpm: number
    difficulty: number
    url: string
    cover?: string // 앨범 아트 경로
    script?: ChartSegment[] // Procedural Script 규칙 배열 옵션
    offset?: number // 각 곡마다 지닌 고유 인코더 딜레이(무음) 보정용 오프셋 (초 단위)
}

export const AVAILABLE_SONGS: SongMetadata[] = [
    {
        id: 'ordinary-days-with-you',
        title: 'Ordinary Days With You',
        artist: 'Suno AI',
        duration: '2:41',
        bpm: 120, // SUNO AI가 생성한 120 BPM 기준으로 수정
        difficulty: 2,
        url: '/music/Ordinary Days With You.mp3',
        cover: '/images/ordinary-days.jpg', // 추출한 썸네일 이미지 연결
        script: ordinaryDaysWithYouScript, // AI가 기획한 배열 연결!
        offset: -0.10 // SUNO MP3 인코딩 시 발생하는 앞부분 딜레이 100ms 상쇄용 디폴트 오프셋
    },
    {
        id: 'starlight-serenade',
        title: 'Starlight Serenade',
        artist: 'Default Track',
        duration: '0:30',
        bpm: 150, // 150 BPM으로 수정
        difficulty: 3,
        url: '/music/Starlight_Serenade.mp3',
        offset: 0.05 // +50ms 오프셋
    }
]

export function TitleScreen() {
    const { speedLevel, setSpeedLevel, setScene, setNotes, audioOffset, setAudioOffset } = useGameStore()
    const [selectedSongIdx, setSelectedSongIdx] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const selectedSong = AVAILABLE_SONGS[selectedSongIdx]

    // 초기 마운트 시 기본 선택된 곡의 오프셋을 게임 스토어에 동기화
    useEffect(() => {
        setAudioOffset(AVAILABLE_SONGS[selectedSongIdx].offset ?? 0)
    }, [])

    const startGame = useCallback(async () => {
        if (isLoading) return
        setIsLoading(true)

        try {
            await audioEngine.loadFromUrl(selectedSong.url)

            // 2. 노트 차트 생성 (사운드 리드인 3초 보정, 곡 길이에 맞춤)
            // 원인 분석: MP3 파일(특히 SUNO AI 생성 파일)은 끝부분에 1~2초가량의 잔향/무음 트레일이 존재합니다.
            // 전체 duration 끝까지 노트를 생성하면 사용자 체감 상 '곡이 끝났는데도 노트가 계속 내려오는' 현상이 발생합니다.
            // 해결: 실제 생성기에는 전체 길이에서 2초를 뺀 시간을 넘겨주어 곡의 여운에 맞춰 노트 생성을 조기 종료합니다.
            const tailPadding = 2.0
            const durationSec = audioEngine.duration > tailPadding ? audioEngine.duration - tailPadding : 30
            let chart
            if (selectedSong.script) {
                // Procedural 파서 로직 실행
                chart = parseChartScript(selectedSong.script, 3.0, selectedSong.bpm, durationSec)
            } else {
                // 기존 임의 랜덤 로직 실행 (Fallback)
                chart = generateNoteChart(3.0, durationSec)
            }
            setNotes(chart)

            // 전역 스토어에 BPM 저장 (게임 화면에서 표시용)
            useGameStore.getState().setCurrentBpm(selectedSong.bpm)

            // 3. 바로 게임 화면으로 이동
            setScene('game')
        } catch (err) {
            console.error("Failed to load song", err)
            alert("음원을 불러오는 데 실패했습니다.")
        } finally {
            setIsLoading(false)
        }
    }, [selectedSong, isLoading, setNotes, setScene])

    const speedMs = NOTE_SPEED_LEVELS[speedLevel]
    const speedLabels = ['★☆☆☆☆', '★★☆☆☆', '★★★☆☆', '★★★★☆', '★★★★★']

    return (
        <div className="relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-game-bg px-4">
            {/* Animated background waveform */}
            <BackgroundWave />

            {/* Logo */}
            <motion.div
                className="mb-2 text-center"
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <h1
                    className="font-space text-5xl font-black tracking-tight sm:text-6xl md:text-8xl"
                    style={{
                        background: 'linear-gradient(90deg, #00f0ff, #9b30ff, #ff2d9b)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 0 30px #00f0ff)',
                    }}
                >
                    MusicBeatMax
                </h1>
                <p className="mt-2 font-mono text-sm uppercase tracking-widest text-white/60">
                    {selectedSong.bpm} BPM • 4 Key Rhythm Challenge
                </p>
            </motion.div >

            {/* Song Selection List */}
            <motion.div
                className="mt-8 w-full max-w-md flex flex-col gap-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                {AVAILABLE_SONGS.map((song, idx) => (
                    <div
                        key={song.id}
                        onClick={() => {
                            setSelectedSongIdx(idx)
                            setAudioOffset(song.offset ?? 0) // 곡을 선택할 때 전용 디폴트 오프셋 알아서 세팅
                        }}
                        className={`flex gap-4 rounded-2xl border p-4 backdrop-blur-md cursor-pointer transition-all ${idx === selectedSongIdx
                            ? 'border-neon-cyan bg-white/10 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                            }`}
                    >
                        {/* Album art */}
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-neon-cyan via-neon-purple to-lane-k relative">
                            {song.cover && (
                                <img
                                    src={song.cover}
                                    alt={`${song.title} cover`}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            )}
                        </div>
                        <div className="flex flex-col justify-center flex-1">
                            <p className="text-lg font-bold text-white">{song.title}</p>
                            <p className="text-sm text-white/50">{song.artist} • {song.duration}</p>
                            <div className="mt-1 flex items-center justify-between">
                                <span className="rounded-full bg-neon-cyan/20 px-2 py-0.5 text-xs font-bold text-neon-cyan">
                                    {song.bpm} BPM
                                </span>
                                <span className="text-yellow-400 text-xs">
                                    {Array(song.difficulty).fill('★').join('')}
                                    {Array(5 - song.difficulty).fill('☆').join('')}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Speed Slider — FBM Ability */}
            < motion.div
                className="mt-6 w-full max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-white/70 uppercase tracking-wider">Note Speed</span>
                    <span className="font-bold text-neon-cyan">
                        {speedLabels[speedLevel]} ({(speedMs / 1000).toFixed(1)}s)
                    </span>
                </div>
                <input
                    type="range"
                    min={0}
                    max={4}
                    step={1}
                    value={speedLevel}
                    onChange={(e) => setSpeedLevel(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer accent-lane-d"
                    aria-label="Note speed level"
                />
                <div className="mt-1 flex justify-between text-xs text-white/30">
                    <span>Slow</span>
                    <span>Fast</span>
                </div>
            </motion.div >

            {/* Audio Sync Offset Slider */}
            < motion.div
                className="mt-4 w-full max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
            >
                <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-white/70 uppercase tracking-wider">Audio Sync</span>
                    <span className="font-bold text-neon-purple">
                        {audioOffset > 0 ? '+' : ''}{Math.round(audioOffset * 1000)} ms
                    </span>
                </div>
                <input
                    type="range"
                    min={-0.5}
                    max={0.5}
                    step={0.01}
                    value={audioOffset}
                    onChange={(e) => setAudioOffset(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer accent-lane-k"
                    aria-label="Audio sync offset"
                />
                <div className="mt-1 flex justify-between text-xs text-white/30">
                    <span>Earlier</span>
                    <span>Later</span>
                </div>
            </motion.div >

            {/* D F J K key display */}
            < motion.div
                className="mt-6 flex gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                {
                    LANE_KEYS.map((key, i) => {
                        const colors = ['#00f0ff', '#39ff14', '#ffe500', '#ff2d9b']
                        return (
                            <div
                                key={key}
                                className="flex h-12 w-12 items-center justify-center rounded-lg border-2 text-sm font-bold uppercase"
                                style={{
                                    borderColor: colors[i],
                                    color: colors[i],
                                    boxShadow: `0 0 12px 2px ${colors[i]}40`,
                                }}
                            >
                                {key.toUpperCase()}
                            </div>
                        )
                    })
                }
            </motion.div>

            {/* PLAY button */}
            <motion.button
                className={`mt-10 rounded-2xl px-16 py-4 text-2xl font-black uppercase tracking-widest text-black transition-all ${isLoading
                    ? 'bg-gray-500 cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-r from-neon-cyan to-neon-purple shadow-neon-cyan hover:scale-105 active:scale-95'
                    }`}
                style={!isLoading ? { boxShadow: '0 0 20px 4px #00f0ff80' } : {}}
                onClick={startGame}
                disabled={isLoading}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={!isLoading ? { boxShadow: '0 0 40px 12px #00f0ff' } : {}}
                aria-label="Start game"
            >
                {isLoading ? 'LOADING...' : 'PLAY'}
            </motion.button>
        </div>
    )
}

function BackgroundWave() {
    const bars = useMemo(() => Array.from({ length: 32 }, (_, i) => i), [])
    return (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-32 items-end justify-center gap-1 opacity-20">
            {bars.map((i) => (
                <motion.div
                    key={i}
                    className="w-2 rounded-t-sm bg-neon-cyan"
                    animate={{ scaleY: [0.2, 0.8 + Math.random() * 0.8, 0.2] }}
                    transition={{
                        duration: 0.9375 + (i % 4) * 0.1, // 2-beat cycle
                        repeat: Infinity,
                        delay: i * 0.04,
                        ease: 'easeInOut',
                    }}
                    style={{ transformOrigin: 'bottom', height: '100%' }}
                />
            ))}
        </div>
    )
}
