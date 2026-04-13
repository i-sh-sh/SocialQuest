'use client'
/**
 * hooks/useFading.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages fading / scaffolding state with automatic localStorage persistence.
 * Also triggers XP/achievement checks when fading milestones are crossed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useCallback, useMemo, useRef } from 'react'
import type { FadingState, UserXP, LogEntry } from '@/lib/types'
import {
    getFadingStage,
    normalizeFadingLevel,
    fadingToOpacity,
    applyCorrectDetection,
    resetStreak,
} from '@/lib/engine'
import { processFadingMilestone } from '@/lib/achievements'
import { saveFadingState, saveUserXP } from '@/lib/storage'

interface UseFadingOptions {
    profileId: string | null
    fadingState: FadingState
    entries: LogEntry[]
    currentXP: UserXP | null
    onFadingChange: (state: FadingState) => void
    onXPChange: (profileId: string, xp: UserXP) => void
}

export function useFading({
    profileId,
    fadingState,
    entries,
    currentXP,
    onFadingChange,
    onXPChange,
}: UseFadingOptions) {
    // Track previous stage to detect milestones
    const prevStageRef = useRef(getFadingStage(fadingState.level).id)

    // ── Computed ──────────────────────────────────────────────────────────────
    const stage   = useMemo(() => getFadingStage(fadingState.level), [fadingState.level])
    const opacity = useMemo(() => fadingToOpacity(fadingState.level), [fadingState.level])
    const pct     = Math.round(fadingState.level * 100)

    // ── Private persist helper ───────────────────────────────────────────────
    const persist = useCallback((next: FadingState) => {
        onFadingChange(next)
        if (profileId) saveFadingState(profileId, next)
    }, [profileId, onFadingChange])

    // ── Check milestone and award XP if stage changed ────────────────────────
    const checkMilestone = useCallback((next: FadingState) => {
        if (!profileId) return
        const nextStage = getFadingStage(next.level).id
        if (nextStage !== prevStageRef.current) {
            prevStageRef.current = nextStage
            const { updatedXP } = processFadingMilestone(profileId, entries, next, currentXP)
            saveUserXP(profileId, updatedXP)
            onXPChange(profileId, updatedXP)
        }
    }, [profileId, entries, currentXP, onXPChange])

    // ── Public API ────────────────────────────────────────────────────────────

    /** Manual level override (therapist/parent) */
    const setLevel = useCallback((level: number) => {
        const next: FadingState = {
            level: normalizeFadingLevel(level),
            streak: fadingState.streak,
            lastUpdated: new Date(),
        }
        persist(next)
        checkMilestone(next)
    }, [fadingState.streak, persist, checkMilestone])

    /** Called after a correct emotion detection */
    const recordCorrectDetection = useCallback(() => {
        const next = applyCorrectDetection(fadingState)
        persist(next)
        checkMilestone(next)
    }, [fadingState, persist, checkMilestone])

    /** Called after an incorrect detection or manual reset */
    const recordWrongDetection = useCallback(() => {
        const next = resetStreak(fadingState)
        persist(next)
    }, [fadingState, persist])

    /** Nudge ±0.1 (used by FadingManager buttons) */
    const nudgeLevel = useCallback((delta: number) => {
        setLevel(fadingState.level + delta)
    }, [fadingState.level, setLevel])

    return {
        fadingState,
        stage,
        opacity,
        pct,
        setLevel,
        nudgeLevel,
        recordCorrectDetection,
        recordWrongDetection,
    }
}
