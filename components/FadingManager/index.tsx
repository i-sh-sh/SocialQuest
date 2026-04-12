'use client'
import { FadingState } from '@/lib/types'

const LEVELS = [
    { range: [0, 0.2], label: 'מתחיל', description: 'צבעים מלאים — עזרה מלאה', icon: '🌈', color: '#58CC02' },
    { range: [0.2, 0.4], label: 'לומד', description: 'צבעים חלקיים — מתחיל להבין', icon: '🌤️', color: '#1CB0F6' },
    { range: [0.4, 0.6], label: 'מתקדם', description: 'רמזים עדינים — כמעט עצמאי', icon: '⭐', color: '#FFA500' },
    { range: [0.6, 0.8], label: 'מיומן', description: 'רמז קטן בלבד', icon: '🏆', color: '#FF4B4B' },
    { range: [0.8, 1.01], label: 'עצמאי!', description: 'ללא עזרה — מבין לבד!', icon: '🦋', color: '#8B5CF6' },
]
const getStage = (l: number) => LEVELS.find(s => l >= s.range[0] && l < s.range[1]) ?? LEVELS[0]

export function FadingBar({ fadingState, compact = false }: { fadingState: FadingState; compact?: boolean }) {
    const stage = getStage(fadingState.level)
    const pct = Math.round(fadingState.level * 100)
    return (
        <div className={compact ? 'flex items-center gap-3' : 'flex flex-col gap-3'}>
            {!compact && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{stage.icon}</span>
                        <div>
                            <p className="font-bold text-text-primary text-sm">{stage.label}</p>
                            <p className="text-xs text-text-muted">{stage.description}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-extrabold text-text-primary text-lg">{pct}%</p>
                        <p className="text-xs text-text-muted">עצמאות</p>
                    </div>
                </div>
            )}
            <div className="w-full h-3 bg-surface-2 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#58CC02,#1CB0F6 40%,#8B5CF6)' }} />
            </div>
            {!compact && (
                <div className="flex justify-between">
                    {LEVELS.map((l, i) => {
                        const active = fadingState.level >= l.range[0]
                        return (
                            <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all"
                                style={{ backgroundColor: active ? l.color : '#E4E6EA', transform: active ? 'scale(1)' : 'scale(0.85)' }}>
                                {active ? '✓' : ''}
                            </div>
                        )
                    })}
                </div>
            )}
            {!compact && fadingState.streak > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-text-secondary bg-surface rounded-xl px-3 py-1.5 border border-border">
                    🔥 {fadingState.streak} זיהויים נכונים ברצף!
                </div>
            )}
            {compact && (
                <div className="flex items-center gap-1.5">
                    <span className="text-sm">{stage.icon}</span>
                    <span className="text-xs font-semibold text-text-secondary">{stage.label}</span>
                    <span className="text-xs text-text-muted">({pct}%)</span>
                </div>
            )}
        </div>
    )
}

export function FadingManager({ fadingState, onLevelChange }:
    { fadingState: FadingState; onLevelChange?: (n: number) => void }) {
    const stage = getStage(fadingState.level)
    return (
        <div className="bg-white rounded-3xl border border-border p-5 flex flex-col gap-4 shadow-card">
            <div className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <h3 className="font-extrabold text-text-primary">מסלול למידה</h3>
            </div>
            <FadingBar fadingState={fadingState} />
            <div className="rounded-2xl p-3.5 text-center" style={{ backgroundColor: stage.color + '15' }}>
                <p className="text-sm font-bold" style={{ color: stage.color }}>{stage.icon} {stage.label}</p>
                <p className="text-xs text-text-secondary mt-0.5">{stage.description}</p>
            </div>
            {onLevelChange && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs text-text-muted font-semibold">עדכן רמה ידנית (למטפל/הורה)</p>
                    <div className="flex gap-2">
                        <button className="flex-1 py-2 rounded-xl text-sm font-bold border border-border text-text-secondary hover:bg-surface-2 active:scale-95 transition-all"
                            onClick={() => onLevelChange(Math.max(0, fadingState.level - 0.1))}>← פחות</button>
                        <button className="flex-1 py-2 rounded-xl text-sm font-bold border border-border text-text-secondary hover:bg-surface-2 active:scale-95 transition-all"
                            onClick={() => onLevelChange(Math.min(1, fadingState.level + 0.1))}>יותר →</button>
                    </div>
                </div>
            )}
        </div>
    )
}
