'use client'
/**
 * components/SupervisorDashboard/index.tsx
 * Dashboard view for therapist/parent role.
 * Shows child statistics, fading progress, and log management.
 */

import type { LogEntry, FadingState, UserXP, UserProfile } from '@/lib/types'
import { EMOTION_COLORS, EMOTIONS } from '@/lib/constants'
import { getFadingStage, dominantEmotion, avgFadingLevel, entriesWithinDays } from '@/lib/engine'
import { xpProgressToNextLevel as xpProgress, xpToNextLevel as xpToNext } from '@/lib/achievements'
import { FadingManager } from '@/components/FadingManager'
import { GoalsPanel } from '@/components/GoalsPanel'
import type { EmotionType } from '@/lib/types'

interface SupervisorDashboardProps {
    childProfile: UserProfile | null
    entries: LogEntry[]
    fadingState: FadingState
    childXP: UserXP | null
    onFadingChange: (level: number) => void
    therapistProfileId?: string    // if provided, shows GoalsPanel
}

export function SupervisorDashboard({
    childProfile,
    entries,
    fadingState,
    childXP,
    onFadingChange,
    therapistProfileId,
}: SupervisorDashboardProps) {
    const weekEntries = entriesWithinDays(entries, 7)
    const todayEntries = entries.filter(e => {
        const today = new Date(); today.setHours(0, 0, 0, 0)
        return e.date >= today
    })
    const dominant = dominantEmotion(weekEntries)
    const avgFading = avgFadingLevel(weekEntries)
    const stage = getFadingStage(fadingState.level)

    // Emotion breakdown this week
    const emotionCounts: Record<EmotionType, number> = { approachable: 0, calm: 0, caution: 0, intense: 0, sarcasm: 0, shy: 0 }
    weekEntries.forEach(e => emotionCounts[e.emotion]++)

    const xpPct = childXP ? xpProgress(childXP.totalXP) : 0
    const xpNeeded = childXP ? xpToNext(childXP.totalXP) : 100

    return (
        <div className="flex flex-col gap-5">

            {/* Child profile card */}
            {childProfile && (
                <div className="bg-white rounded-3xl border border-border p-5 shadow-card flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-calm/10 flex items-center justify-center text-3xl flex-shrink-0">
                        {childProfile.avatarIcon ?? '🧒'}
                    </div>
                    <div className="flex-1">
                        <h2 className="font-extrabold text-text-primary text-lg">{childProfile.name}</h2>
                        <p className="text-xs text-text-muted">🧒 ילד/ה · מעקב מטפל</p>
                        {childXP && (
                            <div className="mt-2">
                                <div className="flex justify-between text-xs text-text-muted mb-1">
                                    <span>רמה {childXP.level + 1}</span>
                                    <span>עוד {xpNeeded} XP לרמה הבאה</span>
                                </div>
                                <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-calm transition-all duration-700"
                                        style={{ width: `${xpPct * 100}%` }} />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-extrabold text-text-primary">⭐ {childXP?.totalXP ?? 0}</p>
                        <p className="text-xs text-text-muted">נקודות XP</p>
                    </div>
                </div>
            )}

            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { icon: '📅', label: 'היום', value: todayEntries.length, unit: 'רשומות' },
                    { icon: '📆', label: 'השבוע', value: weekEntries.length, unit: 'רשומות' },
                    { icon: '🔥', label: 'רצף', value: fadingState.streak, unit: 'ברצף' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-border p-3.5 shadow-card flex flex-col items-center gap-1">
                        <span className="text-xl">{stat.icon}</span>
                        <p className="text-xl font-extrabold text-text-primary">{stat.value}</p>
                        <p className="text-[10px] text-text-muted">{stat.unit}</p>
                        <p className="text-xs text-text-secondary font-semibold">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Emotion breakdown */}
            <div className="bg-white rounded-3xl border border-border p-5 shadow-card">
                <h3 className="font-extrabold text-text-primary mb-4 flex items-center gap-2">
                    <span>🎨</span> פירוט רגשות השבוע
                </h3>
                {weekEntries.length === 0 ? (
                    <p className="text-center text-sm text-text-muted py-4">אין רשומות השבוע עדיין</p>
                ) : (
                    <div className="flex flex-col gap-2.5">
                        {(Object.keys(emotionCounts) as EmotionType[]).map(emotion => {
                            const c = EMOTION_COLORS[emotion]
                            const def = EMOTIONS[emotion]
                            const pct = weekEntries.length > 0
                                ? emotionCounts[emotion] / weekEntries.length
                                : 0
                            return (
                                <div key={emotion} className="flex items-center gap-3">
                                    <span className="text-lg w-7">{def.icon}</span>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-semibold text-text-primary">{def.label}</span>
                                            <span className="text-text-muted">{emotionCounts[emotion]} פעמים</span>
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
            </div>

            {/* Goals panel — therapist mode */}
            {therapistProfileId && childProfile && (
                <div className="bg-white rounded-3xl border border-border p-5 shadow-card">
                    <GoalsPanel
                        therapistProfileId={therapistProfileId}
                        childProfileId={childProfile.id}
                        entries={entries}
                        fadingState={fadingState}
                    />
                </div>
            )}

            {/* Fading management */}
            <FadingManager
                fadingState={fadingState}
                onLevelChange={onFadingChange}
            />

            {/* Recent entries */}
            {entries.length > 0 && (
                <div className="bg-white rounded-3xl border border-border p-5 shadow-card">
                    <h3 className="font-extrabold text-text-primary mb-3 flex items-center gap-2">
                        <span>📋</span> רשומות אחרונות
                    </h3>
                    <div className="flex flex-col gap-2.5">
                        {entries.slice(0, 5).map(entry => {
                            const c = EMOTION_COLORS[entry.emotion]
                            const def = EMOTIONS[entry.emotion]
                            const time = entry.date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
                            const dateStr = entry.date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })
                            return (
                                <div key={entry.id}
                                    className="flex items-center gap-3 p-3 rounded-2xl border"
                                    style={{ backgroundColor: c.light + '60', borderColor: c.primary + '30' }}>
                                    <span className="text-xl">{def.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-text-primary truncate">{entry.context}</p>
                                        <p className="text-xs text-text-muted">{dateStr} · {time}</p>
                                    </div>
                                    <span className="text-xs font-bold flex-shrink-0"
                                        style={{ color: c.dark }}>{Math.round(entry.fadingLevel * 100)}%</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
