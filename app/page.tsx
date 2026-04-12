'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { EmotionType, FadingState } from '@/lib/types'
import { VisualInterpreter } from '@/components/VisualInterpreter'
import { MoodWeather, emotionToWeather } from '@/components/MoodWeather'
import { FadingManager } from '@/components/FadingManager'
import { SimulatorPanel } from '@/components/SimulatorPanel'

const DEFAULT_FADING: FadingState = { level: 0.2, streak: 3, lastUpdated: new Date() }

export default function HomePage() {
    const [emotion, setEmotion] = useState<EmotionType>('calm')
    const [intensity, setIntensity] = useState(0.5)
    const [fadingState, setFadingState] = useState<FadingState>(DEFAULT_FADING)
    const [activeTab, setActiveTab] = useState<'live' | 'settings'>('live')
    const [isLive, setIsLive] = useState(false)

    useEffect(() => {
        if (!isLive) return
        const seq = [
            { emotion: 'approachable' as EmotionType, intensity: 0.8, delay: 0 },
            { emotion: 'calm' as EmotionType, intensity: 0.4, delay: 3500 },
            { emotion: 'caution' as EmotionType, intensity: 0.65, delay: 7000 },
            { emotion: 'intense' as EmotionType, intensity: 0.9, delay: 11000 },
            { emotion: 'approachable' as EmotionType, intensity: 0.7, delay: 15000 },
        ]
        const timers = seq.map(s => setTimeout(() => { setEmotion(s.emotion); setIntensity(s.intensity) }, s.delay))
        return () => timers.forEach(clearTimeout)
    }, [isLive])

    const handleFading = useCallback((level: number) => setFadingState(p => ({ ...p, level, lastUpdated: new Date() })), [])
    const handleSim = useCallback((em: EmotionType, int: number) => { setEmotion(em); setIntensity(int); setIsLive(false) }, [])

    return (
        <div className="flex flex-col min-h-dvh max-w-md mx-auto">
            <header className="glass sticky top-0 z-30 border-b border-border px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🔍</span>
                    <div>
                        <h1 className="text-base font-extrabold text-text-primary leading-tight">SocialLens</h1>
                        <p className="text-xs text-text-muted">GPS חברתי</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${isLive ? 'bg-intense text-white' : 'bg-surface-2 text-text-secondary border border-border'}`}
                        onClick={() => setIsLive(l => !l)}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-text-muted'}`} />
                        {isLive ? 'חי' : 'דמו'}
                    </button>
                    <Link href="/log" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-surface-2 text-text-secondary border border-border active:scale-95 transition-all">
                        📋 יומן
                    </Link>
                </div>
            </header>

            <div className="flex bg-white border-b border-border px-5 gap-1 pt-2">
                {(['live', 'settings'] as const).map(tab => (
                    <button key={tab} className={`flex-1 py-2.5 text-sm font-bold rounded-t-lg transition-all ${activeTab === tab ? 'text-calm border-b-2 border-calm' : 'text-text-muted'}`}
                        onClick={() => setActiveTab(tab)}>
                        {tab === 'live' ? '👁️ מצב חי' : '⚙️ הגדרות'}
                    </button>
                ))}
            </div>

            <main className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5 page-enter">
                {activeTab === 'live' && <>
                    <MoodWeather weatherType={emotionToWeather(emotion)} participantCount={3} roomName="הכיתה" fadeOpacity={1 - fadingState.level * 0.5} />
                    <div className="bg-white rounded-3xl border border-border p-6 shadow-card flex flex-col items-center gap-2">
                        <VisualInterpreter currentEmotion={emotion} intensity={intensity} fadingState={fadingState} personName="דניאל" showCueCards />
                    </div>
                    <div className="bg-white rounded-3xl border border-border p-5 shadow-card">
                        <SimulatorPanel activeEmotion={emotion} activeIntensity={intensity} onSelect={handleSim} />
                    </div>
                </>}
                {activeTab === 'settings' && <>
                    <FadingManager fadingState={fadingState} onLevelChange={handleFading} />
                    <div className="bg-white rounded-3xl border border-border p-5 shadow-card flex flex-col gap-3">
                        <div className="flex items-center gap-2"><span className="text-xl">ℹ️</span><h3 className="font-extrabold text-text-primary">על SocialLens</h3></div>
                        <p className="text-sm text-text-secondary leading-relaxed">SocialLens היא מערכת ניווט חברתית שצובעת את העולם בצבעים שעוזרים לך להבין מה האנשים סביבך מרגישים.</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[{ color: '#58CC02', label: 'אפשר לגשת', icon: '😊' }, { color: '#FFA500', label: 'שים לב', icon: '🤔' },
                            { color: '#FF4B4B', label: 'עוצמה גבוהה', icon: '😤' }, { color: '#1CB0F6', label: 'רגוע', icon: '😌' }
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ backgroundColor: item.color + '18' }}>
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs font-semibold text-text-primary">{item.label}</span>
                                    <span className="text-base mr-auto">{item.icon}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-start gap-3 bg-calm-light rounded-2xl p-4 border border-calm/30">
                        <span className="text-xl">🔒</span>
                        <div>
                            <p className="text-sm font-bold text-calm-dark">Privacy by Design</p>
                            <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">מידע גולמי נמחק מיד לאחר הניתוח. נשמרת רק &ldquo;התובנה הצבעונית&rdquo; ללא מידע מזהה.</p>
                        </div>
                    </div>
                </>}
            </main>

            <nav className="glass border-t border-border px-6 py-3 flex items-center justify-around">
                <Link href="/" className="flex flex-col items-center gap-1 text-calm"><span className="text-xl">🏠</span><span className="text-[10px] font-bold">בית</span></Link>
                <Link href="/log" className="flex flex-col items-center gap-1 text-text-muted"><span className="text-xl">📋</span><span className="text-[10px] font-bold">יומן</span></Link>
                <button className="flex flex-col items-center gap-1 text-text-muted"><span className="text-xl">🎯</span><span className="text-[10px] font-bold">אתגרים</span></button>
                <button className="flex flex-col items-center gap-1 text-text-muted"><span className="text-xl">⚙️</span><span className="text-[10px] font-bold">הגדרות</span></button>
            </nav>
        </div>
    )
}
