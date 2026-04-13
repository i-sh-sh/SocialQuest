'use client'
import type { EmotionType } from '@/lib/types'
import { EMOTION_COLORS } from '@/lib/constants'

const SIZE_MAP = {
    sm: { outer: 104, mid: 88, inner: 72 },
    md: { outer: 160, mid: 136, inner: 112 },
    lg: { outer: 216, mid: 184, inner: 152 },
}

export function SocialHalo({ emotion, intensity, fadeOpacity, size = 'md' }:
    { emotion: EmotionType; intensity: number; fadeOpacity: number; size?: 'sm' | 'md' | 'lg' }) {
    const colors = EMOTION_COLORS[emotion]
    const { outer, mid, inner } = SIZE_MAP[size]
    const h = (hex: string, a: number) => {
        const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r},${g},${b},${a})`
    }
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
            {[{ w: outer, a: (0.08 + intensity * 0.06) * fadeOpacity, d: '0ms', dur: `${2.5 + (1 - intensity) * 1.5}s` },
            { w: mid, a: (0.14 + intensity * 0.08) * fadeOpacity, d: '200ms', dur: `${2.2 + (1 - intensity) * 1.3}s` },
            { w: inner, a: (0.22 + intensity * 0.10) * fadeOpacity, d: '400ms', dur: `${2.0 + (1 - intensity) * 1.0}s` }
            ].map((ring, i) => (
                <div key={i} className="absolute rounded-full animate-halo-breathe"
                    style={{
                        width: ring.w, height: ring.w, backgroundColor: h(colors.primary, ring.a),
                        animationDelay: ring.d, animationDuration: ring.dur
                    }} />
            ))}
        </div>
    )
}

export function MiniHalo({ emotion, size = 40 }: { emotion: EmotionType; size?: number }) {
    const c = EMOTION_COLORS[emotion]
    return (
        <div className="rounded-full" style={{
            width: size, height: size,
            backgroundColor: c.light, border: `2.5px solid ${c.primary}`, boxShadow: `0 0 0 4px ${c.halo}`
        }} />
    )
}
