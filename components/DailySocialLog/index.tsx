'use client'
import type { LogEntry, EmotionType } from '@/lib/types'
import { EMOTION_COLORS, EMOTIONS } from '@/lib/constants'
import { emotionToWeather } from '@/lib/engine'
import { MiniHalo } from '@/components/SocialHalo'
import { WeatherBadge } from '@/components/MoodWeather'
import { FadingBar } from '@/components/FadingManager'

export function DaySummary({ entries, date = new Date() }: { entries: LogEntry[]; date?: Date }) {
    const counts = { approachable: 0, caution: 0, intense: 0, calm: 0, sarcasm: 0, shy: 0 } as Record<EmotionType, number>
    entries.forEach(e => counts[e.emotion]++)
    const dominant = (Object.keys(counts) as EmotionType[]).reduce((a, b) => counts[a] > counts[b] ? a : b, 'calm' as EmotionType)
    const avgFading = entries.length ? entries.reduce((s, e) => s + e.fadingLevel, 0) / entries.length : 0
    const dateLabel = date.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
    return (
        <div className="bg-white rounded-3xl border border-border p-5 shadow-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-text-muted font-semibold">{dateLabel}</p>
                    <h3 className="text-lg font-extrabold text-text-primary">סיכום היום</h3>
                </div>
                <WeatherBadge weatherType={emotionToWeather(dominant)} />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
                {(Object.keys(counts) as EmotionType[]).map(emotion => {
                    const c = EMOTION_COLORS[emotion], def = EMOTIONS[emotion]
                    const pct = entries.length ? Math.round((counts[emotion] / entries.length) * 100) : 0
                    return (
                        <div key={emotion} className="flex items-center gap-2.5 p-3 rounded-2xl border"
                            style={{ backgroundColor: c.light, borderColor: c.primary + '40' }}>
                            <span className="text-xl">{def.icon}</span>
                            <div className="min-w-0">
                                <p className="text-xs font-bold" style={{ color: c.dark }}>{def.label}</p>
                                <p className="text-xs text-text-muted">{counts[emotion]} פעמים ({pct}%)</p>
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="flex flex-col gap-1.5">
                <p className="text-xs text-text-muted font-semibold">עצמאות ממוצעת היום</p>
                <FadingBar fadingState={{ level: avgFading, streak: 0, lastUpdated: date }} compact />
            </div>
        </div>
    )
}

export function LogEntryCard({ entry }: { entry: LogEntry }) {
    const c = EMOTION_COLORS[entry.emotion], def = EMOTIONS[entry.emotion]
    const time = entry.date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
    return (
        <div className="relative bg-white rounded-2xl border border-border p-4 shadow-card flex gap-3">
            <div className="absolute top-4 bottom-4 right-0 w-1 rounded-full" style={{ backgroundColor: c.primary, opacity: 0.7 }} />
            <div className="relative flex-shrink-0 w-10 h-10">
                <MiniHalo emotion={entry.emotion} size={40} />
                <span className="absolute inset-0 flex items-center justify-center text-base">{def.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: c.light, color: c.dark }}>{def.label}</span>
                    <span className="text-xs text-text-muted flex-shrink-0">{time}</span>
                </div>
                <p className="text-sm text-text-primary font-semibold mb-1">{entry.context}</p>
                {entry.cues.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                        {entry.cues.map(cue => (
                            <span key={cue.id} className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border text-text-secondary">
                                {cue.description}
                            </span>
                        ))}
                    </div>
                )}
                <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${entry.fadingLevel * 100}%`, background: 'linear-gradient(90deg,#58CC02,#8B5CF6)' }} />
                    </div>
                    <span className="text-xs text-text-muted">{Math.round(entry.fadingLevel * 100)}% עצמאי</span>
                </div>
            </div>
        </div>
    )
}

export function DailySocialLog({ entries, title = 'יומן חברתי' }: { entries: LogEntry[]; title?: string }) {
    const sorted = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime())
    return (
        <div className="flex flex-col gap-4">
            <DaySummary entries={entries} />
            <div className="flex flex-col gap-2.5">
                <p className="text-sm font-extrabold text-text-primary">{title}</p>
                {sorted.length === 0 && <div className="text-center py-10 text-text-muted text-sm"><span className="block text-3xl mb-2">📋</span>אין רשומות להיום עדיין</div>}
                {sorted.map(e => <LogEntryCard key={e.id} entry={e} />)}
            </div>
        </div>
    )
}
