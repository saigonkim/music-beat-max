import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from './game/useGameStore'
import { TitleScreen } from './components/TitleScreen/TitleScreen'
import { GameScreen } from './components/GameScreen/GameScreen'
import { ResultScreen } from './components/ResultScreen/ResultScreen'

// ============================================================
// App — 씬 라우터
// ============================================================

function App() {
    const scene = useGameStore((s) => s.scene)

    return (
        <AnimatePresence mode="wait">
            {scene === 'title' && (
                <SceneWrapper key="title">
                    <TitleScreen />
                </SceneWrapper>
            )}
            {scene === 'game' && (
                <SceneWrapper key="game">
                    <GameScreen />
                </SceneWrapper>
            )}
            {scene === 'result' && (
                <SceneWrapper key="result">
                    <ResultScreen />
                </SceneWrapper>
            )}
        </AnimatePresence>
    )
}

function SceneWrapper({ children, key: _key }: { children: React.ReactNode; key: string }) {
    return (
        <motion.div
            style={{ position: 'absolute', inset: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
    )
}

export default App
