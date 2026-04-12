'use client'
import { EmotionType, EMOTION_COLORS } from '@/lib/types'

const SCENARIOS = [
    { label: 'חבר שמח', icon: '🤗', emotion: 'approachable' as EmotionType, intensity: 0.85, description: 'חבר רוצה לשחק איתך' },
    { label: 'דיבור בציניות', icon: '😏', emotion: 'caution' as EmotionType, intensity: 0.65, description: 'המורה אמרה "כל הכבוד" בנימה מיוחדת' },
    { label: 'שיחה רגועה', icon: '😌', emotion: 'calm' as EmotionType, intensity: 0.40, description: 'שיחה סתמית על מה אכלת היום' },
    { label: 'ויכוח', icon: '😤', emotion: 'intense' as EmotionType, intensity: 0.90, description: 'ילד כועס על תוצאת המשחק' },
    { label: 'שמחה עצומה', icon: '🎉', emotion: 'approachable' as EmotionType, intensity: 0.99, description: 'חברה נרגשת שזכתה בפרס' },
    { label: 'עצב שקט', icon: '😔', emotion: 'calm' as EmotionType, intensity: 0.55, description: 'ילד שלא מדבר הרבה אחרי הפסקה' },
]

export function SimulatorPanel({ activeEmotion, activeIntensity, onSelect }:
    { activeEmotion: EmotionType; activeIntensity: number; onSelect: (e: EmotionType, i: number) => void }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <span className="text-lg">🎬</span>
                <h3 className="font-extrabold text-text-primary">סימולטור סיטואציות</h3>
                <span className="text-xs text-text-muted bg-surface-2 px-2 py-0.5 rounded-full">Demo</span>
            </div>
            <p className="text-sm text-text-secondary">בחר סיטואציה כדי לראות איך SocialLens תתרגם אותה</p>
            <div className="grid grid-cols-2 gap-2.5">
                {SCENARIOS.map((s, i) => {
                    const c = EMOTION_COLORS[s.emotion]
                    const active = activeEmotion === s.emotion && Math.abs(activeIntensity - s.intensity) < 0.1
                    return (
                        <button key={i} className="relative text-right p-3.5 rounded-2xl border transition-all duration-200 active:scale-95"
                            style={{ backgroundColor: active ? c.light : '#fff', borderColor: active ? c.primary : '#E4E6EA', borderWidth: active ? 2 : 1 }}
                            onClick={() => onSelect(s.emotion, s.intensity)}>
                            <div className="flex items-start gap-2">
                                <span className="text-2xl">{s.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold leading-tight" style={{ color: active ? c.dark : '#1A1A2E' }}>{s.label}</p>
                                    <p className="text-xs text-text-muted leading-snug mt-0.5">{s.description}</p>
                                </div>
                            </div>
                            {active && <div className="absolute top-2 left-2 w-2 h-2 rounded-full" style={{ backgroundColor: c.primary }} />}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
