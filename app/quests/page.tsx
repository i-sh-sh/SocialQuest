'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { ACHIEVEMENTS, NAV_ITEMS } from '@/lib/constants'
import { xpProgressToNextLevel, xpToNextLevel } from '@/lib/achievements'
import {
    getWeeklyQuests,
    computeQuestProgress,
    getClaimedQuestIds,
    claimQuest,
} from '@/lib/quests'
import type { QuestProgress } from '@/lib/quests'

export default function QuestsPage() {
    const { sortedEntries, fadingState, activeXP, store: { state } } = useApp()
    const [activeTab, setActiveTab] = useState<'weekly' | 'achievements'>('weekly')
    const [questProgress, setQuestProgress] = useState<QuestProgress[]>([])
    const [claimedIds, setClaimedIds] = useState<string[]>([])

    const profileId = state.activeProfileId

    // Compute quest progress
    useEffect(() => {
        if (!profileId) return
        const quests = getWeeklyQuests()
        const claimed = getClaimedQuestIds(profileId)
        setClaimedIds(claimed)
        setQuestProgress(computeQuestProgress(quests, sortedEntries, fadingState, claimed))
    }, [profileId, sortedEntries, fadingState])

    const handleClaim = useCallback((questId: string) => {
        if (!profileId) return
        claimQuest(profileId, questId)
        const newClaimed = [...claimedIds, questId]
        setClaimedIds(newClaimed)
        setQuestProgress(prev => prev.map(qp =>
            qp.quest.id === questId ? { ...qp, claimed: true } : qp
        ))
    }, [profileId, claimedIds])

    if (!state.isLoaded) return (
        <div className="flex items-center justify-center min-h-dvh">
            <div className="text-text-muted text-sm animate-pulse">טוען...</div>
        </div>
    )

    const xpPct = activeXP ? xpProgressToNextLevel(activeXP.totalXP) : 0
    const xpNeeded = activeXP ? xpToNextLevel(activeXP.totalXP) : 100
    const level = (activeXP?.level ?? 0) + 1
    const unlockedIds = new Set(activeXP?.unlockedAchievementIds ?? [])

    return (
        <div className="flex flex-col min-h-dvh max-w-md mx-auto">
            <header className="glass sticky top-0 z-30 border-b border-border px-5 py-3 flex items-center gap-3">
                <Link href="/" id="btn-back" className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-2 border border-border active:scale-95 transition-all">←</Link>
                <div className="flex-1">
                    <h1 className="text-base font-extrabold text-text-primary">אתגרים והישגים</h1>
                    <p className="text-xs text-text-muted">רמה {level} · {activeXP?.totalXP ?? 0} XP</p>
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

            {/* XP Level bar */}
            <div className="px-5 pt-4 pb-2">
                <div className="bg-white rounded-2xl border border-border p-4 shadow-card flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-calm/10 flex items-center justify-center text-2xl font-extrabold text-calm flex-shrink-0">
                        {level}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between text-xs text-text-muted mb-1">
                            <span className="font-semibold text-text-primary">רמה {level}</span>
                            <span>עוד {xpNeeded} XP</span>
                        </div>
                        <div className="h-3 bg-surface-2 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-calm to-approachable transition-all duration-700"
                                style={{ width: `${xpPct * 100}%` }} />
                        </div>
                    </div>
                    <p className="text-lg font-extrabold text-text-primary flex-shrink-0">⭐ {activeXP?.totalXP ?? 0}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-5 pt-2">
                <div className="flex bg-surface-2 rounded-2xl p-1">
                    {(['weekly', 'achievements'] as const).map(tab => (
                        <button key={tab} id={`tab-${tab}`}
                            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === tab ? 'bg-white text-text-primary shadow-card' : 'text-text-muted'}`}
                            onClick={() => setActiveTab(tab)}>
                            {tab === 'weekly' ? '🗓️ השבוע' : '🏆 הישגים'}
                        </button>
                    ))}
                </div>
            </div>

            <main className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 page-enter">

                {/* WEEKLY QUESTS */}
                {activeTab === 'weekly' && (
                    <div className="flex flex-col gap-3">
                        <p className="text-xs text-text-muted font-semibold">משימות השבוע מתאפסות בכל ראשון</p>
                        {questProgress.map(({ quest, current, pct, completed, claimed }) => (
                            <div key={quest.id}
                                className={`bg-white rounded-2xl border shadow-card p-4 flex flex-col gap-3 transition-all ${completed ? 'border-approachable/40' : 'border-border'}`}>
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${completed ? 'bg-approachable/15' : 'bg-surface'}`}>
                                        {claimed ? '✅' : quest.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-text-primary text-sm">{quest.title}</p>
                                        <p className="text-xs text-text-secondary mt-0.5">{quest.description}</p>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                        <p className="text-xs font-extrabold text-approachable">+{quest.xpReward}</p>
                                        <p className="text-[10px] text-text-muted">XP</p>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div>
                                    <div className="flex justify-between text-xs text-text-muted mb-1">
                                        <span>{current} / {quest.target}</span>
                                        <span>{Math.round(pct * 100)}%</span>
                                    </div>
                                    <div className="h-2.5 bg-surface-2 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${pct * 100}%`, background: completed ? '#58CC02' : 'linear-gradient(90deg,#1CB0F6,#58CC02)' }} />
                                    </div>
                                </div>

                                {/* Claim button */}
                                {completed && !claimed && (
                                    <button id={`claim-${quest.id}`}
                                        className="w-full py-2.5 rounded-xl text-sm font-extrabold bg-approachable text-white active:scale-95 transition-all"
                                        onClick={() => handleClaim(quest.id)}>
                                        🎁 אסוף +{quest.xpReward} XP
                                    </button>
                                )}
                                {claimed && (
                                    <p className="text-center text-xs font-semibold text-approachable-dark">✅ נאסף!</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ACHIEVEMENTS CATALOG */}
                {activeTab === 'achievements' && (
                    <div className="flex flex-col gap-2.5">
                        <p className="text-xs text-text-muted font-semibold">
                            {unlockedIds.size} / {ACHIEVEMENTS.length} הישגים פתוחים
                        </p>
                        {ACHIEVEMENTS.map(ach => {
                            const unlocked = unlockedIds.has(ach.id)
                            return (
                                <div key={ach.id}
                                    className={`bg-white rounded-2xl border shadow-card p-4 flex items-center gap-3 transition-all ${unlocked ? 'border-approachable/30' : 'border-border opacity-60'}`}>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${unlocked ? 'bg-approachable/10' : 'bg-surface-2'}`}>
                                        {unlocked ? ach.icon : '🔒'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-bold text-sm ${unlocked ? 'text-text-primary' : 'text-text-muted'}`}>{ach.title}</p>
                                        <p className="text-xs text-text-secondary mt-0.5 leading-snug">{ach.description}</p>
                                    </div>
                                    {ach.xpReward > 0 && (
                                        <div className="flex-shrink-0 text-right">
                                            <p className={`text-sm font-extrabold ${unlocked ? 'text-approachable' : 'text-text-muted'}`}>
                                                {unlocked ? '+' : ''}{ach.xpReward}
                                            </p>
                                            <p className="text-[10px] text-text-muted">XP</p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            <nav className="glass border-t border-border px-6 py-3 flex items-center justify-around">
                {NAV_ITEMS.map(item => (
                    item.href ? (
                        <Link key={item.id} id={item.id} href={item.href}
                            className={`flex flex-col items-center gap-1 ${item.href === '/quests' ? 'text-calm' : 'text-text-muted'}`}>
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
