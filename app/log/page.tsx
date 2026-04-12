'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { createMockLogEntries, EmotionType, EMOTION_COLORS, EMOTIONS } from '@/lib/types'
import { DailySocialLog } from '@/components/DailySocialLog'

const WEEK_DAYS = ['א', 'ב', 'ג', 'ד', 'ה']

export default function LogPage() {
    const [viewMode, setViewMode] = useState<'day' | 'week'>('day')
    const entries = useMemo(() => createMockLogEntries(), [])
    const weekData = useMemo(() => {
        const emotions: EmotionType[] = ['approachable', 'calm', 'caution', 'intense']
        return WEEK_DAYS.map((day, i) => ({ day, entries: Math.floor(Math.random() * 4) + 1, dominant: emotions[i % emotions.length], avgIndependence: 0.2 + i * 0.1 }))
    }, [])

    return (
        <div className="flex flex-col min-h-dvh max-w-md mx-auto">
            <header className="glass sticky top-0 z-30 border-b border-border px-5 py-3 flex items-center gap-3">
                <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-2 border border-border active:scale-95 transition-all">←</Link>
                <div className="flex-1">
                    <h1 className="text-base font-extrabold text-text-primary">יומן חברתי</h1>
                    <p className="text-xs text-text-muted">מה קרה היום?</p>
                </div>
            </header>

            <div className="px-5 pt-4">
                <div className="flex bg-surface-2 rounded-2xl p-1">
                    {(['day', 'week'] as const).map(mode => (
                        <button key={mode} className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${viewMode === mode ? 'bg-white text-text-primary shadow-card' : 'text-text-muted'}`}
                            onClick={() => setViewMode(mode)}>
                            {mode === 'day' ? '📅 היום' : '📆 השבוע'}
                        </button>
                    ))}
                </div>
            </div>

            <main className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 page-enter">
                {viewMode === 'day' && <DailySocialLog entries={entries} title="פעולות היום" />}
                {viewMode === 'week' && <>
                    <div className="bg-white rounded-3xl border border-border p-5 shadow-card">
                        <h3 className="font-extrabold text-text-primary mb-4">סקירת שבוע</h3>
                        <div className="flex gap-2 justify-between">
                            {weekData.map((d, i) => {
                                const c = EMOTION_COLORS[d.dominant], def = EMOTIONS[d.dominant]
                                return (
                                    <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                                        <span className="text-xs">{def.icon}</span>
                                        <div className="w-full bg-surface-2 rounded-full overflow-hidden h-20 flex flex-col-reverse">
                                            <div className="w-full rounded-full" style={{ height: `${d.avgIndependence * 100}%`, backgroundColor: c.primary, opacity: 0.7 }} />
                                        </div>
                                        <p className="text-xs font-bold text-text-secondary">{d.day}&apos;</p>
                                        <p className="text-[10px] text-text-muted">{d.entries}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl border border-border p-5 shadow-card flex flex-col gap-3">
                        <h3 className="font-extrabold text-text-primary">הישגים השבוע</h3>
                        {[{ icon: '🔥', title: '5 זיהויים ברצף', desc: "זיהית נכון 5 פעמים ברצף ביום ג'", color: '#FF4B4B' },
                        { icon: '🌟', title: 'ראשון בסרקזם', desc: 'זיהית ציניות בלי עזרה בפעם הראשונה', color: '#FFA500' },
                        { icon: '🏆', title: 'שבוע ירוק', desc: 'רוב הסיטואציות היו חיוביות', color: '#58CC02' },
                        ].map((a, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl" style={{ backgroundColor: a.color + '12' }}>
                                <span className="text-2xl">{a.icon}</span>
                                <div>
                                    <p className="text-sm font-bold text-text-primary">{a.title}</p>
                                    <p className="text-xs text-text-muted">{a.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>}
            </main>

            <nav className="glass border-t border-border px-6 py-3 flex items-center justify-around">
                <Link href="/" className="flex flex-col items-center gap-1 text-text-muted"><span className="text-xl">🏠</span><span className="text-[10px] font-bold">בית</span></Link>
                <Link href="/log" className="flex flex-col items-center gap-1 text-calm"><span className="text-xl">📋</span><span className="text-[10px] font-bold">יומן</span></Link>
                <button className="flex flex-col items-center gap-1 text-text-muted"><span className="text-xl">🎯</span><span className="text-[10px] font-bold">אתגרים</span></button>
                <button className="flex flex-col items-center gap-1 text-text-muted"><span className="text-xl">⚙️</span><span className="text-[10px] font-bold">הגדרות</span></button>
            </nav>
        </div>
    )
}
