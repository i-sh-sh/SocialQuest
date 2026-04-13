'use client'
/**
 * components/LogEntrySheet/index.tsx  — v2
 * Bottom-sheet modal: context text + scene tag + recognition confidence.
 * Now also passes a SocialScene back to addEntry.
 */

import { useState, useCallback } from 'react'
import type { EmotionType, FadingState, SocialScene } from '@/lib/types'
import { EMOTION_COLORS, EMOTIONS } from '@/lib/constants'

const SCENES: { id: SocialScene; icon: string; label: string }[] = [
    { id: 'classroom', icon: '🏫', label: 'כיתה' },
    { id: 'recess',    icon: '⚽', label: 'הפסקה' },
    { id: 'home',      icon: '🏠', label: 'בית' },
    { id: 'public',    icon: '🌍', label: 'ציבורי' },
    { id: 'therapy',   icon: '🩺', label: 'טיפול' },
    { id: 'other',     icon: '📍', label: 'אחר' },
]

interface LogEntrySheetProps {
    isOpen: boolean
    emotion: EmotionType
    intensity: number
    fadingState: FadingState
    onSave: (context: string, wasCorrect: boolean, scene?: SocialScene) => void
    onClose: () => void
}

export function LogEntrySheet({ isOpen, emotion, intensity, fadingState, onSave, onClose }: LogEntrySheetProps) {
    const [context, setContext] = useState('')
    const [wasCorrect, setWasCorrect] = useState<boolean | null>(null)
    const [scene, setScene] = useState<SocialScene | null>(null)
    const colors = EMOTION_COLORS[emotion]
    const def = EMOTIONS[emotion]

    const handleSave = useCallback(() => {
        if (!context.trim()) return
        onSave(context.trim(), wasCorrect ?? false, scene ?? undefined)
        setContext('')
        setWasCorrect(null)
        setScene(null)
        onClose()
    }, [context, wasCorrect, scene, onSave, onClose])

    const handleClose = useCallback(() => {
        setContext('')
        setWasCorrect(null)
        setScene(null)
        onClose()
    }, [onClose])

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 z-40 animate-fade-in"
                onClick={handleClose}
                aria-hidden
            />

            {/* Sheet */}
            <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl pb-safe animate-slide-up">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-border" />
                </div>

                <div className="px-5 pb-6 flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                            style={{ backgroundColor: colors.light }}>
                            {def.icon}
                        </div>
                        <div>
                            <h2 className="font-extrabold text-text-primary">רשום רגע</h2>
                            <p className="text-xs text-text-muted">
                                {def.label} · עוצמה {Math.round(intensity * 100)}%
                            </p>
                        </div>
                        <button
                            id="log-sheet-close"
                            className="mr-auto w-8 h-8 flex items-center justify-center rounded-full bg-surface-2 text-text-muted text-lg active:scale-90 transition-all"
                            onClick={handleClose}
                        >×</button>
                    </div>

                    {/* Scene picker */}
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold text-text-muted">📍 איפה זה קרה?</p>
                        <div className="grid grid-cols-3 gap-2">
                            {SCENES.map(s => (
                                <button
                                    key={s.id}
                                    id={`scene-${s.id}`}
                                    className={`py-2 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 flex flex-col items-center gap-1 ${scene === s.id ? 'border-calm bg-calm/10 text-calm' : 'border-border text-text-muted bg-surface'}`}
                                    onClick={() => setScene(scene === s.id ? null : s.id)}
                                >
                                    <span className="text-base">{s.icon}</span>
                                    <span>{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Context input */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-text-muted">מה קרה?</label>
                        <textarea
                            id="log-context-input"
                            className="w-full rounded-2xl border border-border bg-surface p-3 text-sm text-text-primary resize-none focus:outline-none focus:border-calm transition-colors"
                            rows={3}
                            placeholder="לדוגמה: שיחה עם המורה בהפסקה..."
                            value={context}
                            onChange={e => setContext(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Recognition confidence */}
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold text-text-muted">כמה בטוח/ה היית בזיהוי?</p>
                        <div className="flex gap-2">
                            <button
                                id="log-correct-btn"
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 flex items-center justify-center gap-1.5 ${wasCorrect === true ? 'border-approachable bg-approachable/10 text-approachable-dark' : 'border-border text-text-muted'}`}
                                onClick={() => setWasCorrect(true)}
                            >
                                ✓ זיהיתי נכון
                            </button>
                            <button
                                id="log-unsure-btn"
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 flex items-center justify-center gap-1.5 ${wasCorrect === false ? 'border-caution bg-caution/10 text-caution-dark' : 'border-border text-text-muted'}`}
                                onClick={() => setWasCorrect(false)}
                            >
                                ✗ לא הייתי בטוח/ה
                            </button>
                        </div>
                    </div>

                    {/* Save */}
                    <button
                        id="log-save-btn"
                        className={`w-full py-3.5 rounded-2xl text-sm font-extrabold transition-all active:scale-95 ${context.trim() ? 'bg-calm text-white shadow-md' : 'bg-surface-2 text-text-muted cursor-not-allowed'}`}
                        onClick={handleSave}
                        disabled={!context.trim()}
                    >
                        💾 שמור רשומה {wasCorrect === true ? '· +XP נוסף!' : ''}
                    </button>
                </div>
            </div>
        </>
    )
}
