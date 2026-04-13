'use client'
/**
 * components/GoalsPanel/index.tsx
 * Therapist goal management: create from templates, see progress, delete.
 * Used inside SupervisorDashboard.
 */

import { useState, useCallback, useEffect } from 'react'
import type { LogEntry, FadingState } from '@/lib/types'
import {
    loadGoals, saveGoal, deleteGoal, computeGoalProgress,
    generateGoalId, GOAL_TEMPLATES,
} from '@/lib/goals'
import type { TherapyGoal, GoalProgress } from '@/lib/goals'

interface GoalsPanelProps {
    therapistProfileId: string
    childProfileId: string
    entries: LogEntry[]
    fadingState: FadingState
}

const METRIC_LABELS: Record<string, string> = {
    accuracy_practice:  'דיוק זיהוי',
    fading_level:       'עצמאות',
    streak:             'רצף',
    total_entries_week: 'רשומות שבוע',
    emotion_identified: 'זיהוי רגש',
}

export function GoalsPanel({ therapistProfileId, childProfileId, entries, fadingState }: GoalsPanelProps) {
    const [goals, setGoals] = useState<TherapyGoal[]>([])
    const [progresses, setProgresses] = useState<GoalProgress[]>([])
    const [showAdd, setShowAdd] = useState(false)

    const refresh = useCallback(() => {
        const all = loadGoals(therapistProfileId).filter(g => g.childProfileId === childProfileId)
        setGoals(all)
        setProgresses(all.map(g => computeGoalProgress(g, entries, fadingState)))
    }, [therapistProfileId, childProfileId, entries, fadingState])

    useEffect(() => { refresh() }, [refresh])

    const addFromTemplate = useCallback((templateId: string) => {
        const tmpl = GOAL_TEMPLATES.find(t => t.id === templateId)
        if (!tmpl) return
        const goal: TherapyGoal = {
            id: generateGoalId(),
            title: tmpl.title,
            description: tmpl.description,
            metric: tmpl.metric,
            target: tmpl.target,
            emotionTarget: tmpl.emotionTarget,
            createdAt: new Date(),
            childProfileId,
            therapistProfileId,
        }
        saveGoal(therapistProfileId, goal)
        setShowAdd(false)
        refresh()
    }, [therapistProfileId, childProfileId, refresh])

    const removeGoal = useCallback((goalId: string) => {
        deleteGoal(therapistProfileId, goalId)
        refresh()
    }, [therapistProfileId, refresh])

    const activeGoals = progresses.filter(p => !p.completed)
    const doneGoals   = progresses.filter(p => p.completed)

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <p className="font-extrabold text-text-primary text-sm">🎯 מטרות טיפוליות</p>
                <button
                    id="btn-add-goal"
                    className="text-xs font-bold text-calm bg-calm/10 px-3 py-1.5 rounded-full active:scale-95 transition-all"
                    onClick={() => setShowAdd(v => !v)}
                >
                    {showAdd ? '✕ ביטול' : '+ הוסף מטרה'}
                </button>
            </div>

            {/* Template picker */}
            {showAdd && (
                <div className="flex flex-col gap-2 p-3 bg-surface rounded-2xl border border-border">
                    <p className="text-xs font-semibold text-text-muted">בחר תבנית מטרה</p>
                    {GOAL_TEMPLATES.map(tmpl => (
                        <button
                            key={tmpl.id}
                            id={`add-goal-${tmpl.id}`}
                            className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-border active:scale-95 transition-all text-right"
                            onClick={() => addFromTemplate(tmpl.id)}
                        >
                            <span className="text-xl">{tmpl.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-text-primary">{tmpl.title}</p>
                                <p className="text-[10px] text-text-muted leading-snug">{tmpl.description}</p>
                            </div>
                            <span className="text-calm text-xs font-bold flex-shrink-0">+ הוסף</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Active goals */}
            {activeGoals.length === 0 && !showAdd && (
                <p className="text-xs text-text-muted text-center py-3">
                    אין מטרות פעילות. לחץ "+ הוסף מטרה" להגדיר.
                </p>
            )}

            {activeGoals.map(({ goal, current, pct }) => (
                <div key={goal.id} className="bg-white rounded-2xl border border-border p-3 flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                        <div className="flex-1">
                            <p className="text-sm font-bold text-text-primary">{goal.title}</p>
                            <p className="text-[10px] text-text-muted">{METRIC_LABELS[goal.metric]}: {current} / {goal.target}</p>
                        </div>
                        <button
                            id={`delete-goal-${goal.id}`}
                            className="text-text-muted text-xs hover:text-intense transition-colors flex-shrink-0 active:scale-90"
                            onClick={() => removeGoal(goal.id)}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct * 100}%`, background: pct >= 0.8 ? '#58CC02' : 'linear-gradient(90deg, #1CB0F6, #58CC02)' }} />
                    </div>
                    <p className="text-[10px] text-text-muted text-left">{Math.round(pct * 100)}%</p>
                </div>
            ))}

            {/* Completed goals */}
            {doneGoals.length > 0 && (
                <div className="flex flex-col gap-1.5">
                    <p className="text-[10px] font-semibold text-approachable uppercase tracking-wide">✓ הושלמו</p>
                    {doneGoals.map(({ goal }) => (
                        <div key={goal.id} className="bg-approachable/5 rounded-xl border border-approachable/25 p-2.5 flex items-center gap-2">
                            <span className="text-approachable text-sm">✅</span>
                            <p className="text-xs font-semibold text-text-secondary">{goal.title}</p>
                            <button
                                id={`delete-done-${goal.id}`}
                                className="mr-auto text-[10px] text-text-muted active:scale-90 transition-all"
                                onClick={() => removeGoal(goal.id)}
                            >✕</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
