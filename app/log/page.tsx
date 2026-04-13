'use client'
/**
 * app/log/page.tsx  — v2
 * Full-featured social journal:
 *   Day view  — timeline with expandable entries + delete
 *   Week view — bar chart + weekly summary + session report button
 *   All view  — searchable, filterable full history
 */

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { EMOTION_COLORS, EMOTIONS, NAV_ITEMS } from '@/lib/constants'
import { generateSessionReport } from '@/lib/report'
import type { LogEntry, EmotionType } from '@/lib/types'

const WEEK_DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
const ALL_EMOTIONS = Object.keys(EMOTIONS) as EmotionType[]

// ─── Entry Card ────────────────────────────────────────────────────────────

function EntryCard({ entry, onDelete }: { entry: LogEntry; onDelete: () => void }) {
    const [expanded, setExpanded] = useState(false)
    const c = EMOTION_COLORS[entry.emotion]
    const def = EMOTIONS[entry.emotion]
    const time = entry.date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })

    return (
        <div
            className="bg-white rounded-2xl border shadow-card overflow-hidden transition-all"
            style={{ borderColor: c.primary + '30' }}
        >
            <button
                className="w-full flex items-center gap-3 p-4 text-right active:bg-surface transition-all"
                onClick={() => setExpanded(v => !v)}
            >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: c.light }}>
                    {def.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-text-primary truncate">{entry.context}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-semibold" style={{ color: c.dark }}>{def.label}</span>
                        <span className="text-[10px] text-text-muted">·</span>
                        <span className="text-[10px] text-text-muted">{time}</span>
                        <span className="text-[10px] text-text-muted">·</span>
                        <span className="text-[10px] text-text-muted">{Math.round(entry.fadingLevel * 100)}% עצמאות</span>
                    </div>
                </div>
                <span className="text-text-muted text-base transition-transform duration-200 flex-shrink-0"
                    style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>▾</span>
            </button>

            {expanded && (
                <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border">
                    {/* Intensity bar */}
                    <div className="pt-3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-text-muted">עוצמת רגש</span>
                            <span className="font-semibold" style={{ color: c.dark }}>{Math.round(entry.intensity * 100)}%</span>
                        </div>
                        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${entry.intensity * 100}%`, backgroundColor: c.primary }} />
                        </div>
                    </div>

                    {/* XP earned */}
                    {(entry.xpEarned ?? 0) > 0 && (
                        <p className="text-xs text-approachable font-semibold">⭐ +{entry.xpEarned} XP הרווחת</p>
                    )}

                    {/* Notes */}
                    {entry.notes && (
                        <div className="bg-surface rounded-xl p-3">
                            <p className="text-xs text-text-muted font-semibold mb-1">הערות</p>
                            <p className="text-sm text-text-secondary">{entry.notes}</p>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            id={`delete-entry-${entry.id}`}
                            className="text-xs text-intense font-semibold px-3 py-1.5 rounded-lg border border-intense/20 bg-intense/5 active:scale-95 transition-all"
                            onClick={(e) => { e.stopPropagation(); onDelete() }}
                        >
                            🗑 מחק רשומה
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function LogPage() {
    const {
        sortedEntries, todayEntries, weekEntries, weekStats,
        removeEntry,
        store: { state },
    } = useApp()

    const [viewMode, setViewMode] = useState<'day' | 'week' | 'all'>('day')
    const [filterEmotion, setFilterEmotion] = useState<EmotionType | 'all'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [showReport, setShowReport] = useState(false)

    const filteredAll = useMemo(() => {
        return sortedEntries.filter(e => {
            const emotionMatch = filterEmotion === 'all' || e.emotion === filterEmotion
            const textMatch = !searchQuery || e.context.toLowerCase().includes(searchQuery.toLowerCase())
            return emotionMatch && textMatch
        })
    }, [sortedEntries, filterEmotion, searchQuery])

    const report = useMemo(() =>
        generateSessionReport(weekEntries, state.fadingState, state.activeProfileId ?? ''),
        [weekEntries, state.fadingState, state.activeProfileId]
    )

    const handleDelete = useCallback((entryId: string) => {
        removeEntry(entryId)
    }, [removeEntry])

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
                    <h1 className="text-base font-extrabold text-text-primary">יומן חברתי</h1>
                    <p className="text-xs text-text-muted">
                        {todayEntries.length > 0 ? `${todayEntries.length} רשומות היום` : 'אין רשומות להיום'}
                        {' · '}סה"כ {sortedEntries.length}
                    </p>
                </div>
                <Link
                    href="/settings"
                    id="btn-settings-header"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-2 border border-border text-base active:scale-95 transition-all"
                    title="הגדרות"
                >
                    ⚙️
                </Link>
                {viewMode === 'week' && (
                    <button
                        id="btn-show-report"
                        className="text-xs font-bold text-calm bg-calm/10 px-3 py-1.5 rounded-full active:scale-95 transition-all"
                        onClick={() => setShowReport(true)}
                    >
                        📄 דוח
                    </button>
                )}
            </header>

            {/* Tab bar */}
            <div className="px-5 pt-3 pb-0">
                <div className="flex bg-surface-2 rounded-2xl p-1">
                    {(['day', 'week', 'all'] as const).map(mode => (
                        <button key={mode} id={`tab-${mode}`}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${viewMode === mode ? 'bg-white text-text-primary shadow-card' : 'text-text-muted'}`}
                            onClick={() => setViewMode(mode)}>
                            {mode === 'day' ? '📅 היום' : mode === 'week' ? '📆 שבוע' : '📚 הכל'}
                        </button>
                    ))}
                </div>
            </div>

            <main className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 page-enter">

                {/* ── DAY VIEW ── */}
                {viewMode === 'day' && (
                    <div className="flex flex-col gap-3">
                        {todayEntries.length === 0 ? (
                            <div className="text-center py-10 flex flex-col items-center gap-3">
                                <span className="text-5xl">📋</span>
                                <p className="text-text-muted font-semibold">אין רשומות להיום עדיין</p>
                                <Link href="/" className="text-xs text-calm font-bold px-4 py-2 rounded-full bg-calm/10">
                                    🔍 חזור ותרשום רגע
                                </Link>
                            </div>
                        ) : (
                            todayEntries.map(e => (
                                <EntryCard key={e.id} entry={e} onDelete={() => handleDelete(e.id)} />
                            ))
                        )}
                    </div>
                )}

                {/* ── WEEK VIEW ── */}
                {viewMode === 'week' && (
                    <div className="flex flex-col gap-4">
                        {/* Scrollable emotion breakdown */}
                        <div className="bg-white rounded-3xl border border-border p-5 shadow-card">
                            <h3 className="font-extrabold text-text-primary mb-4">מזג האוויר החברתי השבוע</h3>
                            <div className="flex gap-1.5 justify-between items-end h-28">
                                {weekStats.days.map((day, i) => {
                                    const emotion: EmotionType = day.dominant ?? 'calm'
                                    const c = EMOTION_COLORS[emotion]
                                    const def = EMOTIONS[emotion]
                                    const dayName = WEEK_DAYS[day.date.getDay()]
                                    const height = day.entries.length > 0
                                        ? Math.max(20, Math.min(100, day.entries.length * 20))
                                        : 8
                                    const isToday = day.date.toDateString() === new Date().toDateString()
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-1 flex-1">
                                            <span className="text-sm">{day.entries.length > 0 ? def.icon : '·'}</span>
                                            <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                                                <div className="w-full rounded-xl transition-all duration-700"
                                                    style={{
                                                        height: `${height}%`,
                                                        backgroundColor: day.entries.length > 0 ? c.primary : '#E5E7EB',
                                                        opacity: day.entries.length > 0 ? 0.85 : 0.4,
                                                    }} />
                                            </div>
                                            <p className={`text-[10px] font-bold ${isToday ? 'text-calm' : 'text-text-secondary'}`}>{dayName}</p>
                                            <p className="text-[10px] text-text-muted">{day.entries.length}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Summary grid */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { icon: '📋', label: 'רשומות', value: weekStats.totalEntries },
                                { icon: '⭐', label: 'XP', value: weekStats.totalXP },
                                { icon: '🔥', label: 'רצף', value: state.fadingState.streak },
                            ].map(s => (
                                <div key={s.label} className="bg-white rounded-2xl border border-border p-3 shadow-card flex flex-col items-center gap-1">
                                    <span className="text-xl">{s.icon}</span>
                                    <p className="text-xl font-extrabold text-text-primary">{s.value}</p>
                                    <p className="text-[10px] text-text-muted">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Emotion breakdown this week */}
                        {weekEntries.length > 0 && (
                            <div className="bg-white rounded-3xl border border-border p-5 shadow-card">
                                <h3 className="font-extrabold text-text-primary mb-3">פירוט רגשות</h3>
                                {ALL_EMOTIONS.map(emotion => {
                                    const count = weekEntries.filter(e => e.emotion === emotion).length
                                    if (count === 0) return null
                                    const c = EMOTION_COLORS[emotion]
                                    const def = EMOTIONS[emotion]
                                    const pct = count / weekEntries.length
                                    return (
                                        <div key={emotion} className="flex items-center gap-3 mb-2.5">
                                            <span className="w-6 text-base">{def.icon}</span>
                                            <div className="flex-1">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="font-semibold text-text-primary">{def.label}</span>
                                                    <span className="text-text-muted">{count}× ({Math.round(pct * 100)}%)</span>
                                                </div>
                                                <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full transition-all duration-700"
                                                        style={{ width: `${pct * 100}%`, backgroundColor: c.primary }} />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Achievements */}
                        {weekStats.newAchievements.length > 0 && (
                            <div className="bg-white rounded-3xl border border-border p-5 shadow-card flex flex-col gap-2">
                                <h3 className="font-extrabold text-text-primary">🏆 הישגים השבוע</h3>
                                {weekStats.newAchievements.map(a => (
                                    <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                                        style={{ backgroundColor: '#FFA50012' }}>
                                        <span className="text-xl">{a.icon}</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-text-primary">{a.title}</p>
                                            <p className="text-xs text-text-muted">{a.description}</p>
                                        </div>
                                        <span className="text-xs font-bold text-approachable flex-shrink-0">+{a.xpReward} XP</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── ALL VIEW (searchable) ── */}
                {viewMode === 'all' && (
                    <div className="flex flex-col gap-3">
                        {/* Search */}
                        <input
                            id="search-entries"
                            type="text"
                            placeholder="🔍 חפש בהקשר..."
                            className="w-full rounded-2xl border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-calm"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />

                        {/* Emotion filter */}
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            <button
                                id="filter-all-emotions"
                                className={`px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all active:scale-95 ${filterEmotion === 'all' ? 'bg-calm text-white' : 'bg-surface-2 text-text-muted border border-border'}`}
                                onClick={() => setFilterEmotion('all')}>
                                הכל
                            </button>
                            {ALL_EMOTIONS.map(e => {
                                const def = EMOTIONS[e]
                                const c = EMOTION_COLORS[e]
                                return (
                                    <button key={e} id={`filter-${e}`}
                                        className="px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all active:scale-95 border"
                                        style={filterEmotion === e
                                            ? { backgroundColor: c.primary, color: '#fff', borderColor: c.primary }
                                            : { backgroundColor: 'white', color: c.dark, borderColor: c.primary + '40' }}
                                        onClick={() => setFilterEmotion(filterEmotion === e ? 'all' : e)}>
                                        {def.icon} {def.label}
                                    </button>
                                )
                            })}
                        </div>

                        <p className="text-xs text-text-muted">{filteredAll.length} תוצאות</p>

                        {filteredAll.length === 0 ? (
                            <p className="text-center text-text-muted py-8 text-sm">לא נמצאו רשומות</p>
                        ) : (
                            filteredAll.map(e => (
                                <EntryCard key={e.id} entry={e} onDelete={() => handleDelete(e.id)} />
                            ))
                        )}
                    </div>
                )}
            </main>

            {/* ── SESSION REPORT MODAL ── */}
            {showReport && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm" onClick={() => setShowReport(false)}>
                    <div className="bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-extrabold text-text-primary text-lg">📄 דוח סשן שבועי</h2>
                            <button id="btn-close-report" onClick={() => setShowReport(false)}
                                className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-sm active:scale-90">✕</button>
                        </div>
                        <div className="flex flex-col gap-3 text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                            <div className="bg-surface rounded-2xl p-4 font-mono text-xs leading-loose text-text-primary">
                                {report}
                            </div>
                            <button
                                id="btn-copy-report"
                                className="w-full py-3 rounded-2xl font-bold text-sm bg-calm text-white active:scale-95 transition-all"
                                onClick={() => { navigator.clipboard.writeText(report); alert('הדוח הועתק ללוח!') }}
                            >
                                📋 העתק לשיתוף עם המטפל
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="glass border-t border-border px-6 py-3 flex items-center justify-around">
                {NAV_ITEMS.map(item => (
                    item.href ? (
                        <Link key={item.id} id={item.id} href={item.href}
                            className={`flex flex-col items-center gap-1 ${item.href === '/log' ? 'text-calm' : 'text-text-muted'}`}>
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </Link>
                    ) : (
                        <button key={item.id} id={item.id} className="flex flex-col items-center gap-1 text-text-muted">
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </button>
                    )
                ))}
            </nav>
        </div>
    )
}
