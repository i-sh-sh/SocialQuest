'use client'
import type { EmotionType, FadingState } from '@/lib/types'
import { EMOTIONS, EMOTION_COLORS } from '@/lib/constants'
import { fadingToOpacity } from '@/lib/engine'
import { SocialHalo } from '@/components/SocialHalo'
import { CueCards } from '@/components/CueCards'
import { useTTS } from '@/hooks/useTTS'

interface VisualInterpreterProps {
    currentEmotion: EmotionType
    intensity: number
    fadingState: FadingState
    personName?: string
    showCueCards?: boolean
    /** Passed from useEmotionEngine — drives the opacity transition */
    isTransitioning?: boolean
    /** Called when user confirms correct detection */
    onCorrect?: () => void
}

export function VisualInterpreter({
    currentEmotion,
    intensity,
    fadingState,
    personName = 'הדובר',
    showCueCards = true,
    isTransitioning = false,
    onCorrect,
}: VisualInterpreterProps) {
    const fadeOpacity = fadingToOpacity(fadingState.level)
    const colors = EMOTION_COLORS[currentEmotion]
    const emotionDef = EMOTIONS[currentEmotion]
    const { speak, speaking, supported } = useTTS()

    return (
        <div
            className="flex flex-col items-center gap-6 w-full"
            style={{ opacity: isTransitioning ? 0.6 : 1, transition: 'opacity 0.2s ease' }}
        >
            <div className="relative flex flex-col items-center gap-4 w-full">
                <div className="relative flex items-center justify-center">
                    <SocialHalo emotion={currentEmotion} intensity={intensity} fadeOpacity={fadeOpacity} />
                    <div
                        className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-4xl bg-white shadow-card"
                        style={{ border: `3px solid ${colors.primary}`, opacity: fadeOpacity * 0.4 + 0.6 }}
                    >
                        {emotionDef.icon}
                    </div>
                </div>

                <p className="text-text-secondary text-sm font-medium">{personName}</p>

                <div
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-lg transition-all duration-300"
                    style={{
                        backgroundColor: colors.light,
                        color: colors.text,
                        borderColor: colors.primary,
                        borderWidth: 2,
                        opacity: fadeOpacity * 0.5 + 0.5,
                    }}
                >
                    <span className="text-2xl">{emotionDef.icon}</span>
                    <span>{emotionDef.label}</span>
                </div>

                <div className="flex items-center gap-2" style={{ opacity: fadeOpacity * 0.6 + 0.4 }}>
                    <p className="text-center text-base text-text-secondary max-w-xs leading-relaxed px-4">
                        {emotionDef.sublabel}
                    </p>
                    {supported && (
                        <button
                            id="btn-tts-emotion"
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all active:scale-90 ${speaking ? 'bg-calm text-white' : 'bg-surface-2 border border-border text-text-muted'}`}
                            onClick={() => speak(`${emotionDef.label}. ${emotionDef.sublabel}`)}
                            title="האזן לתיאור הרגש"
                        >
                            🔊
                        </button>
                    )}
                </div>

                {/* Intensity bar */}
                <div className="w-full max-w-xs px-4">
                    <div className="flex justify-between text-xs text-text-muted mb-1.5">
                        <span>עוצמת הרגש</span>
                        <span>{Math.round(intensity * 100)}%</span>
                    </div>
                    <div className="h-2.5 bg-surface-2 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${intensity * 100}%`, backgroundColor: colors.primary, opacity: fadeOpacity * 0.6 + 0.4 }}
                        />
                    </div>
                </div>
            </div>

            {showCueCards && (
                <CueCards emotion={currentEmotion} intensity={intensity} fadeOpacity={fadeOpacity} />
            )}

            {onCorrect && (
                <div className="flex gap-2 w-full">
                    <button
                        id="btn-correct-detection"
                        className="flex-1 py-2.5 rounded-2xl text-sm font-bold border-2 border-approachable bg-approachable/10 text-approachable-dark active:scale-95 transition-all flex items-center justify-center gap-1.5"
                        onClick={onCorrect}
                    >
                        ✓ זיהיתי נכון!
                    </button>
                </div>
            )}

            {fadingState.level > 0.3 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-xl border border-border text-sm text-text-secondary">
                    🌟 אתה לומד לזהות לבד!
                </div>
            )}
        </div>
    )
}
