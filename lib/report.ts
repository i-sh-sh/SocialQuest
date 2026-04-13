/**
 * lib/report.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates a plain-text weekly session report.
 * Pure function — no React, no side effects.
 * Designed to be copied and shared with a therapist via any channel.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { LogEntry, FadingState, EmotionType } from './types'
import { EMOTIONS } from './constants'
import { entriesWithinDays, dominantEmotion } from './engine'

function pct(n: number, total: number) {
    return total > 0 ? Math.round((n / total) * 100) : 0
}

function bar(value: number, max = 10): string {
    const filled = Math.round((value / max) * 10)
    return '█'.repeat(filled) + '░'.repeat(10 - filled)
}

export function generateSessionReport(
    entries: LogEntry[],
    fading: FadingState,
    profileId: string,
): string {
    const now = new Date()
    const weekEntries = entriesWithinDays(entries, 7)
    const today = entries.filter(e => {
        const d = new Date(); d.setHours(0, 0, 0, 0)
        return e.date >= d
    })

    const dominant = dominantEmotion(weekEntries)
    const counts: Record<EmotionType, number> = {
        approachable: 0, calm: 0, caution: 0, intense: 0, sarcasm: 0, shy: 0,
    }
    weekEntries.forEach(e => counts[e.emotion]++)

    const avgIntensity = weekEntries.length > 0
        ? Math.round(weekEntries.reduce((s, e) => s + e.intensity, 0) / weekEntries.length * 100)
        : 0

    const dateStr = now.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })

    const lines: string[] = [
        '════════════════════════════════════',
        '  SocialLens — דוח סשן שבועי',
        `  ${dateStr}`,
        '════════════════════════════════════',
        '',
        `📋 רשומות השבוע:  ${weekEntries.length}`,
        `📋 רשומות היום:   ${today.length}`,
        `🎯 עצמאות נוכחית: ${Math.round(fading.level * 100)}%`,
        `🔥 רצף נוכחי:     ${fading.streak}`,
        '',
        '── פירוט רגשות (7 ימים) ───────────',
    ]

    const total = weekEntries.length
    ;(Object.entries(counts) as [EmotionType, number][])
        .sort((a, b) => b[1] - a[1])
        .forEach(([emotion, count]) => {
            if (count === 0) return
            const def = EMOTIONS[emotion]
            const p = pct(count, total)
            lines.push(`  ${def.icon} ${def.label.padEnd(12)} ${bar(count, Math.max(...Object.values(counts)))} ${count}× (${p}%)`)
        })

    if (dominant) {
        lines.push('')
        lines.push(`⭐ רגש דומיננטי: ${EMOTIONS[dominant].icon} ${EMOTIONS[dominant].label}`)
    }

    lines.push('')
    lines.push('── עוצמה ממוצעת ─────────────────')
    lines.push(`  ${bar(avgIntensity, 100)} ${avgIntensity}%`)

    if (weekEntries.length >= 3) {
        lines.push('')
        lines.push('── תובנות אלגוריתמיות ───────────')

        // Pattern: most common context words
        const words = weekEntries.flatMap(e => e.context.split(/\s+/))
        const wordCount: Record<string, number> = {}
        words.forEach(w => { if (w.length > 2) wordCount[w] = (wordCount[w] ?? 0) + 1 })
        const topWords = Object.entries(wordCount).sort((a, b) => b[1] - a[1]).slice(0, 3)
        if (topWords.length > 0) {
            lines.push(`  מילות מפתח: ${topWords.map(([w]) => w).join(' · ')}`)
        }

        // Pattern: intensity trend (first half vs second half)
        const half = Math.floor(weekEntries.length / 2)
        const firstHalf  = weekEntries.slice(-half)
        const secondHalf = weekEntries.slice(0, half)
        const avgFirst  = firstHalf.reduce((s, e)  => s + e.intensity, 0) / Math.max(firstHalf.length, 1)
        const avgSecond = secondHalf.reduce((s, e) => s + e.intensity, 0) / Math.max(secondHalf.length, 1)
        const trend = avgSecond < avgFirst - 0.1 ? '↘ מגמת ירידה בעוצמה — מצוין!' :
                      avgSecond > avgFirst + 0.1 ? '↗ מגמת עלייה בעוצמה — שים לב' :
                      '→ עוצמה יציבה לאורך השבוע'
        lines.push(`  עוצמה: ${trend}`)

        // Fading progress
        if (fading.level >= 0.8) {
            lines.push('  🦋 הגיע לעצמאות מלאה — שלב ה-Fading הושלם!')
        } else if (fading.level >= 0.5) {
            lines.push('  ⭐ בדרך לעצמאות — ממשיך להתקדם')
        } else {
            lines.push('  🌱 בשלב הלמידה — ממשיך לגדול')
        }
    }

    if (weekEntries.length > 0) {
        lines.push('')
        lines.push('── רשומות אחרונות ───────────────')
        weekEntries.slice(0, 3).forEach(e => {
            const t = e.date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })
            const def = EMOTIONS[e.emotion]
            lines.push(`  [${t}] ${def.icon} ${e.context.slice(0, 40)}${e.context.length > 40 ? '...' : ''}`)
        })
    }

    lines.push('')
    lines.push('════════════════════════════════════')
    lines.push('  Privacy by Design — נוצר on-device')
    lines.push('════════════════════════════════════')

    return lines.join('\n')
}
