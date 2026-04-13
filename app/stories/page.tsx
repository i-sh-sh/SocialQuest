'use client'
/**
 * app/stories/page.tsx
 * Social Stories Library — Carol Gray methodology.
 * Catalog view + immersive step-by-step reader with emotion colors.
 */

import { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { SOCIAL_STORIES, EMOTION_COLORS, NAV_ITEMS } from '@/lib/constants'
import { useTTS } from '@/hooks/useTTS'
import type { SocialStory } from '@/lib/constants'

const CATEGORY_LABELS = {
    classroom: '🏫 כיתה',
    recess:    '⚽ הפסקה',
    home:      '🏠 בית',
    public:    '🌍 ציבורי',
    therapy:   '🩺 טיפול',
} as const

const DIFFICULTY_COLORS = { easy: '#58CC02', medium: '#FFA500', hard: '#FF4B4B' } as const
const DIFFICULTY_LABELS  = { easy: 'קל', medium: 'בינוני', hard: 'קשה' } as const

type ViewMode = 'catalog' | 'reading'

export default function StoriesPage() {
    const { store: { state } } = useApp()
    const { speak, speaking, supported } = useTTS()
    const [activeCategory, setActiveCategory] = useState<string>('all')
    const [viewMode, setViewMode] = useState<ViewMode>('catalog')
    const [activeStory, setActiveStory] = useState<SocialStory | null>(null)
    const [currentStep, setCurrentStep] = useState(0)
    const [completed, setCompleted] = useState<Set<string>>(new Set())

    const categories = ['all', 'classroom', 'recess', 'home', 'public']
    const filtered = activeCategory === 'all'
        ? SOCIAL_STORIES
        : SOCIAL_STORIES.filter(s => s.category === activeCategory)

    const openStory = (story: SocialStory) => {
        setActiveStory(story)
        setCurrentStep(0)
        setViewMode('reading')
    }

    const back = () => {
        setViewMode('catalog')
        setActiveStory(null)
    }

    const next = () => {
        if (!activeStory) return
        if (currentStep < activeStory.steps.length) {
            setCurrentStep(s => s + 1)
        }
    }

    const prev = () => {
        if (currentStep > 0) setCurrentStep(s => s - 1)
    }

    const finish = () => {
        if (activeStory) {
            setCompleted(prev => new Set(Array.from(prev).concat(activeStory.id)))
        }
        back()
    }

    if (!state.isLoaded) return (
        <div className="flex items-center justify-center min-h-dvh">
            <div className="text-text-muted text-sm animate-pulse">טוען...</div>
        </div>
    )

    // ── STORY READER ────────────────────────────────────────────────────────
    if (viewMode === 'reading' && activeStory) {
        const isOutcome = currentStep === activeStory.steps.length
        const step = isOutcome ? null : activeStory.steps[currentStep]
        const emotionColor = step?.emotion ? EMOTION_COLORS[step.emotion] : null
        const progress = currentStep / activeStory.steps.length

        return (
            <div className="flex flex-col min-h-dvh max-w-md mx-auto">
                <header className="glass sticky top-0 z-30 border-b border-border px-5 py-3 flex items-center gap-3">
                    <button id="btn-back-catalog" onClick={back}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-2 border border-border active:scale-95 transition-all">←</button>
                    <div className="flex-1">
                        <h1 className="text-sm font-extrabold text-text-primary truncate">{activeStory.title}</h1>
                        <p className="text-xs text-text-muted">
                            שלב {Math.min(currentStep + 1, activeStory.steps.length)} מתוך {activeStory.steps.length}
                        </p>
                    </div>
                    {supported && step && (
                        <button
                            id="btn-tts"
                            className={`w-9 h-9 flex items-center justify-center rounded-full border border-border text-base active:scale-95 transition-all ${speaking ? 'bg-calm text-white' : 'bg-surface-2'}`}
                            onClick={() => speak(step.text)}
                        >
                            🔊
                        </button>
                    )}
                </header>

                {/* Progress bar */}
                <div className="h-1 bg-surface-2">
                    <div className="h-full rounded-full bg-calm transition-all duration-500"
                        style={{ width: `${progress * 100}%` }} />
                </div>

                <main className="flex-1 flex flex-col justify-between px-5 py-6 page-enter">
                    {/* Situation context at top */}
                    {currentStep === 0 && (
                        <div className="mb-4 px-4 py-3 bg-surface rounded-2xl border border-border">
                            <p className="text-xs text-text-muted font-semibold mb-1">המצב:</p>
                            <p className="text-sm text-text-secondary">{activeStory.situation}</p>
                        </div>
                    )}

                    {/* Step card */}
                    {!isOutcome && step && (
                        <div className="flex-1 flex flex-col justify-center gap-6">
                            {/* Emotion color blob */}
                            {emotionColor && (
                                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                                    style={{ backgroundColor: emotionColor.light, boxShadow: `0 0 30px ${emotionColor.halo}` }}>
                                    {step.icon}
                                </div>
                            )}
                            {!emotionColor && (
                                <div className="mx-auto w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center text-3xl">
                                    {step.icon}
                                </div>
                            )}

                            <div className={`rounded-3xl p-6 ${step.isTip ? 'bg-calm-light border border-calm/30' : 'bg-white border border-border shadow-card'}`}>
                                {step.isTip && (
                                    <p className="text-xs font-extrabold text-calm mb-2 uppercase tracking-wide">💡 חשוב לזכור</p>
                                )}
                                {emotionColor && step.emotion && (
                                    <p className="text-xs font-semibold mb-2 px-2 py-1 rounded-full w-fit"
                                        style={{ backgroundColor: emotionColor.light, color: emotionColor.dark }}>
                                        {step.icon} רגש: {step.emotion}
                                    </p>
                                )}
                                <p className="text-lg font-bold text-text-primary leading-relaxed text-center">
                                    {step.text}
                                </p>
                            </div>

                            {/* Step dots */}
                            <div className="flex justify-center gap-2">
                                {activeStory.steps.map((_, i) => (
                                    <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-calm' : i < currentStep ? 'w-2 bg-approachable' : 'w-2 bg-surface-2'}`} />
                                ))}
                                <div className="w-2 h-2 rounded-full bg-surface-2" /> {/* outcome dot */}
                            </div>
                        </div>
                    )}

                    {/* Outcome screen */}
                    {isOutcome && (
                        <div className="flex-1 flex flex-col justify-center gap-5 text-center">
                            <div className="text-6xl">{activeStory.icon}</div>
                            <h2 className="text-2xl font-extrabold text-text-primary">מה שלמדתי</h2>
                            <div className="bg-white rounded-3xl border border-border p-6 shadow-card">
                                <p className="text-base text-text-primary leading-relaxed font-medium">
                                    {activeStory.outcome}
                                </p>
                            </div>
                            {activeStory.practiceTag && (
                                <Link href="/practice" id="link-story-to-practice"
                                    className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-calm bg-calm/10 text-calm font-extrabold text-sm active:scale-95 transition-all">
                                    🎮 עכשיו אני מתרגל את זה →
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex gap-3 mt-6">
                        {currentStep > 0 && !isOutcome && (
                            <button id="btn-prev-step" onClick={prev}
                                className="w-12 h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center text-lg active:scale-95 transition-all">
                                ‹
                            </button>
                        )}
                        {!isOutcome ? (
                            <button id="btn-next-step" onClick={next}
                                className="flex-1 py-3.5 rounded-2xl font-extrabold text-sm bg-calm text-white active:scale-95 transition-all">
                                {currentStep === activeStory.steps.length - 1 ? 'למסקנה →' : 'הבא →'}
                            </button>
                        ) : (
                            <button id="btn-finish-story" onClick={finish}
                                className="flex-1 py-3.5 rounded-2xl font-extrabold text-sm bg-approachable text-white active:scale-95 transition-all">
                                ✓ סיימתי! חזרה לספרייה
                            </button>
                        )}
                    </div>
                </main>
            </div>
        )
    }

    // ── CATALOG ──────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col min-h-dvh max-w-md mx-auto">
            <header className="glass sticky top-0 z-30 border-b border-border px-5 py-3 flex items-center gap-3">
                <Link href="/" id="btn-back" className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-2 border border-border active:scale-95 transition-all">←</Link>
                <div className="flex-1">
                    <h1 className="text-base font-extrabold text-text-primary">ספריית סיפורים חברתיים</h1>
                    <p className="text-xs text-text-muted">{completed.size} / {SOCIAL_STORIES.length} הושלמו</p>
                </div>
                <Link
                    href="/settings"
                    id="btn-settings-header"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-2 border border-border text-base active:scale-95 transition-all"
                    title="הגדרות"
                >
                    ⚙️
                </Link>
            </header>

            {/* Category filter */}
            <div className="px-5 pt-3 pb-1 overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                    <button
                        id="filter-all"
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${activeCategory === 'all' ? 'bg-calm text-white' : 'bg-surface-2 text-text-muted border border-border'}`}
                        onClick={() => setActiveCategory('all')}
                    >
                        הכل
                    </button>
                    {categories.slice(1).map(cat => (
                        <button key={cat} id={`filter-${cat}`}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 whitespace-nowrap ${activeCategory === cat ? 'bg-calm text-white' : 'bg-surface-2 text-text-muted border border-border'}`}
                            onClick={() => setActiveCategory(cat)}>
                            {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
                        </button>
                    ))}
                </div>
            </div>

            <main className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 page-enter">
                {filtered.map(story => {
                    const done = completed.has(story.id)
                    return (
                        <button
                            key={story.id}
                            id={`story-${story.id}`}
                            className="bg-white rounded-2xl border border-border shadow-card p-4 flex items-start gap-3 text-right active:scale-[0.98] transition-all w-full"
                            onClick={() => openStory(story)}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-all ${done ? 'bg-approachable/15' : 'bg-surface-2'}`}>
                                {done ? '✅' : story.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <p className="font-bold text-sm text-text-primary truncate">{story.title}</p>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: DIFFICULTY_COLORS[story.difficulty] + '20', color: DIFFICULTY_COLORS[story.difficulty] }}>
                                        {DIFFICULTY_LABELS[story.difficulty]}
                                    </span>
                                </div>
                                <p className="text-xs text-text-secondary leading-snug">{story.situation}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-[10px] text-text-muted">{CATEGORY_LABELS[story.category]}</span>
                                    <span className="text-[10px] text-text-muted">•</span>
                                    <span className="text-[10px] text-text-muted">{story.steps.length} שלבים</span>
                                    {story.practiceTag && (
                                        <>
                                            <span className="text-[10px] text-text-muted">•</span>
                                            <span className="text-[10px] text-calm font-semibold">🎮 כולל אימון</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <span className="text-text-muted text-lg flex-shrink-0 mt-1">›</span>
                        </button>
                    )
                })}
            </main>

            <nav className="glass border-t border-border px-6 py-3 flex items-center justify-around">
                {NAV_ITEMS.map(item => (
                    item.href ? (
                        <Link key={item.id} id={item.id} href={item.href}
                            className={`flex flex-col items-center gap-1 ${item.href === '/stories' ? 'text-calm' : 'text-text-muted'}`}>
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
