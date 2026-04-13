/**
 * lib/achievements.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Achievement + XP processing layer.
 * Stateless — takes current state, returns what changed.
 * The XP system is intentionally isolated behind this module so it can be
 * replaced (e.g. with a server-side ranking system) without touching hooks.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Achievement, UserXP, SessionStats, LogEntry, FadingState, DayStats, WeekStats } from './types'
import { ACHIEVEMENTS, XP_REWARDS, XP_PER_LEVEL } from './constants'
import {
    addXP,
    createEmptyXP,
    buildSessionStats,
    dominantEmotion,
    avgFadingLevel,
    entriesWithinDays,
} from './engine'

// ─────────────────────────────────────────────────────────────────────────────
// ACHIEVEMENT LOOKUP
// ─────────────────────────────────────────────────────────────────────────────

export function getAchievementById(id: string): Achievement | undefined {
    return ACHIEVEMENTS.find(a => a.id === id)
}

export function getUnlockedAchievements(ids: string[]): Achievement[] {
    return ids.map(id => ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean) as Achievement[]
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK FOR NEW ACHIEVEMENTS
// Returns only the newly unlocked ones (not already in xp.unlockedAchievementIds)
// ─────────────────────────────────────────────────────────────────────────────

export function checkNewAchievements(
    stats: SessionStats,
    currentUnlocked: string[],
): Achievement[] {
    const unlocked = new Set(currentUnlocked)
    return ACHIEVEMENTS.filter(a => !unlocked.has(a.id) && a.condition(stats))
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS LOG ENTRY — main entry point called after user logs an interaction
// Returns the updated UserXP (immutable) and any newly unlocked achievements
// ─────────────────────────────────────────────────────────────────────────────

export interface ProcessEntryResult {
    updatedXP: UserXP
    newAchievements: Achievement[]
    xpEarned: number
}

export function processLogEntry(
    profileId: string,
    entries: LogEntry[],
    fading: FadingState,
    currentXP: UserXP | null,
): ProcessEntryResult {
    let xp = currentXP ?? createEmptyXP(profileId)

    // Base XP for logging
    const streakBonus = Math.min(fading.streak, 10) * XP_REWARDS.streakBonus
    const earned = XP_REWARDS.logEntry + streakBonus
    xp = addXP(xp, earned, 'רשומה חברתית')

    // Build stats to check achievements
    const stats = buildSessionStats(entries, fading, xp)

    // Check for newly unlocked achievements
    const newAchievements = checkNewAchievements(stats, xp.unlockedAchievementIds)

    // Grant XP for each new achievement
    for (const ach of newAchievements) {
        if (ach.xpReward > 0) {
            xp = addXP(xp, ach.xpReward, `הישג: ${ach.title}`)
        }
        xp = {
            ...xp,
            unlockedAchievementIds: [...xp.unlockedAchievementIds, ach.id],
        }
    }

    return { updatedXP: xp, newAchievements, xpEarned: earned }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS FADING MILESTONE — called when fading level reaches a new threshold
// ─────────────────────────────────────────────────────────────────────────────

export function processFadingMilestone(
    profileId: string,
    entries: LogEntry[],
    fading: FadingState,
    currentXP: UserXP | null,
): ProcessEntryResult {
    let xp = currentXP ?? createEmptyXP(profileId)
    const earned = XP_REWARDS.fadingMilestone
    xp = addXP(xp, earned, 'מדרגת עצמאות חדשה')

    const stats = buildSessionStats(entries, fading, xp)
    const newAchievements = checkNewAchievements(stats, xp.unlockedAchievementIds)

    for (const ach of newAchievements) {
        if (ach.xpReward > 0) xp = addXP(xp, ach.xpReward, `הישג: ${ach.title}`)
        xp = { ...xp, unlockedAchievementIds: [...xp.unlockedAchievementIds, ach.id] }
    }

    return { updatedXP: xp, newAchievements, xpEarned: earned }
}

// ─────────────────────────────────────────────────────────────────────────────
// WEEK STATS — used by the log/week view
// ─────────────────────────────────────────────────────────────────────────────

export function buildWeekStats(
    allEntries: LogEntry[],
    fading: FadingState,
    currentXP: UserXP | null,
): WeekStats {
    const weekEntries = entriesWithinDays(allEntries, 7)

    // Build a DayStats for each of the last 7 days
    const days: DayStats[] = []
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        d.setHours(0, 0, 0, 0)

        const nextDay = new Date(d)
        nextDay.setDate(nextDay.getDate() + 1)

        const dayEntries = weekEntries.filter(e =>
            e.date >= d && e.date < nextDay,
        )

        days.push({
            date: d,
            entries: dayEntries,
            dominant: dominantEmotion(dayEntries),
            avgFadingLevel: avgFadingLevel(dayEntries),
            totalXP: dayEntries.reduce((s, e) => s + (e.xpEarned ?? 0), 0),
        })
    }

    const stats = currentXP
        ? buildSessionStats(weekEntries, fading, currentXP)
        : null

    const newAchievements = stats
        ? checkNewAchievements(stats, currentXP?.unlockedAchievementIds ?? [])
        : []

    return {
        days,
        totalEntries: weekEntries.length,
        avgFadingLevel: avgFadingLevel(weekEntries),
        dominantEmotion: dominantEmotion(weekEntries),
        totalXP: currentXP?.totalXP ?? 0,
        newAchievements,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// XP DISPLAY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Progress towards the next level (0–1) */
export function xpProgressToNextLevel(totalXP: number): number {
    return (totalXP % XP_PER_LEVEL) / XP_PER_LEVEL
}

/** XP still needed for next level */
export function xpToNextLevel(totalXP: number): number {
    return XP_PER_LEVEL - (totalXP % XP_PER_LEVEL)
}
