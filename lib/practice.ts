/**
 * lib/practice.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Practice Mode logic — pure functions, no React.
 * Generates sessions, scores answers, computes session results.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { EmotionType } from './types'
import { PRACTICE_SCENARIOS } from './constants'
import type { PracticeScenario } from './constants'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface PracticeQuestion {
    scenario: PracticeScenario
    options: EmotionType[]        // 4 shuffled options
    correctEmotion: EmotionType
}

export interface PracticeAnswer {
    questionIndex: number
    chosen: EmotionType
    correct: boolean
    timeMs: number               // how long user took
}

export interface PracticeSession {
    questions: PracticeQuestion[]
    answers: PracticeAnswer[]
    startedAt: Date
    completedAt?: Date
}

export interface SessionResult {
    correct: number
    total: number
    accuracy: number             // 0–1
    avgTimeMs: number
    xpEarned: number
    streakAchieved: number
    perfectSession: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSION GENERATION
// ─────────────────────────────────────────────────────────────────────────────

const ALL_EMOTIONS: EmotionType[] = ['approachable', 'calm', 'caution', 'intense', 'sarcasm', 'shy']

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

/**
 * Generate 4 answer options: the correct answer + 3 distractors.
 * Distractors are biased toward "similar" emotions for added challenge.
 */
function generateOptions(correct: EmotionType): EmotionType[] {
    const distractors = ALL_EMOTIONS.filter(e => e !== correct)
    const picked = shuffle(distractors).slice(0, 3)
    return shuffle([correct, ...picked])
}

/**
 * Build a practice session from the scenario catalog.
 * @param count  Number of questions (default 5)
 * @param difficulty  Filter by difficulty
 */
export function createPracticeSession(
    count = 5,
    difficulty?: PracticeScenario['difficulty'],
): PracticeSession {
    const pool = difficulty
        ? PRACTICE_SCENARIOS.filter(s => s.difficulty === difficulty)
        : PRACTICE_SCENARIOS

    const selected = shuffle(pool).slice(0, count)

    const questions: PracticeQuestion[] = selected.map(scenario => ({
        scenario,
        options: generateOptions(scenario.correctEmotion),
        correctEmotion: scenario.correctEmotion,
    }))

    return { questions, answers: [], startedAt: new Date() }
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORING
// ─────────────────────────────────────────────────────────────────────────────

const XP_CORRECT   = 15
const XP_FAST      = 5    // answered in < 5s
const XP_PERFECT   = 30   // all correct in a session

export function computeSessionResult(session: PracticeSession): SessionResult {
    const { answers, questions } = session
    const correct = answers.filter(a => a.correct).length
    const total = questions.length
    const accuracy = total > 0 ? correct / total : 0
    const perfectSession = correct === total && total > 0

    const avgTimeMs = answers.length > 0
        ? answers.reduce((s, a) => s + a.timeMs, 0) / answers.length
        : 0

    let xpEarned = correct * XP_CORRECT
    if (answers.some(a => a.correct && a.timeMs < 5000)) xpEarned += XP_FAST
    if (perfectSession) xpEarned += XP_PERFECT

    // streak = longest consecutive correct run
    let best = 0, cur = 0
    for (const a of answers) {
        cur = a.correct ? cur + 1 : 0
        if (cur > best) best = cur
    }

    return { correct, total, accuracy, avgTimeMs, xpEarned, streakAchieved: best, perfectSession }
}
