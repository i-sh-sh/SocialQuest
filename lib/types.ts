export type EmotionType = 'approachable' | 'caution' | 'intense' | 'calm'
export type MoodWeatherType = 'sunny' | 'cloudy' | 'stormy' | 'partly-cloudy'

export interface EmotionSignal {
    emotion: EmotionType
    intensity: number
    label: string
    sublabel: string
    icon: string
    timestamp: Date
}
export interface SocialCue {
    id: string
    type: 'tone' | 'facial' | 'gesture' | 'words'
    emotion: EmotionType
    description: string
    example?: string
}
export interface LogEntry {
    id: string
    date: Date
    emotion: EmotionType
    intensity: number
    context: string
    cues: SocialCue[]
    fadingLevel: number
    notes?: string
}
export interface FadingState {
    level: number
    streak: number
    lastUpdated: Date
}
export interface EmotionColors {
    primary: string; light: string; dark: string; halo: string; text: string
}

export const EMOTION_COLORS: Record<EmotionType, EmotionColors> = {
    approachable: { primary: '#58CC02', light: '#E8F9D5', dark: '#3D9400', halo: 'rgba(88,204,2,0.20)', text: '#2D6E00' },
    caution: { primary: '#FFA500', light: '#FFF3E0', dark: '#CC7A00', halo: 'rgba(255,165,0,0.20)', text: '#7A4800' },
    intense: { primary: '#FF4B4B', light: '#FFE5E5', dark: '#CC2E2E', halo: 'rgba(255,75,75,0.20)', text: '#8B0000' },
    calm: { primary: '#1CB0F6', light: '#E3F6FE', dark: '#0A8CC9', halo: 'rgba(28,176,246,0.20)', text: '#0A5C8A' },
}

export const EMOTIONS: Record<EmotionType, Omit<EmotionSignal, 'intensity' | 'timestamp'>> = {
    approachable: { emotion: 'approachable', label: 'אפשר לגשת', sublabel: 'האדם הזה מרגיש טוב ופתוח לשיחה', icon: '😊' },
    caution: { emotion: 'caution', label: 'שים לב', sublabel: 'ייתכן שנאמר בצחוק או בציניות — לא הכל פשוט', icon: '🤔' },
    intense: { emotion: 'intense', label: 'עוצמה גבוהה', sublabel: 'הרגשות חזקים כרגע — כדאי לחכות', icon: '😤' },
    calm: { emotion: 'calm', label: 'רגוע ונייטרלי', sublabel: 'האדם הזה רגוע ומדבר בצורה ישירה', icon: '😌' },
}

export interface WeatherDefinition {
    type: MoodWeatherType; label: string; description: string
    icon: string; bgGradient: string; relatedEmotion: EmotionType
}
export const WEATHER_DEFS: Record<MoodWeatherType, WeatherDefinition> = {
    sunny: { type: 'sunny', label: 'שמשי', description: 'האווירה בחדר חיובית ומזמינה', icon: '☀️', bgGradient: 'from-yellow-50 to-green-50', relatedEmotion: 'approachable' },
    'partly-cloudy': { type: 'partly-cloudy', label: 'מעורב', description: 'האווירה מעורבת — שים לב לרמזים', icon: '⛅', bgGradient: 'from-blue-50 to-yellow-50', relatedEmotion: 'calm' },
    cloudy: { type: 'cloudy', label: 'מעונן', description: 'קשה לקרוא את האווירה עכשיו', icon: '☁️', bgGradient: 'from-gray-50 to-blue-50', relatedEmotion: 'calm' },
    stormy: { type: 'stormy', label: 'סוער', description: 'האווירה מתוחה — כדאי להיזהר', icon: '⛈️', bgGradient: 'from-red-50 to-orange-50', relatedEmotion: 'intense' },
}

export function createMockLogEntries(): LogEntry[] {
    const today = new Date()
    return [
        {
            id: '1', date: new Date(today.getTime() - 1000 * 60 * 60 * 2), emotion: 'approachable', intensity: 0.8,
            context: 'שיעור חינוך גופני — שיחה עם חבר', fadingLevel: 0.3,
            cues: [{ id: 'c1', type: 'facial', emotion: 'approachable', description: 'חיוך רחב, עיניים פקוחות' }, { id: 'c2', type: 'tone', emotion: 'approachable', description: 'קול רך ואנרגטי' }]
        },
        {
            id: '2', date: new Date(today.getTime() - 1000 * 60 * 60 * 4), emotion: 'caution', intensity: 0.6,
            context: 'הפסקה — שיחה בקבוצה', fadingLevel: 0.5,
            cues: [{ id: 'c3', type: 'tone', emotion: 'caution', description: 'גוון אירוני בדיבור' }, { id: 'c4', type: 'facial', emotion: 'caution', description: 'חיוך מהצד, לא ישיר' }]
        },
        {
            id: '3', date: new Date(today.getTime() - 1000 * 60 * 60 * 6), emotion: 'calm', intensity: 0.4,
            context: 'שיחה עם המורה', fadingLevel: 0.2,
            cues: [{ id: 'c5', type: 'tone', emotion: 'calm', description: 'קול שקט ואחיד' }, { id: 'c6', type: 'words', emotion: 'calm', description: 'ניסוח ישיר ומנומס' }]
        },
        {
            id: '4', date: new Date(today.getTime() - 1000 * 60 * 60 * 8), emotion: 'intense', intensity: 0.9,
            context: 'ויכוח בזמן משחק', fadingLevel: 0.1,
            cues: [{ id: 'c7', type: 'tone', emotion: 'intense', description: 'קול מורם, דיבור מהיר' }, { id: 'c8', type: 'gesture', emotion: 'intense', description: 'ידיים בתנועה חזקה' }]
        },
    ]
}
