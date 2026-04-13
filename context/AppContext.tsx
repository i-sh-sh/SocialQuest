'use client'
/**
 * context/AppContext.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * React Context that wires together the store, hooks, and persistence.
 *
 * On mount: hydrates state from localStorage.
 * On change: persists mutations automatically.
 * Pages/components: call useApp() to get everything they need — no prop drilling.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createContext, useContext, useEffect, useCallback, type ReactNode } from 'react'
import type { EmotionType, FadingState, LogEntry, UserProfile, UserXP } from '@/lib/types'
import { useAppStore, type AppStore } from '@/hooks/useAppStore'
import { useEmotionEngine } from '@/hooks/useEmotionEngine'
import { useLogEntries } from '@/hooks/useLogEntries'
import { useFading } from '@/hooks/useFading'
import {
    getProfiles,
    getActiveProfileId,
    setActiveProfileId,
    upsertProfile,
    hydrateProfile,
    saveUserXP,
} from '@/lib/storage'
import { createEmptyXP, generateId } from '@/lib/engine'
import { processLogEntry } from '@/lib/achievements'
import type { Achievement } from '@/lib/types'

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT SHAPE
// ─────────────────────────────────────────────────────────────────────────────

export interface AppContextValue {
    // Store
    store: AppStore

    // Emotion engine
    emotion: EmotionType
    intensity: number
    isLive: boolean
    isTransitioning: boolean
    setEmotion: (emotion: EmotionType, intensity: number) => void
    toggleLive: () => void

    // Log
    sortedEntries: LogEntry[]
    todayEntries: LogEntry[]
    weekEntries: LogEntry[]
    weekStats: ReturnType<typeof useLogEntries>['weekStats']
    emotionCounts: ReturnType<typeof useLogEntries>['emotionCounts']
    addEntry: (
        emotion: EmotionType,
        intensity: number,
        context: string,
        fadingLevel: number,
        xpEarned?: number,
        notes?: string,
        scene?: import('@/lib/types').SocialScene,
    ) => LogEntry | null
    removeEntry: (entryId: string) => void

    // Fading
    fadingState: FadingState
    fadingStage: ReturnType<typeof useFading>['stage']
    fadingOpacity: number
    fadingPct: number
    setFadingLevel: (level: number) => void
    nudgeFading: (delta: number) => void
    recordCorrectDetection: () => void

    // Profiles
    activeProfile: AppStore['activeProfile']
    switchProfile: (profileId: string) => void
    createProfile: (name: string, role: UserProfile['role'], avatarIcon?: string) => UserProfile

    // XP
    activeXP: UserXP | null

    // Newly unlocked achievements (cleared after display)
    pendingAchievements: Achievement[]
    clearPendingAchievements: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null)

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────────────────────

// We keep pending achievements in local state (not the reducer) because they
// are transient UI notifications — not persisted.
import { useState } from 'react'

export function AppProvider({ children }: { children: ReactNode }) {
    const store = useAppStore()
    const { state, hydrate, setLoaded, setXP, upsertProfile: storeUpsert, setActiveProfile } = store

    const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([])

    // ── Hydration (runs once on client) ──────────────────────────────────────
    useEffect(() => {
        const profiles = getProfiles()
        const savedActiveId = getActiveProfileId()

        // If no profiles exist, create a default child profile
        let activeId = savedActiveId

        if (profiles.length === 0) {
            const defaultProfile: UserProfile = {
                id: generateId(),
                role: 'child',
                name: 'משתמש',
                avatarIcon: '🧒',
                createdAt: new Date(),
            }
            upsertProfile(defaultProfile)
            profiles.push(defaultProfile)
            activeId = defaultProfile.id
            setActiveProfileId(defaultProfile.id)
        }

        if (!activeId || !profiles.find(p => p.id === activeId)) {
            activeId = profiles[0].id
            setActiveProfileId(activeId)
        }

        const { entries, fadingState, xp, sessions } = hydrateProfile(activeId)

        const xpMap: Record<string, UserXP> = {}
        xpMap[activeId] = xp ?? createEmptyXP(activeId)

        hydrate({
            profiles,
            activeProfileId: activeId,
            logEntries: entries,
            fadingState,
            xpMap,
            sessions,
        })
        setLoaded()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Emotion engine ────────────────────────────────────────────────────────
    const engine = useEmotionEngine({
        initialEmotion: state.currentEmotion,
        initialIntensity: state.currentIntensity,
    })

    // ── Fading ────────────────────────────────────────────────────────────────
    const fading = useFading({
        profileId: state.activeProfileId,
        fadingState: state.fadingState,
        entries: store.entriesForActiveProfile,
        currentXP: store.activeXP,
        onFadingChange: (s) => store.setFading(s),
        onXPChange: (pid, xp) => setXP(pid, xp),
    })

    // ── Log entries with XP processing ────────────────────────────────────────
    const handleEntriesChange = useCallback((entries: LogEntry[]) => {
        store.dispatch({ type: 'SET_LOG_ENTRIES', entries })
    }, [store])

    const log = useLogEntries({
        entries: store.entriesForActiveProfile,
        profileId: state.activeProfileId,
        fadingState: state.fadingState,
        currentXP: store.activeXP,
        onEntriesChange: handleEntriesChange,
    })

    // Wrap addEntry to also run XP pipeline
    const addEntry: AppContextValue['addEntry'] = useCallback((
        emotion, intensity, context, fadingLevel, _xpEarly, notes, scene
    ) => {
        if (!state.activeProfileId) return null

        // Process XP & achievements BEFORE creating the entry
        const { updatedXP, newAchievements, xpEarned } = processLogEntry(
            state.activeProfileId,
            store.entriesForActiveProfile,
            state.fadingState,
            store.activeXP,
        )

        saveUserXP(state.activeProfileId, updatedXP)
        setXP(state.activeProfileId, updatedXP)

        if (newAchievements.length > 0) {
            setPendingAchievements(prev => [...prev, ...newAchievements])
        }

        return log.addEntry(emotion, intensity, context, fadingLevel, xpEarned, notes, scene)
    }, [state.activeProfileId, store.entriesForActiveProfile, state.fadingState, store.activeXP, setXP, log])

    // ── Profile management ────────────────────────────────────────────────────
    const switchProfile = useCallback((profileId: string) => {
        setActiveProfileId(profileId)
        setActiveProfile(profileId)
        const { entries, fadingState, xp, sessions } = hydrateProfile(profileId)
        hydrate({
            logEntries: entries,
            fadingState,
            xpMap: { ...state.xpMap, [profileId]: xp ?? createEmptyXP(profileId) },
            sessions,
        })
    }, [state.xpMap, setActiveProfile, hydrate])

    const createProfile = useCallback((
        name: string,
        role: UserProfile['role'],
        avatarIcon?: string,
    ): UserProfile => {
        const profile: UserProfile = {
            id: generateId(),
            role,
            name,
            avatarIcon,
            createdAt: new Date(),
        }
        upsertProfile(profile)
        storeUpsert(profile)
        return profile
    }, [storeUpsert])

    const clearPendingAchievements = useCallback(() => setPendingAchievements([]), [])

    // ── Context value ─────────────────────────────────────────────────────────
    const value: AppContextValue = {
        store,
        // Emotion engine
        emotion: engine.emotion,
        intensity: engine.intensity,
        isLive: engine.isLive,
        isTransitioning: engine.isTransitioning,
        setEmotion: engine.setEmotion,
        toggleLive: engine.toggleLive,
        // Log
        sortedEntries: log.sortedEntries,
        todayEntries: log.todayEntries,
        weekEntries: log.weekEntries,
        weekStats: log.weekStats,
        emotionCounts: log.emotionCounts,
        addEntry,
        removeEntry: log.removeEntry,
        // Fading
        fadingState: state.fadingState,
        fadingStage: fading.stage,
        fadingOpacity: fading.opacity,
        fadingPct: fading.pct,
        setFadingLevel: fading.setLevel,
        nudgeFading: fading.nudgeLevel,
        recordCorrectDetection: fading.recordCorrectDetection,
        // Profiles
        activeProfile: store.activeProfile,
        switchProfile,
        createProfile,
        // XP
        activeXP: store.activeXP,
        // Achievements
        pendingAchievements,
        clearPendingAchievements,
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSUMER HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useApp(): AppContextValue {
    const ctx = useContext(AppContext)
    if (!ctx) throw new Error('useApp must be used within <AppProvider>')
    return ctx
}
