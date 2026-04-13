/**
 * lib/quests.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Weekly Quests — short-term missions that reset every week.
 * Separate from Achievements (permanent) — Quests are repeatable and time-bound.
 * Progress is computed live from log entries; claimed state is persisted.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { LogEntry, FadingState } from './types'
import { entriesWithinDays } from './engine'
import { XP_REWARDS } from './constants'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type QuestMetric =
    | 'total_entries'        // count entries this week
    | 'streak'               // current streak value
    | 'emotion_approachable' // entries with that emotion
    | 'emotion_calm'
    | 'emotion_intense'
    | 'emotion_caution'
    | 'fading_level_pct'     // fading level × 100 (integer)
    | 'unique_emotions'      // number of distinct emotions seen

export interface WeeklyQuest {
    id: string
    title: string
    description: string
    icon: string
    metric: QuestMetric
    target: number
    xpReward: number
}

export interface QuestProgress {
    quest: WeeklyQuest
    current: number     // current value of the metric
    pct: number         // 0–1 completion
    completed: boolean
    claimed: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// QUEST CATALOG
// Replace or extend this array to change the quest pool.
// A subset is picked each week (see getWeeklyQuests).
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_QUESTS: WeeklyQuest[] = [
    {
        id: 'q_entries_3',
        title: 'שלוש אינטראקציות',
        description: 'רשום 3 סיטואציות חברתיות השבוע',
        icon: '📋',
        metric: 'total_entries',
        target: 3,
        xpReward: XP_REWARDS.sessionComplete,
    },
    {
        id: 'q_entries_5',
        title: 'חמש אינטראקציות',
        description: 'רשום 5 סיטואציות חברתיות השבוע',
        icon: '📚',
        metric: 'total_entries',
        target: 5,
        xpReward: 35,
    },
    {
        id: 'q_streak_3',
        title: 'שלוש ברצף',
        description: 'זהה נכון 3 פעמים ברצף',
        icon: '🔥',
        metric: 'streak',
        target: 3,
        xpReward: 30,
    },
    {
        id: 'q_approachable_2',
        title: 'מצא את הירוק',
        description: 'זהה 2 סיטואציות "אפשר לגשת" השבוע',
        icon: '😊',
        metric: 'emotion_approachable',
        target: 2,
        xpReward: 20,
    },
    {
        id: 'q_intense_1',
        title: 'ניהול עוצמה',
        description: 'זהה סיטואציה "עוצמה גבוהה" בלי להיות מופתע',
        icon: '😤',
        metric: 'emotion_intense',
        target: 1,
        xpReward: 25,
    },
    {
        id: 'q_caution_2',
        title: 'קורא בין השורות',
        description: 'זהה 2 סיטואציות "שים לב" השבוע',
        icon: '🤔',
        metric: 'emotion_caution',
        target: 2,
        xpReward: 25,
    },
    {
        id: 'q_all_emotions',
        title: 'כל הצבעים',
        description: 'זהה את כל 4 סוגי הרגשות השבוע',
        icon: '🌈',
        metric: 'unique_emotions',
        target: 4,
        xpReward: 50,
    },
    {
        id: 'q_fading_30',
        title: 'עצמאות 30%',
        description: 'הגע לרמת עצמאות של 30%',
        icon: '🌤️',
        metric: 'fading_level_pct',
        target: 30,
        xpReward: 40,
    },
    {
        id: 'q_calm_2',
        title: 'רוגע בתוך הסערה',
        description: 'זהה 2 סיטואציות "רגוע" השבוע',
        icon: '😌',
        metric: 'emotion_calm',
        target: 2,
        xpReward: 20,
    },
]

// ─────────────────────────────────────────────────────────────────────────────
// WEEK SELECTION
// Pick a deterministic subset based on the ISO week number.
// Same user always sees the same quests in a given week → shareable experience.
// ─────────────────────────────────────────────────────────────────────────────

export function getISOWeek(date = new Date()): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

/**
 * Return the 3 quests active this week.
 * Uses week number as seed for deterministic rotation.
 */
export function getWeeklyQuests(): WeeklyQuest[] {
    const week = getISOWeek()
    const pool = [...ALL_QUESTS]
    // Rotate the pool by week number and pick first 3
    const offset = week % pool.length
    const rotated = [...pool.slice(offset), ...pool.slice(0, offset)]
    return rotated.slice(0, 3)
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS COMPUTATION
// ─────────────────────────────────────────────────────────────────────────────

function computeMetric(
    metric: QuestMetric,
    weekEntries: LogEntry[],
    fading: FadingState,
): number {
    switch (metric) {
        case 'total_entries':
            return weekEntries.length
        case 'streak':
            return fading.streak
        case 'emotion_approachable':
            return weekEntries.filter(e => e.emotion === 'approachable').length
        case 'emotion_calm':
            return weekEntries.filter(e => e.emotion === 'calm').length
        case 'emotion_intense':
            return weekEntries.filter(e => e.emotion === 'intense').length
        case 'emotion_caution':
            return weekEntries.filter(e => e.emotion === 'caution').length
        case 'unique_emotions':
            return new Set(weekEntries.map(e => e.emotion)).size
        case 'fading_level_pct':
            return Math.round(fading.level * 100)
        default:
            return 0
    }
}

export function computeQuestProgress(
    quests: WeeklyQuest[],
    allEntries: LogEntry[],
    fading: FadingState,
    claimedIds: string[],
): QuestProgress[] {
    const weekEntries = entriesWithinDays(allEntries, 7)
    const claimedSet = new Set(claimedIds)

    return quests.map(quest => {
        const current = computeMetric(quest.metric, weekEntries, fading)
        const completed = current >= quest.target
        return {
            quest,
            current: Math.min(current, quest.target),
            pct: Math.min(current / quest.target, 1),
            completed,
            claimed: claimedSet.has(quest.id),
        }
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// CLAIMED QUEST STORAGE (localStorage key per profile)
// ─────────────────────────────────────────────────────────────────────────────

const CLAIMED_KEY = (profileId: string) => `v1:claimed_quests:${profileId}`

export function getClaimedQuestIds(profileId: string): string[] {
    if (typeof window === 'undefined') return []
    try {
        const raw = localStorage.getItem(CLAIMED_KEY(profileId))
        return raw ? JSON.parse(raw) : []
    } catch { return [] }
}

export function claimQuest(profileId: string, questId: string): void {
    if (typeof window === 'undefined') return
    const current = getClaimedQuestIds(profileId)
    if (!current.includes(questId)) {
        localStorage.setItem(CLAIMED_KEY(profileId), JSON.stringify([...current, questId]))
    }
}
