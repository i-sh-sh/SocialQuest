/**
 * lib/engine.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure business logic — NO React, NO side effects, NO imports from components.
 * Every function is deterministic and independently testable.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type {
    EmotionType,
    MoodWeatherType,
    EmotionSignal,
    SocialCue,
    FadingState,
    FadingStage,
    LogEntry,
    UserXP,
    SessionStats,
} from './types'
import {
    EMOTIONS,
    WEATHER_DEFS,
    FADING_STAGES,
    XP_PER_LEVEL,
    XP_REWARDS,
} from './constants'

// ─────────────────────────────────────────────────────────────────────────────
// EMOTION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/** Map an emotion to a weather metaphor */
export function emotionToWeather(emotion: EmotionType): MoodWeatherType {
    const map: Record<EmotionType, MoodWeatherType> = {
        approachable: 'sunny',
        calm:         'partly-cloudy',
        caution:      'cloudy',
        intense:      'stormy',
        sarcasm:      'cloudy',        // sarcasm ≈ overcast — not stormy, but definitely unclear
        shy:          'partly-cloudy', // shy ≈ mild — not dangerous, just a bit hidden
    }
    return map[emotion]
}

/** Build a full EmotionSignal from raw inputs */
export function buildEmotionSignal(emotion: EmotionType, intensity: number): EmotionSignal {
    const def = EMOTIONS[emotion]
    return {
        emotion,
        intensity: clamp(intensity, 0, 1),
        label:     def.label,
        sublabel:  def.sublabel,
        icon:      def.icon,
        timestamp: new Date(),
    }
}

/**
 * Analyse a list of social cues and return the dominant emotion.
 * Falls back to 'calm' when cues are empty or tied.
 */
export function analyzeEmotionFromCues(cues: SocialCue[]): EmotionType {
    if (cues.length === 0) return 'calm'
    const counts: Record<EmotionType, number> = { approachable: 0, caution: 0, intense: 0, calm: 0, sarcasm: 0, shy: 0 }
    cues.forEach(c => counts[c.emotion]++)
    return (Object.keys(counts) as EmotionType[])
        .reduce((a, b) => counts[a] >= counts[b] ? a : b, 'calm' as EmotionType)
}

/**
 * Derive the dominant emotion from a list of log entries.
 * Returns null when entries is empty.
 */
export function dominantEmotion(entries: LogEntry[]): EmotionType | null {
    if (entries.length === 0) return null
    const counts: Record<EmotionType, number> = { approachable: 0, caution: 0, intense: 0, calm: 0, sarcasm: 0, shy: 0 }
    entries.forEach(e => counts[e.emotion]++)
    return (Object.keys(counts) as EmotionType[])
        .reduce((a, b) => counts[a] >= counts[b] ? a : b, 'calm' as EmotionType)
}

// ─────────────────────────────────────────────────────────────────────────────
// FADING ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/** Return the FadingStage that corresponds to a given level (0–1) */
export function getFadingStage(level: number): FadingStage {
    return (
        FADING_STAGES.find(s => level >= s.range[0] && level < s.range[1]) ??
        FADING_STAGES[FADING_STAGES.length - 1]
    )
}

/** Clamp + round fading level to 2 decimals */
export function normalizeFadingLevel(level: number): number {
    return Math.round(clamp(level, 0, 1) * 100) / 100
}

/** Compute visual fade opacity for UI elements (0.6 – 1.0 range) */
export function fadingToOpacity(fadingLevel: number): number {
    return clamp(1 - fadingLevel * 0.4, 0.6, 1)
}

/**
 * Given a correct detection, return the updated FadingState.
 * Streak grows; every 5 correct detections nudges the fading level up by 0.05.
 */
export function applyCorrectDetection(prev: FadingState): FadingState {
    const newStreak = prev.streak + 1
    const levelBump = newStreak % 5 === 0 ? 0.05 : 0
    return {
        level: normalizeFadingLevel(prev.level + levelBump),
        streak: newStreak,
        lastUpdated: new Date(),
    }
}

/** Reset streak (wrong detection or manual reset) */
export function resetStreak(prev: FadingState): FadingState {
    return { ...prev, streak: 0, lastUpdated: new Date() }
}

// ─────────────────────────────────────────────────────────────────────────────
// XP ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export function computeLevel(totalXP: number): number {
    return Math.floor(totalXP / XP_PER_LEVEL)
}

/** Build a fresh UserXP object for a new profile */
export function createEmptyXP(profileId: string): UserXP {
    return {
        profileId,
        totalXP: 0,
        level: 0,
        unlockedAchievementIds: [],
        recentXPGains: [],
    }
}

/**
 * Add XP to a UserXP record.
 * Returns the updated record — immutable.
 */
export function addXP(
    xp: UserXP,
    amount: number,
    reason: string,
): UserXP {
    const newTotal = xp.totalXP + amount
    return {
        ...xp,
        totalXP: newTotal,
        level: computeLevel(newTotal),
        recentXPGains: [
            { amount, reason, timestamp: new Date() },
            ...xp.recentXPGains.slice(0, 9), // keep last 10
        ],
    }
}

/** XP earned for a log entry (base + streak bonus) */
export function xpForLogEntry(streak: number): number {
    const streakBonus = Math.min(streak, 10) * XP_REWARDS.streakBonus
    return XP_REWARDS.logEntry + streakBonus
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSION STATS BUILDER
// ─────────────────────────────────────────────────────────────────────────────

export function buildSessionStats(
    entries: LogEntry[],
    fading: FadingState,
    xp: UserXP,
): SessionStats {
    return {
        totalEntries: entries.length,
        streak: fading.streak,
        fadingLevel: fading.level,
        unlockedAchievementIds: xp.unlockedAchievementIds,
        dominantEmotion: dominantEmotion(entries),
        totalXP: xp.totalXP,
        level: xp.level,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOG UTILS
// ─────────────────────────────────────────────────────────────────────────────

/** Group log entries by calendar day (YYYY-MM-DD) */
export function groupEntriesByDay(entries: LogEntry[]): Map<string, LogEntry[]> {
    const map = new Map<string, LogEntry[]>()
    for (const entry of entries) {
        const key = entry.date.toISOString().slice(0, 10)
        const bucket = map.get(key) ?? []
        bucket.push(entry)
        map.set(key, bucket)
    }
    return map
}

/** Average fading level across entries */
export function avgFadingLevel(entries: LogEntry[]): number {
    if (entries.length === 0) return 0
    return entries.reduce((s, e) => s + e.fadingLevel, 0) / entries.length
}

/** Sort entries newest-first */
export function sortEntriesDesc(entries: LogEntry[]): LogEntry[] {
    return [...entries].sort((a, b) => b.date.getTime() - a.date.getTime())
}

/** Filter entries to those within the last N days */
export function entriesWithinDays(entries: LogEntry[], days: number): LogEntry[] {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    return entries.filter(e => e.date.getTime() >= cutoff)
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERAL UTILS
// ─────────────────────────────────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}

export function generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function formatHebrewDate(date: Date): string {
    return date.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function formatHebrewTime(date: Date): string {
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
}

/** Check if two Date objects are on the same calendar day */
export function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}
