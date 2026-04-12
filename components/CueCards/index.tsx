'use client'
import { EmotionType, EMOTION_COLORS, EMOTIONS } from '@/lib/types'

const CUE_CONTENT: Record<EmotionType, { icon: string; title: string; body: string }[]> = {
  approachable: [
    { icon: '👀', title: 'הבעת פנים', body: 'חיוך פתוח, עיניים מסתכלות ישר' },
    { icon: '🗣️', title: 'טון דיבור', body: 'קול חם ונינוח, קצב שקט' },
    { icon: '💬', title: 'מה זה אומר?', body: 'הוא/היא שמחים לדבר איתך עכשיו' },
  ],
  caution: [
    { icon: '😏', title: 'הבעת פנים', body: 'חיוך מהצד, גבה מורמת' },
    { icon: '🎭', title: 'טון דיבור', body: 'קול מנוגן, הדגשות מיוחדות' },
    { icon: '💬', title: 'מה זה אומר?', body: 'ייתכן שמדברים בציניות — המילים לא תמיד ישירות' },
  ],
  intense: [
    { icon: '😤', title: 'הבעת פנים', body: 'מצח מקומט, פה לחוץ' },
    { icon: '📢', title: 'טון דיבור', body: 'קול מורם ומהיר, קצב לחוץ' },
    { icon: '💬', title: 'מה זה אומר?', body: 'הרגשות חזקים כרגע — כדאי לחכות קצת' },
  ],
  calm: [
    { icon: '😌', title: 'הבעת פנים', body: 'הבעה נייטרלית, שקטה' },
    { icon: '🎵', title: 'טון דיבור', body: 'קול אחיד ושקט, קצב סדיר' },
    { icon: '💬', title: 'מה זה אומר?', body: 'הוא/היא מדברים בצורה ישירה ורגועה' },
  ],
}

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
    </div>
  )
}
