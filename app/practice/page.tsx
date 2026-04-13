'use client'
/**
 * app/practice/page.tsx
 * Interactive Practice Mode — 5-question sessions where the player
 * identifies the emotion in a text scenario. Scores XP, updates streak, fading.
 */

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { EMOTION_COLORS, EMOTIONS, NAV_ITEMS } from '@/lib/constants'
import { createPracticeSession, computeSessionResult } from '@/lib/practice'
import { ResponseScripts } from '@/components/ResponseScripts'
import type { PracticeSession, PracticeAnswer, SessionResult } from '@/lib/practice'
import type { EmotionType } from '@/lib/types'

type Stage = 'intro' | 'question' | 'feedback' | 'result'

const DIFFICULTY_LABELS = { easy: 'קל', medium: 'בינוני', hard: 'קשה' } as const
const DIFFICULTY_COLORS = { easy: '#58CC02', medium: '#FFA500', hard: '#FF4B4B' } as const

export default function PracticePage() {
    const { addEntry, recordCorrectDetection, activeXP, store: { state } } = useApp()

    const [stage, setStage] = useState<Stage>('intro')
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
    const [session, setSession] = useState<PracticeSession | null>(null)
    const [currentQ, setCurrentQ] = useState(0)
    const [chosen, setChosen] = useState<EmotionType | null>(null)
    const [result, setResult] = useState<SessionResult | null>(null)
    const questionStartRef = useRef<number>(Date.now())

    const currentQuestion = session?.questions[currentQ]
    const isCorrect = chosen !== null && chosen === currentQuestion?.correctEmotion

    const startSession = useCallback(() => {
        const s = createPracticeSession(5, difficulty)
        setSession(s)
        setCurrentQ(0)
        setChosen(null)
        questionStartRef.current = Date.now()
        setStage('question')
    }, [difficulty])

    const handleAnswer = useCallback((emotion: EmotionType) => {
        if (chosen !== null || !session) return
        setChosen(emotion)
        setStage('feedback')
    }, [chosen, session])

    const handleNext = useCallback(() => {
        if (!session || chosen === null || !currentQuestion) return

        const timeMs = Date.now() - questionStartRef.current
        const correct = chosen === currentQuestion.correctEmotion

        const answer: PracticeAnswer = {
            questionIndex: currentQ,
            chosen,
            correct,
            timeMs,
        }

        const updatedAnswers = [...session.answers, answer]
        const updatedSession = { ...session, answers: updatedAnswers }
        setSession(updatedSession)

        // XP + correct detection
        if (correct) {
            recordCorrectDetection()
            addEntry(
                currentQuestion.correctEmotion,
                currentQuestion.scenario.intensity,
                `פרקטיס: ${currentQuestion.scenario.text.slice(0, 50)}...`,
                state.fadingState.level,
            )
        }

        if (currentQ + 1 >= session.questions.length) {
            const r = computeSessionResult({ ...updatedSession, completedAt: new Date() })
            setResult(r)
            setStage('result')
        } else {
            setCurrentQ(q => q + 1)
            setChosen(null)
            questionStartRef.current = Date.now()
            setStage('question')
        }
    }, [session, chosen, currentQ, currentQuestion, addEntry, recordCorrectDetection, state.fadingState.level])

    const restart = useCallback(() => {
        setSession(null)
        setCurrentQ(0)
        setChosen(null)
        setResult(null)
        setStage('intro')
    }, [])

    if (!state.isLoaded) return (
        <div className="flex items-center justify-center min-h-dvh">
            <div className="text-text-muted text-sm animate-pulse">טוען...</div>
        </div>
    )

    return (
        <div className="flex flex-col min-h-dvh max-w-md mx-auto">
            <header className="glass sticky top-0 z-30 border-b border-border px-5 py-3 flex items-center gap-3">
                <Link href="/" id="btn-back" className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-2 border border-border active:scale-95 transition-all">←</Link>
                <div className="flex-1">
                    <h1 className="text-base font-extrabold text-text-primary">מצב אימון</h1>
                    {session && stage !== 'intro' && stage !== 'result' && (
                        <p className="text-xs text-text-muted">שאלה {currentQ + 1} מתוך {session.questions.length}</p>
                    )}
                </div>
                {activeXP && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-xs font-bold text-text-secondary">
                        ⭐ {activeXP.totalXP}
                    </div>
                )}
            </header>

            <main className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4 page-enter">

                {/* ── INTRO ── */}
                {stage === 'intro' && (
                    <div className="flex flex-col gap-5">
                        <div className="bg-white rounded-3xl border border-border p-6 shadow-card text-center flex flex-col items-center gap-3">
                            <div className="text-5xl">🎮</div>
                            <h2 className="text-xl font-extrabold text-text-primary">מצב אימון</h2>
                            <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
                                תקרא תרחיש חברתי ותנחש איזה רגש מתואר.
                                כל תשובה נכונה מקדמת אותך לעצמאות!
                            </p>
                        </div>

                        {/* Difficulty picker */}
                        <div className="bg-white rounded-3xl border border-border p-5 shadow-card flex flex-col gap-3">
                            <p className="text-sm font-extrabold text-text-primary">בחר רמת קושי</p>
                            <div className="flex flex-col gap-2">
                                {(['easy', 'medium', 'hard'] as const).map(d => (
                                    <button
                                        key={d}
                                        id={`difficulty-${d}`}
                                        className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-right transition-all active:scale-[0.98] ${difficulty === d ? 'shadow-md' : 'border-border'}`}
                                        style={difficulty === d ? { borderColor: DIFFICULTY_COLORS[d], backgroundColor: DIFFICULTY_COLORS[d] + '12' } : {}}
                                        onClick={() => setDifficulty(d)}
                                    >
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: DIFFICULTY_COLORS[d] }}>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-text-primary text-sm">{DIFFICULTY_LABELS[d]}</p>
                                            <p className="text-xs text-text-muted">
                                                {d === 'easy' ? 'רגשות ברורים, אותות ישירים' :
                                                    d === 'medium' ? 'אותות מעורבים, דורש שימת לב' :
                                                        'ציניות, מוסווה — מאתגר!'}
                                            </p>
                                        </div>
                                        {difficulty === d && <span style={{ color: DIFFICULTY_COLORS[d] }}>✓</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            id="btn-start-practice"
                            className="w-full py-4 rounded-2xl font-extrabold text-base bg-calm text-white shadow-lg active:scale-95 transition-all"
                            onClick={startSession}
                        >
                            🚀 התחל סשן (5 שאלות)
                        </button>

                        <div className="flex items-start gap-3 bg-calm-light rounded-2xl p-4 border border-calm/30">
                            <span className="text-xl">💡</span>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                כל תשובה נכונה = <strong>+15 XP</strong> + streak.
                                סשן מושלם = <strong>+30 XP בונוס!</strong>
                            </p>
                        </div>
                    </div>
                )}

                {/* ── QUESTION ── */}
                {stage === 'question' && currentQuestion && (
                    <div className="flex flex-col gap-4 page-enter">
                        {/* Progress */}
                        <div className="flex gap-1.5">
                            {session!.questions.map((_, i) => (
                                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < currentQ ? 'bg-approachable' : i === currentQ ? 'bg-calm' : 'bg-surface-2'}`} />
                            ))}
                        </div>

                        {/* Scenario card */}
                        <div className="bg-white rounded-3xl border border-border p-5 shadow-card flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-text-muted bg-surface-2 px-2.5 py-1 rounded-full">
                                    📍 {currentQuestion.scenario.scene}
                                </span>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                    style={{ backgroundColor: DIFFICULTY_COLORS[currentQuestion.scenario.difficulty] + '20', color: DIFFICULTY_COLORS[currentQuestion.scenario.difficulty] }}>
                                    {DIFFICULTY_LABELS[currentQuestion.scenario.difficulty]}
                                </span>
                            </div>
                            <p className="text-base text-text-primary leading-relaxed font-medium">
                                {currentQuestion.scenario.text}
                            </p>
                        </div>

                        {/* Question */}
                        <p className="text-center text-sm font-extrabold text-text-primary">
                            מה הרגש הכי מתאים לסיטואציה?
                        </p>

                        {/* Options */}
                        <div className="grid grid-cols-2 gap-3">
                            {currentQuestion.options.map(emotion => {
                                const def = EMOTIONS[emotion]
                                return (
                                    <button
                                        key={emotion}
                                        id={`option-${emotion}`}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-border bg-white shadow-card active:scale-95 transition-all font-bold text-sm min-h-[90px]"
                                        onClick={() => handleAnswer(emotion)}
                                    >
                                        <span className="text-3xl">{def.icon}</span>
                                        <span className="text-xs font-bold text-text-primary leading-tight text-center">{def.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* ── FEEDBACK ── */}
                {stage === 'feedback' && currentQuestion && chosen && (
                    <div className="flex flex-col gap-4 page-enter">
                        {/* Result banner */}
                        <div className={`rounded-3xl p-5 flex flex-col gap-2 ${isCorrect ? 'bg-approachable/10 border border-approachable/30' : 'bg-intense/10 border border-intense/30'}`}>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
                                <p className="font-extrabold text-text-primary text-lg">
                                    {isCorrect ? 'נכון! כל הכבוד!' : 'לא בדיוק...'}
                                </p>
                                {isCorrect && <span className="mr-auto text-sm font-extrabold text-approachable">+15 XP</span>}
                            </div>
                            {!isCorrect && (
                                <p className="text-sm text-text-secondary">
                                    הרגש הנכון: <strong>{EMOTIONS[currentQuestion.correctEmotion].icon} {EMOTIONS[currentQuestion.correctEmotion].label}</strong>
                                </p>
                            )}
                        </div>

                        {/* Scenario echo */}
                        <div className="bg-surface rounded-2xl p-4 border border-border">
                            <p className="text-xs text-text-muted font-semibold mb-2">הסיטואציה:</p>
                            <p className="text-sm text-text-secondary leading-relaxed">{currentQuestion.scenario.text}</p>
                        </div>

                        {/* Explanation */}
                        <div className="bg-white rounded-3xl border border-border p-5 shadow-card flex flex-col gap-2">
                            <p className="text-xs font-extrabold text-calm uppercase tracking-wide">💡 למה?</p>
                            <p className="text-sm text-text-primary leading-relaxed">
                                {currentQuestion.scenario.explanation}
                            </p>
                        </div>

                        {/* Response scripts */}
                        <ResponseScripts emotion={currentQuestion.correctEmotion} defaultOpen={true} />

                        <button
                            id="btn-next-question"
                            className="w-full py-3.5 rounded-2xl font-extrabold text-sm bg-calm text-white shadow-md active:scale-95 transition-all"
                            onClick={handleNext}
                        >
                            {currentQ + 1 < (session?.questions.length ?? 5) ? 'שאלה הבאה →' : 'סיים סשן ✓'}
                        </button>
                    </div>
                )}

                {/* ── RESULT ── */}
                {stage === 'result' && result && (
                    <div className="flex flex-col gap-4 page-enter">
                        {/* Score card */}
                        <div className="bg-white rounded-3xl border border-border p-6 shadow-card text-center flex flex-col items-center gap-3">
                            <div className="text-5xl">{result.perfectSession ? '🏆' : result.accuracy >= 0.6 ? '⭐' : '💪'}</div>
                            <h2 className="text-xl font-extrabold text-text-primary">
                                {result.perfectSession ? 'מושלם!' : result.accuracy >= 0.8 ? 'מצוין!' : result.accuracy >= 0.6 ? 'כל הכבוד!' : 'כמעט!'}
                            </h2>
                            <p className="text-text-secondary text-sm">
                                {result.correct} / {result.total} תשובות נכונות
                            </p>

                            {/* Stats grid */}
                            <div className="grid grid-cols-3 gap-3 w-full mt-2">
                                <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-surface">
                                    <p className="text-xl font-extrabold text-approachable">{result.correct}/{result.total}</p>
                                    <p className="text-[10px] text-text-muted">נכון</p>
                                </div>
                                <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-surface">
                                    <p className="text-xl font-extrabold text-calm">+{result.xpEarned}</p>
                                    <p className="text-[10px] text-text-muted">XP</p>
                                </div>
                                <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-surface">
                                    <p className="text-xl font-extrabold text-intense">🔥{result.streakAchieved}</p>
                                    <p className="text-[10px] text-text-muted">רצף</p>
                                </div>
                            </div>

                            {result.perfectSession && (
                                <div className="w-full bg-approachable/10 border border-approachable/30 rounded-2xl px-4 py-2.5">
                                    <p className="text-sm font-bold text-approachable-dark">🎁 בונוס סשן מושלם: +30 XP!</p>
                                </div>
                            )}
                        </div>

                        {/* Per-question review */}
                        <div className="bg-white rounded-3xl border border-border p-5 shadow-card flex flex-col gap-2">
                            <p className="font-extrabold text-text-primary text-sm mb-1">סיכום שאלות</p>
                            {session?.answers.map((a, i) => {
                                const q = session.questions[i]
                                const def = EMOTIONS[q.correctEmotion]
                                return (
                                    <div key={i} className={`flex items-center gap-2.5 p-2.5 rounded-xl ${a.correct ? 'bg-approachable/10' : 'bg-intense/10'}`}>
                                        <span>{a.correct ? '✅' : '❌'}</span>
                                        <span className="text-base">{def.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-text-primary truncate">{q.scenario.scene}</p>
                                            {!a.correct && (
                                                <p className="text-[10px] text-text-muted">
                                                    בחרת: {EMOTIONS[a.chosen].icon} · נכון: {def.icon}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-text-muted flex-shrink-0">
                                            {(a.timeMs / 1000).toFixed(1)}ש
                                        </span>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex gap-3">
                            <button
                                id="btn-retry"
                                className="flex-1 py-3 rounded-2xl font-extrabold text-sm bg-surface-2 text-text-secondary border border-border active:scale-95 transition-all"
                                onClick={restart}
                            >
                                🔄 שחק שוב
                            </button>
                            <Link href="/quests"
                                className="flex-1 py-3 rounded-2xl font-extrabold text-sm bg-calm text-white text-center active:scale-95 transition-all flex items-center justify-center">
                                🎯 אתגרים →
                            </Link>
                        </div>
                    </div>
                )}
            </main>

            <nav className="glass border-t border-border px-6 py-3 flex items-center justify-around">
                {NAV_ITEMS.map(item => (
                    item.href ? (
                        <Link key={item.id} id={item.id} href={item.href}
                            className="flex flex-col items-center gap-1 text-text-muted">
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </Link>
                    ) : (
                        <button key={item.id} id={item.id}
                            className="flex flex-col items-center gap-1 text-text-muted">
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </button>
                    )
                ))}
            </nav>
        </div>
    )
}
