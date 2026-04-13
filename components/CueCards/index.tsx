'use client'
import Link from 'next/link'
import type { EmotionType } from '@/lib/types'
import { EMOTION_COLORS, CUE_CONTENT } from '@/lib/constants'
import { ResponseScripts } from '@/components/ResponseScripts'

export function CueCards({ emotion, intensity, fadeOpacity }:
  { emotion: EmotionType; intensity: number; fadeOpacity: number }) {
  const cards = CUE_CONTENT[emotion]
  const colors = EMOTION_COLORS[emotion]
  return (
    <div className="w-full flex flex-col gap-2.5 px-1 animate-slide-up" style={{ opacity: fadeOpacity * 0.5 + 0.5 }}>
      <p className="text-xs text-text-muted font-semibold uppercase tracking-wider pr-1">רמזים שזיהיתי</p>
      <div className="grid grid-cols-1 gap-2.5">
        {cards.map((card, i) => (
          <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl border transition-all duration-300"
            style={{ backgroundColor: colors.light, borderColor: colors.primary + '40' }}>
            <span className="text-2xl flex-shrink-0 mt-0.5">{card.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold mb-0.5" style={{ color: colors.dark }}>{card.title}</p>
              <p className="text-sm text-text-secondary leading-snug">{card.body}</p>
            </div>
            <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
              style={{ backgroundColor: colors.primary, opacity: 0.4 + intensity * 0.6 }} />
          </div>
        ))}
      </div>

      {/* Response scripts — what to say/do */}
      <ResponseScripts emotion={emotion} />

      {/* Practice Mode link */}
      <Link href="/practice" id="link-practice-from-cue"
        className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold border border-border text-text-secondary bg-surface hover:bg-surface-2 active:scale-95 transition-all">
        🎮 תרגל זיהוי במצב אימון
      </Link>
    </div>
  )
}

