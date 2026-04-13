/**
 * lib/goals.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Therapist Goal System — IEP-aligned measurable targets.
 * Goals are set by a therapist and tracked against real log data.
 * Storage: localStorage per therapist profile.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { LogEntry, FadingState } from './types'
import { entriesWithinDays } from './engine'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type GoalMetric =
    | 'accuracy_practice'      // % correct in practice sessions (approx from streak)
    | 'fading_level'           // reach fading level X%
    | 'streak'                 // sustain streak of N
    | 'total_entries_week'     // log N entries per week
    | 'emotion_identified'     // identify specific emotion N times

export interface TherapyGoal {
    id: string
    title: string
    description: string
    metric: GoalMetric
    target: number              // the value to reach
    emotionTarget?: string      // for emotion_identified metric
    createdAt: Date
    dueDate?: Date              // optional deadline
    childProfileId: string      // whose goal this is
    therapistProfileId: string  // who set it
    completedAt?: Date          // when achieved
}

export interface GoalProgress {
    goal: TherapyGoal
    current: number             // current value
    pct: number                 // 0–1
    completed: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS COMPUTATION
// ─────────────────────────────────────────────────────────────────────────────

export function computeGoalProgress(
    goal: TherapyGoal,
    entries: LogEntry[],
    fading: FadingState,
): GoalProgress {
    const weekEntries = entriesWithinDays(entries, 7)
    let current = 0

    switch (goal.metric) {
        case 'fading_level':
            current = Math.round(fading.level * 100)
            break
        case 'streak':
            current = fading.streak
            break
        case 'total_entries_week':
            current = weekEntries.length
            break
        case 'emotion_identified':
            current = goal.emotionTarget
                ? entries.filter(e => e.emotion === goal.emotionTarget).length
                : entries.length
            break
        case 'accuracy_practice':
            // Approximate: streak / (streak + recentMisses). Use fading as proxy.
            current = Math.round(fading.level * 100)
            break
    }

    const pct = Math.min(current / goal.target, 1)
    const completed = current >= goal.target

    return { goal, current: Math.min(current, goal.target), pct, completed }
}

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE
// ─────────────────────────────────────────────────────────────────────────────

const KEY = (therapistId: string) => `v1:goals:${therapistId}`

function reviveDates(goal: TherapyGoal): TherapyGoal {
    return {
        ...goal,
        createdAt:   new Date(goal.createdAt),
        dueDate:     goal.dueDate   ? new Date(goal.dueDate)   : undefined,
        completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined,
    }
}

export function loadGoals(therapistProfileId: string): TherapyGoal[] {
    if (typeof window === 'undefined') return []
    try {
        const raw = localStorage.getItem(KEY(therapistProfileId))
        const parsed: TherapyGoal[] = raw ? JSON.parse(raw) : []
        return parsed.map(reviveDates)
    } catch { return [] }
}

export function saveGoal(therapistProfileId: string, goal: TherapyGoal): void {
    if (typeof window === 'undefined') return
    const existing = loadGoals(therapistProfileId).filter(g => g.id !== goal.id)
    localStorage.setItem(KEY(therapistProfileId), JSON.stringify([...existing, goal]))
}

export function deleteGoal(therapistProfileId: string, goalId: string): void {
    if (typeof window === 'undefined') return
    const remaining = loadGoals(therapistProfileId).filter(g => g.id !== goalId)
    localStorage.setItem(KEY(therapistProfileId), JSON.stringify(remaining))
}

export function generateGoalId(): string {
    return `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATES — pre-built goal suggestions therapist can one-click add
// ─────────────────────────────────────────────────────────────────────────────

export interface GoalTemplate {
    id: string
    title: string
    description: string
    icon: string
    metric: GoalMetric
    target: number
    emotionTarget?: string
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
    {
        id: 'gt_fading_30',
        title: 'עצמאות 30%',
        description: 'המשתמש מגיע לרמת עצמאות של 30% — מבין עם רמזים עדינים',
        icon: '🌤️',
        metric: 'fading_level',
        target: 30,
    },
    {
        id: 'gt_fading_60',
        title: 'עצמאות 60%',
        description: 'המשתמש מגיע לרמת עצמאות של 60% — כמעט עצמאי',
        icon: '⭐',
        metric: 'fading_level',
        target: 60,
    },
    {
        id: 'gt_streak_5',
        title: 'רצף של 5',
        description: 'זיהוי נכון 5 פעמים ברצף — ללא פספוסים',
        icon: '🔥',
        metric: 'streak',
        target: 5,
    },
    {
        id: 'gt_entries_week',
        title: '5 רשומות שבועיות',
        description: 'רישום 5 אינטראקציות חברתיות בשבוע',
        icon: '📋',
        metric: 'total_entries_week',
        target: 5,
    },
    {
        id: 'gt_sarcasm',
        title: 'זהה 3 ציניות',
        description: 'זיהוי נכון של ציניות לפחות 3 פעמים',
        icon: '😏',
        metric: 'emotion_identified',
        target: 3,
        emotionTarget: 'sarcasm',
    },
    {
        id: 'gt_shy',
        title: 'זהה 3 ביישנות',
        description: 'זיהוי ביישנות וניहने מדרישות לא-מילוליות',
        icon: '😶',
        metric: 'emotion_identified',
        target: 3,
        emotionTarget: 'shy',
    },
]
