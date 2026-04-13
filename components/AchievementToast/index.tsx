'use client'
/**
 * components/AchievementToast/index.tsx
 * Slide-in toast notification for newly unlocked achievements.
 * Reads pendingAchievements from context and auto-dismisses after 3.5s.
 */

import { useEffect, useState, useCallback } from 'react'
import { useApp } from '@/context/AppContext'
import type { Achievement } from '@/lib/types'

export function AchievementToast() {
    const { pendingAchievements, clearPendingAchievements } = useApp()
    const [visible, setVisible] = useState<Achievement | null>(null)
    const [queue, setQueue] = useState<Achievement[]>([])

    // Merge new pending achievements into queue
    useEffect(() => {
        if (pendingAchievements.length === 0) return
        setQueue(prev => [...prev, ...pendingAchievements])
        clearPendingAchievements()
    }, [pendingAchievements, clearPendingAchievements])

    // Pop from queue when nothing is visible
    useEffect(() => {
        if (visible || queue.length === 0) return
        const [next, ...rest] = queue
        setVisible(next)
        setQueue(rest)
    }, [visible, queue])

    // Auto-dismiss
    useEffect(() => {
        if (!visible) return
        const t = setTimeout(() => setVisible(null), 3500)
        return () => clearTimeout(t)
    }, [visible])

    const dismiss = useCallback(() => setVisible(null), [])

    if (!visible) return null

    return (
        <div
            className="fixed top-4 left-0 right-0 z-[100] max-w-md mx-auto px-4 pointer-events-none"
            aria-live="polite"
        >
            <button
                className="w-full pointer-events-auto flex items-center gap-3 bg-white rounded-2xl shadow-2xl border border-border p-4 animate-slide-up"
                onClick={dismiss}
            >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: '#FFA50018' }}>
                    {visible.icon}
                </div>
                <div className="flex-1 text-right">
                    <p className="text-xs text-text-muted font-semibold">🏆 הישג חדש!</p>
                    <p className="font-extrabold text-text-primary text-sm">{visible.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{visible.description}</p>
                </div>
                {visible.xpReward > 0 && (
                    <div className="flex-shrink-0 flex flex-col items-center">
                        <span className="text-lg font-extrabold text-approachable">+{visible.xpReward}</span>
                        <span className="text-[10px] text-text-muted">XP</span>
                    </div>
                )}
            </button>
        </div>
    )
}
