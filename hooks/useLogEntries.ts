'use client'
/**
 * hooks/useLogEntries.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages log entry CRUD + computed stats.
 * Reads/writes through storage.ts and fires the XP/achievement pipeline.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useCallback, useMemo } from 'react'
import type { LogEntry, EmotionType, FadingState, UserXP, SocialScene } from '@/lib/types'
import {
    sortEntriesDesc,
    dominantEmotion,
    avgFadingLevel,
    groupEntriesByDay,
    generateId,
    entriesWithinDays,
} from '@/lib/engine'
import { buildWeekStats } from '@/lib/achievements'
import { addLogEntry as storageAdd, deleteLogEntry as storageDelete } from '@/lib/storage'

interface UseLogEntriesOptions {
    entries: LogEntry[]
    profileId: string | null
    fadingState: FadingState
    currentXP: UserXP | null
    onEntriesChange: (entries: LogEntry[]) => void
}

export function useLogEntries({
    entries,
    profileId,
    fadingState,
    currentXP,
    onEntriesChange,
}: UseLogEntriesOptions) {

    // ── Sorted view ───────────────────────────────────────────────────────────
    const sortedEntries = useMemo(() => sortEntriesDesc(entries), [entries])

    // ── Stats ─────────────────────────────────────────────────────────────────
    const todayEntries = useMemo(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        return entries.filter(e => e.date >= today && e.date < tomorrow)
    }, [entries])

    const weekEntries  = useMemo(() => entriesWithinDays(entries, 7), [entries])
    const dominant     = useMemo(() => dominantEmotion(entries), [entries])
    const todayDominant = useMemo(() => dominantEmotion(todayEntries), [todayEntries])
    const avgFading    = useMemo(() => avgFadingLevel(entries), [entries])
    const byDay        = useMemo(() => groupEntriesByDay(entries), [entries])

    const weekStats = useMemo(
        () => buildWeekStats(entries, fadingState, currentXP),
        [entries, fadingState, currentXP],
    )

    // ── CRUD ──────────────────────────────────────────────────────────────────

    const addEntry = useCallback((
        emotion: EmotionType,
        intensity: number,
        context: string,
        fadingLevel: number,
        xpEarned: number = 0,
        notes?: string,
        scene?: SocialScene,
    ) => {
        if (!profileId) return null

        const entry: LogEntry = {
            id: generateId(),
            date: new Date(),
            emotion,
            intensity,
            context,
            scene,
            cues: [],
            fadingLevel,
            notes,
            profileId,
            xpEarned,
        }

        storageAdd(profileId, entry)
        onEntriesChange([...entries, entry])
        return entry
    }, [profileId, entries, onEntriesChange])

    const removeEntry = useCallback((entryId: string) => {
        if (!profileId) return
        storageDelete(profileId, entryId)
        onEntriesChange(entries.filter(e => e.id !== entryId))
    }, [profileId, entries, onEntriesChange])

    // ── Emotion distribution (for weekly chart) ───────────────────────────────
    const emotionCounts = useMemo(() => {
        const base: Record<EmotionType, number> = { approachable: 0, caution: 0, intense: 0, calm: 0, sarcasm: 0, shy: 0 }
        entries.forEach(e => base[e.emotion]++)
        return base
    }, [entries])

    return {
        // Views
        sortedEntries,
        todayEntries,
        weekEntries,
        byDay,
        // Stats
        dominant,
        todayDominant,
        avgFading,
        emotionCounts,
        weekStats,
        // Actions
        addEntry,
        removeEntry,
    }
}
