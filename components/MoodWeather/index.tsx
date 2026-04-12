'use client'
import { MoodWeatherType, WEATHER_DEFS, EmotionType } from '@/lib/types'

export function MoodWeather({ weatherType, participantCount = 1, roomName = 'החדר', fadeOpacity = 1 }:
    { weatherType: MoodWeatherType; participantCount?: number; roomName?: string; fadeOpacity?: number }) {
    const def = WEATHER_DEFS[weatherType]
    return (
        <div className={`relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br ${def.bgGradient} border border-border`}
            style={{ opacity: fadeOpacity * 0.3 + 0.7 }}>
            <div className="absolute top-2 left-3 text-6xl opacity-10 pointer-events-none select-none">{def.icon}</div>
            <div className="relative flex items-center gap-4">
                <div className="flex-shrink-0 text-5xl animate-bounce-gentle">{def.icon}</div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">מזג האוויר ב{roomName}</p>
                    <h3 className="text-xl font-extrabold text-text-primary">{def.label}</h3>
                    <p className="text-sm text-text-secondary leading-snug mt-0.5">{def.description}</p>
                </div>
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <div className="flex gap-1 flex-wrap justify-center max-w-[48px]">
                        {Array.from({ length: Math.min(participantCount, 6) }).map((_, i) => (
                            <div key={i} className="w-3 h-3 rounded-full bg-text-muted opacity-50" />
                        ))}
                    </div>
                    {participantCount > 0 && <p className="text-xs text-text-muted">{participantCount} איש</p>}
                </div>
            </div>
        </div>
    )
}

export function emotionToWeather(emotion: EmotionType): MoodWeatherType {
    switch (emotion) {
        case 'approachable': return 'sunny'
        case 'calm': return 'partly-cloudy'
        case 'caution': return 'cloudy'
        case 'intense': return 'stormy'
    }
}

export function WeatherBadge({ weatherType, size = 'md' }: { weatherType: MoodWeatherType; size?: 'sm' | 'md' }) {
    const def = WEATHER_DEFS[weatherType]
    const sm = size === 'sm'
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-white border border-border text-text-secondary ${sm ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5'}`}>
            <span className={sm ? 'text-sm' : 'text-base'}>{def.icon}</span>{def.label}
        </span>
    )
}
