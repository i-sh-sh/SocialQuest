'use client'
import { useState, useEffect, useCallback } from 'react'
import { EmotionType, EmotionSignal, EMOTIONS, EMOTION_COLORS, FadingState } from '@/lib/types'
import { SocialHalo } from '@/components/SocialHalo'
import { CueCards } from '@/components/CueCards'

export function VisualInterpreter({ currentEmotion, intensity, fadingState, personName = 'הדובר', showCueCards = true }:
    { currentEmotion: EmotionType; intensity: number; fadingState: FadingState; personName?: string; showCueCards?: boolean }) {
    const [displaySignal, setDisplaySignal] = useState<EmotionSignal | null>(null)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const fadeOpacity = 1 - fadingState.level
    const colors = EMOTION_COLORS[currentEmotion]
    const emotionDef = EMOTIONS[currentEmotion]
    const buildSignal = useCallback((): EmotionSignal => ({ ...emotionDef, intensity, timestamp: new Date() }), [emotionDef, intensity])

    useEffect(() => {
        setIsTransitioning(true)
        const t = setTimeout(() => { setDisplaySignal(buildSignal()); setIsTransitioning(false) }, 200)
        return () => clearTimeout(t)
    }, [currentEmotion, intensity, buildSignal])

    return (
        <div className="flex flex-col items-center gap-6 w-full"
            style={{ opacity: isTransitioning ? 0.6 : 1, transition: 'opacity 0.2s ease' }}>
            <div className="relative flex flex-col items-center gap-4 w-full">
                <div className="relative flex items-center justify-center">
                    <SocialHalo emotion={currentEmotion} intensity={intensity} fadeOpacity={fadeOpacity} />
                    <div className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-4xl bg-white shadow-card"
                        style={{ border: `3px solid ${colors.primary}`, opacity: fadeOpacity * 0.4 + 0.6 }}>
                        {emotionDef.icon}
                    </div>
                </div>
                <p className="text-text-secondary text-sm font-medium">{personName}</p>
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-lg transition-all duration-300"
                    style={{ backgroundColor: colors.light, color: colors.text, borderColor: colors.primary, borderWidth: 2, opacity: fadeOpacity * 0.5 + 0.5 }}>
                    <span className="text-2xl">{emotionDef.icon}</span>
                    <span>{emotionDef.label}</span>
                </div>
                <p className="text-center text-base text-text-secondary max-w-xs leading-relaxed px-4"
                    style={{ opacity: fadeOpacity * 0.6 + 0.4 }}>{emotionDef.sublabel}</p>
                <div className="w-full max-w-xs px-4">
                    <div className="flex justify-between text-xs text-text-muted mb-1.5">
                        <span>עוצמת הרגש</span><span>{Math.round(intensity * 100)}%</span>
                    </div>
                    <div className="h-2.5 bg-surface-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${intensity * 100}%`, backgroundColor: colors.primary, opacity: fadeOpacity * 0.6 + 0.4 }} />
                    </div>
                </div>
            </div>
            {showCueCards && displaySignal && <CueCards emotion={currentEmotion} intensity={intensity} fadeOpacity={fadeOpacity} />}
            {fadingState.level > 0.3 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-xl border border-border text-sm text-text-secondary">
                    🌟 אתה לומד לזהות לבד!
                </div>
            )}
        </div>
    )
}
