// ============================================================
// AudioEngine — Web Audio API 래퍼 (오디오 분석부)
// ============================================================

export interface AudioEngineState {
    currentTime: number
    duration: number
    isPlaying: boolean
}

export class AudioEngine {
    private context: AudioContext | null = null
    private source: AudioBufferSourceNode | null = null
    private _buffer: AudioBuffer | null = null
    private _analyser: AnalyserNode | null = null
    private _startTime = 0      // AudioContext.currentTime when play() was called
    private _startOffset = 0    // offset into the audio buffer when play() was called
    private _pauseTime = 0      // Time when audio was paused or stopped

    get currentTime(): number {
        if (!this.context || !this._buffer) return 0
        if (!this.isPlaying) return this._pauseTime
        return this._startOffset + (this.context.currentTime - this._startTime)
    }

    hasBuffer(): boolean {
        return this._buffer !== null
    }

    get duration(): number {
        return this._buffer?.duration ?? 0
    }

    get isPlaying(): boolean {
        return this.source !== null
    }

    get analyserNode(): AnalyserNode | null {
        return this._analyser
    }

    /** AudioContext を初期化（ユーザージェスチャー後に呼ぶ） */
    private async ensureContext(): Promise<AudioContext> {
        if (!this.context) {
            this.context = new AudioContext()
            this._analyser = this.context.createAnalyser()
            this._analyser.fftSize = 256

            // GainNode 인스턴스화 (더 큰 볼륨을 위해)
            const gainNode = this.context.createGain()
            gainNode.gain.value = 1.0 // 볼륨 증가

            this._analyser.connect(gainNode)
            gainNode.connect(this.context.destination)
        }
        if (this.context.state === 'suspended') {
            await this.context.resume()
        }
        return this.context
    }

    /** ArrayBuffer로부터 오디오를 디코딩하고 준비한다 */
    async load(arrayBuffer: ArrayBuffer): Promise<void> {
        const ctx = await this.ensureContext()
        this._buffer = await ctx.decodeAudioData(arrayBuffer)
    }

    /** URL을 통해 오디오 파일을 가져와 디코딩한다 (예: /music/Starlight_Serenade.mp3) */
    async loadFromUrl(url: string): Promise<void> {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Failed to load audio from url: ${url}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        await this.load(arrayBuffer)
    }

    /** 데모용 sinusoidal 비프음을 생성한다 (실제 파일 없을 때 사용) */
    async loadDemo(): Promise<void> {
        const ctx = await this.ensureContext()
        const sampleRate = ctx.sampleRate
        const duration = 37.5 // 80 beats at 128 BPM
        const frameCount = Math.floor(sampleRate * duration)
        const buffer = ctx.createBuffer(2, frameCount, sampleRate)

        // 128 BPM EDM 느낌의 사인파 비트 생성
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel)
            for (let i = 0; i < frameCount; i++) {
                const t = i / sampleRate
                const beat = (t * 128) / 60
                const beatPhase = (beat % 1)
                // 킥드럼 느낌: 비트 시작마다 짧은 임펄스
                const kick = beatPhase < 0.1 ? Math.sin(2 * Math.PI * 150 * t) * (1 - beatPhase / 0.1) : 0
                // 신스 멜로디 (더 크고 명확하게)
                const melody = Math.sin(2 * Math.PI * 880 * t) * 0.3
                data[i] = kick * 0.8 + melody
            }
        }
        this._buffer = buffer
    }

    async play(offsetSec = 0, leadInDelaySec = 0): Promise<void> {
        if (!this._buffer) return

        const ctx = await this.ensureContext()
        this.stop()

        this.source = ctx.createBufferSource()
        this.source.buffer = this._buffer
        if (this._analyser) {
            this.source.connect(this._analyser)
        } else {
            this.source.connect(ctx.destination)
        }
        this._startOffset = offsetSec
        this._startTime = ctx.currentTime
        this._pauseTime = offsetSec

        console.log(`[AudioEngine] Playing... Context State: ${ctx.state}, duration: ${this.duration}`)

        this.source.start(ctx.currentTime + leadInDelaySec, Math.max(0, offsetSec))

        const currentSource = this.source
        currentSource.onended = () => {
            if (this.source === currentSource) {
                this._pauseTime = this._startOffset + (this.context!.currentTime - this._startTime)
                this.source = null
                console.log(`[AudioEngine] Source Ended naturally at ${this._pauseTime}s`)
            }
        }
    }

    stop(): void {
        if (this.source && this.context) {
            this._pauseTime = this._startOffset + (this.context.currentTime - this._startTime)
            try { this.source.stop() } catch (_) { /* 이미 정지됨 */ }
            this.source = null
        }
    }

    pause(): void {
        if (!this.isPlaying || !this.context) return
        this._startOffset = this.currentTime
        this.stop()
        this.context.suspend()
    }

    dispose(): void {
        this.stop()
        this.context?.close()
        this.context = null
        this._buffer = null
        this._analyser = null
    }

    /** AnalyserNode에서 FFT 데이터(주파수 배열) 읽기 */
    getFrequencyData(): Uint8Array {
        if (!this._analyser) return new Uint8Array(0)
        const data = new Uint8Array(this._analyser.frequencyBinCount)
        this._analyser.getByteFrequencyData(data)
        return data
    }

    /** 베이스(저음역대) 에너지 추출 (0.0 ~ 1.0) */
    getBassEnergy(): number {
        const data = this.getFrequencyData()
        if (data.length === 0) return 0
        // 저음역대 (대략 인덱스 0~5)의 에너지를 평균내어 0~1로 정규화
        let sum = 0
        const bassBands = 6
        for (let i = 0; i < bassBands; i++) {
            sum += data[i]
        }
        return (sum / bassBands) / 255
    }
}

/** 싱글톤 인스턴스 */
export const audioEngine = new AudioEngine()
