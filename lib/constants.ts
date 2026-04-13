/**
 * lib/constants.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * ALL DATA CONSTANTS for the app.
 * UI components import from here — never embed data inline in components.
 * Swap or extend any section without touching business logic or UI code.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type {
    EmotionType,
    MoodWeatherType,
    CueType,
    FadingStage,
    FadingStageId,
    Achievement,
    SessionStats,
} from './types'

// ─────────────────────────────────────────────────────────────────────────────
// EMOTION COLORS
// ─────────────────────────────────────────────────────────────────────────────

export interface EmotionColors {
    primary: string
    light: string
    dark: string
    halo: string
    text: string
}

export const EMOTION_COLORS: Record<EmotionType, EmotionColors> = {
    approachable: { primary: '#58CC02', light: '#E8F9D5', dark: '#3D9400', halo: 'rgba(88,204,2,0.20)',   text: '#2D6E00' },
    caution:      { primary: '#FFA500', light: '#FFF3E0', dark: '#CC7A00', halo: 'rgba(255,165,0,0.20)', text: '#7A4800' },
    intense:      { primary: '#FF4B4B', light: '#FFE5E5', dark: '#CC2E2E', halo: 'rgba(255,75,75,0.20)', text: '#8B0000' },
    calm:         { primary: '#1CB0F6', light: '#E3F6FE', dark: '#0A8CC9', halo: 'rgba(28,176,246,0.20)', text: '#0A5C8A' },
    sarcasm:      { primary: '#A855F7', light: '#F3E8FF', dark: '#7C3AED', halo: 'rgba(168,85,247,0.20)', text: '#5B21B6' },
    shy:          { primary: '#EC4899', light: '#FDF2F8', dark: '#BE185D', halo: 'rgba(236,72,153,0.20)', text: '#831843' },
}

// ─────────────────────────────────────────────────────────────────────────────
// EMOTION DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface EmotionDefinition {
    emotion: EmotionType
    label: string
    sublabel: string
    icon: string
}

export const EMOTIONS: Record<EmotionType, EmotionDefinition> = {
    approachable: { emotion: 'approachable', label: 'אפשר לגשת',    sublabel: 'האדם הזה מרגיש טוב ופתוח לשיחה',                icon: '😊' },
    caution:      { emotion: 'caution',      label: 'שים לב',        sublabel: 'ייתכן שנאמר בצחוק או בציניות — לא הכל פשוט',   icon: '🤔' },
    intense:      { emotion: 'intense',      label: 'עוצמה גבוהה',   sublabel: 'הרגשות חזקים כרגע — כדאי לחכות',               icon: '😤' },
    calm:         { emotion: 'calm',         label: 'רגוע ונייטרלי', sublabel: 'האדם הזה רגוע ומדבר בצורה ישירה',              icon: '😌' },
    sarcasm:      { emotion: 'sarcasm',      label: 'ציניות',        sublabel: 'אומרים דבר אחד ומתכוונים להיפך — תקשיב לטון',  icon: '😏' },
    shy:          { emotion: 'shy',          label: 'ביישנות',       sublabel: 'האדם לא בנוח — אולי כדאי לתת מרחב',            icon: '😶' },
}

// ─────────────────────────────────────────────────────────────────────────────
// WEATHER DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface WeatherDefinition {
    type: MoodWeatherType
    label: string
    description: string
    icon: string
    bgGradient: string
    relatedEmotion: EmotionType
}

export const WEATHER_DEFS: Record<MoodWeatherType, WeatherDefinition> = {
    sunny:           { type: 'sunny',         label: 'שמשי',   description: 'האווירה בחדר חיובית ומזמינה',        icon: '☀️',  bgGradient: 'from-yellow-50 to-green-50',  relatedEmotion: 'approachable' },
    'partly-cloudy': { type: 'partly-cloudy', label: 'מעורב',  description: 'האווירה מעורבת — שים לב לרמזים',    icon: '⛅',  bgGradient: 'from-blue-50 to-yellow-50',   relatedEmotion: 'calm' },
    cloudy:          { type: 'cloudy',         label: 'מעונן',  description: 'קשה לקרוא את האווירה עכשיו',       icon: '☁️',  bgGradient: 'from-gray-50 to-blue-50',    relatedEmotion: 'calm' },
    stormy:          { type: 'stormy',         label: 'סוער',   description: 'האווירה מתוחה — כדאי להיזהר',      icon: '⛈️', bgGradient: 'from-red-50 to-orange-50',   relatedEmotion: 'intense' },
}

// ─────────────────────────────────────────────────────────────────────────────
// FADING STAGES (scaffolding / independence)
// ─────────────────────────────────────────────────────────────────────────────

export const FADING_STAGES: FadingStage[] = [
    { id: 'beginner',    range: [0,    0.2 ], label: 'מתחיל',  description: 'צבעים מלאים — עזרה מלאה',        icon: '🌈', color: '#58CC02' },
    { id: 'learning',    range: [0.2,  0.4 ], label: 'לומד',   description: 'צבעים חלקיים — מתחיל להבין',     icon: '🌤️', color: '#1CB0F6' },
    { id: 'advancing',   range: [0.4,  0.6 ], label: 'מתקדם',  description: 'רמזים עדינים — כמעט עצמאי',      icon: '⭐', color: '#FFA500' },
    { id: 'skilled',     range: [0.6,  0.8 ], label: 'מיומן',  description: 'רמז קטן בלבד',                   icon: '🏆', color: '#FF4B4B' },
    { id: 'independent', range: [0.8,  1.01], label: 'עצמאי!', description: 'ללא עזרה — מבין לבד!',           icon: '🦋', color: '#8B5CF6' },
]

// ─────────────────────────────────────────────────────────────────────────────
// CUE CARDS CONTENT
// ─────────────────────────────────────────────────────────────────────────────

export interface CueCard {
    icon: string
    title: string
    body: string
}

export const CUE_CONTENT: Record<EmotionType, CueCard[]> = {
    approachable: [
        { icon: '👀', title: 'הבעת פנים', body: 'חיוך פתוח, עיניים מסתכלות ישר' },
        { icon: '🗣️', title: 'טון דיבור',  body: 'קול חם ונינוח, קצב שקט' },
        { icon: '💬', title: 'מה זה אומר?', body: 'הוא/היא שמחים לדבר איתך עכשיו' },
    ],
    caution: [
        { icon: '😏', title: 'הבעת פנים', body: 'חיוך מהצד, גבה מורמת' },
        { icon: '🎭', title: 'טון דיבור',  body: 'קול מנוגן, הדגשות מיוחדות' },
        { icon: '💬', title: 'מה זה אומר?', body: 'ייתכן שמדברים בציניות — המילים לא תמיד ישירות' },
    ],
    intense: [
        { icon: '😤', title: 'הבעת פנים', body: 'מצח מקומט, פה לחוץ' },
        { icon: '📢', title: 'טון דיבור',  body: 'קול מורם ומהיר, קצב לחוץ' },
        { icon: '💬', title: 'מה זה אומר?', body: 'הרגשות חזקים כרגע — כדאי לחכות קצת' },
    ],
    calm: [
        { icon: '😌', title: 'הבעת פנים', body: 'הבעה נייטרלית, שקטה' },
        { icon: '🎵', title: 'טון דיבור',  body: 'קול אחיד ושקט, קצב סדיר' },
        { icon: '💬', title: 'מה זה אומר?', body: 'הוא/היא מדברים בצורה ישירה ורגועה' },
    ],
    sarcasm: [
        { icon: '😏', title: 'הבעת פנים', body: 'חיוך עקום, גבה אחת מורמת' },
        { icon: '🎭', title: 'טון דיבור',  body: 'קול מוגזם, הדגשת מילים לא הגיוניות' },
        { icon: '💬', title: 'מה זה אומר?', body: 'המילים ≠ הכוונה. "כל הכבוד" שמשמעותו "לא עשית טוב"' },
    ],
    shy: [
        { icon: '😶', title: 'הבעת פנים', body: 'מבט לרצפה, גוף מכוסה קצת' },
        { icon: '🤫', title: 'טון דיבור',  body: 'קול שקט ומהסס, משפטים קצרים' },
        { icon: '💬', title: 'מה זה אומר?', body: 'האדם לא בנוח — לא כועס, רק זקוק למרחב' },
    ],
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATOR SCENARIOS
// ─────────────────────────────────────────────────────────────────────────────

export interface Scenario {
    id: string
    label: string
    icon: string
    emotion: EmotionType
    intensity: number      // 0–1
    description: string
}

export const SCENARIOS: Scenario[] = [
    { id: 's1', label: 'חבר שמח',       icon: '🤗', emotion: 'approachable', intensity: 0.85, description: 'חבר רוצה לשחק איתך' },
    { id: 's2', label: 'דיבור בציניות', icon: '😏', emotion: 'caution',      intensity: 0.65, description: 'המורה אמרה "כל הכבוד" בנימה מיוחדת' },
    { id: 's3', label: 'שיחה רגועה',   icon: '😌', emotion: 'calm',         intensity: 0.40, description: 'שיחה סתמית על מה אכלת היום' },
    { id: 's4', label: 'ויכוח',         icon: '😤', emotion: 'intense',      intensity: 0.90, description: 'ילד כועס על תוצאת המשחק' },
    { id: 's5', label: 'שמחה עצומה',   icon: '🎉', emotion: 'approachable', intensity: 0.99, description: 'חברה נרגשת שזכתה בפרס' },
    { id: 's6', label: 'עצב שקט',      icon: '😔', emotion: 'calm',         intensity: 0.55, description: 'ילד שלא מדבר הרבה אחרי הפסקה' },
]

// ─────────────────────────────────────────────────────────────────────────────
// LIVE DEMO SEQUENCE
// ─────────────────────────────────────────────────────────────────────────────

export interface LiveSequenceStep {
    emotion: EmotionType
    intensity: number
    delayMs: number
}

export const LIVE_SEQUENCE: LiveSequenceStep[] = [
    { emotion: 'approachable', intensity: 0.80, delayMs: 0 },
    { emotion: 'calm',         intensity: 0.40, delayMs: 3500 },
    { emotion: 'caution',      intensity: 0.65, delayMs: 7000 },
    { emotion: 'intense',      intensity: 0.90, delayMs: 11000 },
    { emotion: 'approachable', intensity: 0.70, delayMs: 15000 },
]

// ─────────────────────────────────────────────────────────────────────────────
// XP CONFIG
// ─────────────────────────────────────────────────────────────────────────────

export const XP_PER_LEVEL = 100

export const XP_REWARDS = {
    logEntry:          10,
    correctDetection:  15,
    streakBonus:       5,   // per streak step (multiplied)
    fadingMilestone:   25,
    dailyLogin:        5,
    sessionComplete:   20,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// ACHIEVEMENTS CATALOG
// Designed to be swappable: replace ACHIEVEMENTS array or add a new registry
// ─────────────────────────────────────────────────────────────────────────────

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_entry',
        category: 'milestone',
        title: 'צעד ראשון',
        description: 'רשמת את הרשומה הראשונה שלך',
        icon: '🌱',
        xpReward: 20,
        condition: (s: SessionStats) => s.totalEntries >= 1,
    },
    {
        id: 'streak_3',
        category: 'streak',
        title: 'שלוש ברצף',
        description: 'זיהית נכון 3 פעמים ברצף',
        icon: '🔥',
        xpReward: 30,
        condition: (s: SessionStats) => s.streak >= 3,
    },
    {
        id: 'streak_5',
        category: 'streak',
        title: 'חמש ברצף!',
        description: 'זיהית נכון 5 פעמים ברצף',
        icon: '🔥🔥',
        xpReward: 50,
        condition: (s: SessionStats) => s.streak >= 5,
    },
    {
        id: 'fading_learning',
        category: 'independence',
        title: 'לומד עצמאי',
        description: 'הגעת לרמת "לומד" במסלול המצמצם',
        icon: '🌤️',
        xpReward: 40,
        condition: (s: SessionStats) => s.fadingLevel >= 0.2,
    },
    {
        id: 'fading_independent',
        category: 'independence',
        title: 'עצמאות מלאה!',
        description: 'הגעת לרמת "עצמאי" — אתה מבין לבד!',
        icon: '🦋',
        xpReward: 100,
        condition: (s: SessionStats) => s.fadingLevel >= 0.8,
    },
    {
        id: 'explorer',
        category: 'exploration',
        title: 'חוקר רגשות',
        description: 'זיהית את כל 4 סוגי הרגשות',
        icon: '🗺️',
        xpReward: 35,
        condition: (s: SessionStats) => s.dominantEmotion !== null && s.totalEntries >= 4,
    },
    {
        id: 'ten_entries',
        category: 'social',
        title: '10 רשומות חברתיות',
        description: 'רשמת 10 אינטראקציות חברתיות',
        icon: '📚',
        xpReward: 60,
        condition: (s: SessionStats) => s.totalEntries >= 10,
    },
    {
        id: 'level_2',
        category: 'milestone',
        title: 'עלית רמה!',
        description: 'הגעת לרמה 2',
        icon: '⭐',
        xpReward: 0,
        condition: (s: SessionStats) => s.level >= 2,
    },
]

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

export interface NavItem {
    href?: string
    icon: string
    label: string
    id: string
}

export const NAV_ITEMS: NavItem[] = [
    { href: '/',         icon: '🏠', label: 'בית',      id: 'nav-home' },
    { href: '/log',      icon: '📋', label: 'יומן',     id: 'nav-log' },
    { href: '/practice', icon: '🎮', label: 'אימון',    id: 'nav-practice' },
    { href: '/quests',   icon: '🎯', label: 'אתגרים',   id: 'nav-quests' },
    { href: '/stories',  icon: '📖', label: 'סיפורים',  id: 'nav-stories' },
]

// ─────────────────────────────────────────────────────────────────────────────
// SOCIAL STORIES
// Each story is a step-by-step guide to navigating a social situation.
// Format based on Carol Gray's Social Stories methodology.
// ─────────────────────────────────────────────────────────────────────────────

export interface StoryStep {
    icon: string
    text: string
    emotion?: EmotionType    // emotion likely present in this step
    isTip?: boolean          // highlight as a tip box
}

export interface SocialStory {
    id: string
    title: string
    situation: string        // trigger: "כאשר..."
    icon: string
    category: 'classroom' | 'recess' | 'home' | 'public' | 'therapy'
    ageGroup: 'young' | 'teen'
    difficulty: 'easy' | 'medium' | 'hard'
    steps: StoryStep[]
    outcome: string          // "ואז אני..."
    practiceTag?: string     // link to practice scenario tag
}

export const SOCIAL_STORIES: SocialStory[] = [
    {
        id: 'ss1',
        title: 'כשחבר כועס',
        situation: 'כשחבר שלי כועס או מאוכזב',
        icon: '😤',
        category: 'recess',
        ageGroup: 'young',
        difficulty: 'easy',
        steps: [
            { icon: '👀', text: 'אני מסתכל על הפנים — הם אדומות? המצח קמוט?', emotion: 'intense' },
            { icon: '👂', text: 'אני מקשיב לקול — האם הוא חזק ומהיר?', emotion: 'intense' },
            { icon: '💡', text: 'הרגשות חזקים עכשיו. זה לא הזמן לדבר.', isTip: true },
            { icon: '🪑', text: 'אני נותן לו מרחב — אני עומד קצת יותר רחוק.' },
            { icon: '⏳', text: 'אני ממתין בסבלנות עד שהוא נרגע.' },
            { icon: '🗣️', text: 'כשהוא שקט יותר, אני אומר: "הכל בסדר? אני כאן."' },
        ],
        outcome: 'חברים לפעמים כועסים. זה לא אומר שהם כועסים עליי. אחרי שהם נרגעים, אפשר לדבר.',
        practiceTag: 'anger',
    },
    {
        id: 'ss2',
        title: 'להצטרף למשחק',
        situation: 'כשאני רוצה להצטרף לקבוצה שכבר משחקת',
        icon: '⚽',
        category: 'recess',
        ageGroup: 'young',
        difficulty: 'easy',
        steps: [
            { icon: '👀', text: 'אני מסתכל — האם הם נראים שמחים ופתוחים?', emotion: 'approachable' },
            { icon: '⏸️', text: 'אני מחכה לרגע שבו יש הפסקה במשחק.' },
            { icon: '🚶', text: 'אני ניגש לאחד שנראה ידידותי.' },
            { icon: '😊', text: 'אני מחייך ואומר: "אפשר לשחק גם?"' },
            { icon: '💡', text: 'אם הם אומרים לא — זה לא מה שאני שווה. הם אולי עסוקים.', isTip: true },
            { icon: '✅', text: 'אם הם אומרים כן — אני נכנס בשמחה ועוקב אחרי החוקים.' },
        ],
        outcome: 'לפעמים אפשר להצטרף, לפעמים לא. שניהם בסדר.',
        practiceTag: 'invitation',
    },
    {
        id: 'ss3',
        title: 'כשהמורה אומרת "כל הכבוד" בנימה מיוחדת',
        situation: 'כשאני לא בטוח אם המורה מרוצה ממני',
        icon: '🎭',
        category: 'classroom',
        ageGroup: 'teen',
        difficulty: 'medium',
        steps: [
            { icon: '👂', text: 'אני שומע את המילים: "כל הכבוד".' },
            { icon: '🔍', text: 'אני מסתכל על הטון — האם הוא חם? או שטוח/מוגזם?', emotion: 'sarcasm' },
            { icon: '😏', text: 'אם הטון לא מתאים למילים — ייתכן שזו ציניות.' },
            { icon: '💡', text: 'ציניות = המילים ≠ הכוונה. זה קורה לכולם לפעמים.', isTip: true },
            { icon: '🤔', text: 'אני יכול לשאול: "התכוונת... טוב, כן?"' },
            { icon: '📝', text: 'אחר כך — אני מדבר עם מבוגר שאני סומך עליו.' },
        ],
        outcome: 'ציניות קשה לזהות, אבל אני לומד. אם לא בטוח — עדיף לשאול.',
        practiceTag: 'sarcasm',
    },
    {
        id: 'ss4',
        title: 'כשחבר לא מדבר הרבה',
        situation: 'כשחבר נראה שקט ומסוגר',
        icon: '😶',
        category: 'recess',
        ageGroup: 'young',
        difficulty: 'easy',
        steps: [
            { icon: '👀', text: 'החבר שלי מסתכל למטה ולא מדבר.', emotion: 'shy' },
            { icon: '❓', text: 'אני תוהה — האם הוא כועס? עצוב? או סתם ביישן?' },
            { icon: '💡', text: 'ביישנות ≠ כעס. לפעמים אנשים פשוט לא בנוח.', isTip: true },
            { icon: '🪑', text: 'אני יושב לידו בשקט — לא מכריח שיחה.' },
            { icon: '🙂', text: 'אני יכול לומר: "אין לחץ לדבר. אני כאן."' },
            { icon: '⏳', text: 'לאט לאט הוא עשוי לפתוח.' },
        ],
        outcome: 'נוכחות שקטה יכולה להיות מתנה לאדם ביישן.',
        practiceTag: 'shy',
    },
    {
        id: 'ss5',
        title: 'ויכוח עם אח/אחות בבית',
        situation: 'כשיש ויכוח בבית ועולים רגשות חזקים',
        icon: '🏠',
        category: 'home',
        ageGroup: 'teen',
        difficulty: 'medium',
        steps: [
            { icon: '😠', text: 'אני מרגיש שהרגשות שלי עולים.', emotion: 'intense' },
            { icon: '🛑', text: 'אני עוצר לפני שאני אומר משהו שאחרגר עליו.' },
            { icon: '💡', text: 'כשאני עצבני — הדברים שאני אומר יכולים לפגוע.', isTip: true },
            { icon: '🚶', text: 'אני לוקח 5 דקות מרחב — חדר אחר, אוויר.' },
            { icon: '🧠', text: 'אחרי שאני נרגע, אני חושב: "מה אני רוצה לומר?"' },
            { icon: '🗣️', text: 'אני חוזר ומדבר בשקט: "הרגשתי... כשאתה..."' },
        ],
        outcome: 'ויכוחים הם חלק מחיים. אני יכול לנהל אותם בצורה שמכבדת את כולם.',
    },
    {
        id: 'ss6',
        title: 'כשנכנסים לחדר מלא אנשים',
        situation: 'כשאני נכנס למקום חדש עם הרבה אנשים',
        icon: '🚪',
        category: 'public',
        ageGroup: 'teen',
        difficulty: 'hard',
        steps: [
            { icon: '🚪', text: 'אני נעצר לרגע לפני שנכנסים.' },
            { icon: '👀', text: 'אני סורק את החדר — מה האווירה? שמחה? שקטה? מתוחה?' },
            { icon: '🌡️', text: 'אני מחפש "מזג האוויר" של הקבוצה.', emotion: 'calm' },
            { icon: '💡', text: 'אם האווירה שמחה — זה זמן טוב להיכנס בביטחון.', isTip: true },
            { icon: '👤', text: 'אני מחפש פרצוף מוכר אחד — ומתחיל ממנו.' },
            { icon: '🕐', text: 'אם לא מוצא — זה בסדר לעמוד בצד ולהסתגל קודם.' },
        ],
        outcome: 'כניסה לחדר חדש היא כישרון שאפשר ללמוד. אני לא חייב להיות "מושלם".',
    },
]


// ─────────────────────────────────────────────────────────────────────────────
// PRACTICE SCENARIOS
// Rich text-based scenarios for Practice Mode.
// correctEmotion is hidden from player until they answer.
// ─────────────────────────────────────────────────────────────────────────────

export interface PracticeScenario {
    id: string
    text: string              // The situation description shown to player
    scene: string             // Where it happens (כיתה, הפסקה, בית...)
    correctEmotion: EmotionType
    intensity: number
    explanation: string       // Shown after answering: why this emotion
    difficulty: 'easy' | 'medium' | 'hard'
    tags: string[]
}

export const PRACTICE_SCENARIOS: PracticeScenario[] = [
    // ── Easy ────────────────────────────────────────────────────────────────
    {
        id: 'ps1',
        text: 'חבר שלך רץ אליך בהפסקה, מחייך לרוחב הפנים ושואל: "רוצה לשחק כדורגל?"',
        scene: 'הפסקה',
        correctEmotion: 'approachable',
        intensity: 0.9,
        explanation: 'חיוך רחב + יוזמה חברתית = "אפשר לגשת". האצה לקראתך היא סימן ברור שהוא שמח לראות אותך.',
        difficulty: 'easy',
        tags: ['friendship', 'invitation'],
    },
    {
        id: 'ps2',
        text: 'הציגו בכיתה ניסוי מדעי. הילד ליד הפנה את פניו לחלון ומסתכל החוצה, לא עונה כשמדברים אליו.',
        scene: 'כיתה',
        correctEmotion: 'shy',
        intensity: 0.6,
        explanation: 'הסתכלות הצידה + חוסר תגובה = ביישנות. הוא לא כועס — פשוט לא בנוח במרכז. תן לו זמן.',
        difficulty: 'easy',
        tags: ['classroom', 'introvert'],
    },
    {
        id: 'ps3',
        text: 'אחיך חזר הביתה ישר לחדרו, השליך את הילקוט על הרצפה וסגר את הדלת בחוזקה.',
        scene: 'בית',
        correctEmotion: 'intense',
        intensity: 0.85,
        explanation: 'שלושה סימנים של עוצמה גבוהה בבת אחת: מהירות, השלכה, דלת חזקה. עדיף לחכות לפני שמדברים.',
        difficulty: 'easy',
        tags: ['home', 'anger'],
    },
    {
        id: 'ps4',
        text: 'המורה מסבירה את השיעור. קולה שווה ורגוע, היא עונה על שאלות בצורה ישירה ובלי פרשנויות.',
        scene: 'כיתה',
        correctEmotion: 'calm',
        intensity: 0.35,
        explanation: 'קצב דיבור סדיר + ניסוח ישיר + עקביות = רגוע ונייטרלי. זמן טוב לשאול שאלות.',
        difficulty: 'easy',
        tags: ['classroom', 'teacher'],
    },
    // ── Medium ──────────────────────────────────────────────────────────────
    {
        id: 'ps5',
        text: 'הגשת עבודה למורה. היא קראה אותה, הסתכלה עליך ואמרה: "מעניין מאוד... לא חשבתי שתגיע לתוצאה כזו."',
        scene: 'כיתה',
        correctEmotion: 'sarcasm',
        intensity: 0.7,
        explanation: '"לא חשבתי שתגיע לתוצאה כזו" יכול להיות מחמאה — אבל "מעניין מאוד" + ההסתכלות מגלים שמשהו לא תואם. זו ציניות.',
        difficulty: 'medium',
        tags: ['sarcasm', 'classroom', 'teacher'],
    },
    {
        id: 'ps6',
        text: 'חברה שלך ניגשת אליך, מחייכת, אבל כל פעם שאתה מנסה לדבר היא שולחת הודעות בטלפון.',
        scene: 'הפסקה',
        correctEmotion: 'caution',
        intensity: 0.55,
        explanation: 'חיוך = "אפשר לגשת" — אבל הטלפון = "לא ממש כאן". אותות סותרים = שים לב, אולי לא הזמן הכי טוב.',
        difficulty: 'medium',
        tags: ['distraction', 'mixed-signals'],
    },
    {
        id: 'ps7',
        text: 'הוצעו לקבוצה שלך אתגרים. חבר אחד אמר בשקט: "אני... לא יודע אם אני יכול לעזור." ומנע מגע עין.',
        scene: 'פעילות קבוצתית',
        correctEmotion: 'shy',
        intensity: 0.65,
        explanation: 'ניסוח לא בטוח + קול שקט + הימנעות ממגע עין = ביישנות. הוא רוצה לעזור אבל לא בטוח בעצמו.',
        difficulty: 'medium',
        tags: ['group', 'self-doubt'],
    },
    {
        id: 'ps8',
        text: 'כשניסית להצטרף למשחק, ילד אחד אמר: "ברור שאתה יכול לשחק..." ואז הסתובב לחברים שלו ועשה פרצוף.',
        scene: 'הפסקה',
        correctEmotion: 'sarcasm',
        intensity: 0.75,
        explanation: '"ברור" + הפרצוף לחברים = הוא לא מתכוון. זוהי ציניות ברורה. מה שנאמר בפנים ≠ מה שנאמר מאחורה.',
        difficulty: 'medium',
        tags: ['exclusion', 'sarcasm'],
    },
    // ── Hard ────────────────────────────────────────────────────────────────
    {
        id: 'ps9',
        text: 'אחרי שניצחתם במשחק, חבר אמר: "כן, כן, בגללך ניצחנו..." בצורה שטוחה, ללא ניואנסים. ואז יצא.',
        scene: 'אחרי משחק',
        correctEmotion: 'intense',
        intensity: 0.8,
        explanation: '"בגללך ניצחנו" נשמע טוב — אבל הטון השטוח + היציאה המיידית מרמזים שהוא בכלל לא שמח. כאב מוסווה.',
        difficulty: 'hard',
        tags: ['competition', 'hidden-emotion'],
    },
    {
        id: 'ps10',
        text: 'מורה ביקשה שקט. כשהכיתה נרגעה, אמרה: "אפשר להמשיך? כולם הסכימו שיש לנו כיתה נפלאה." ועיניה היו צרות.',
        scene: 'כיתה',
        correctEmotion: 'sarcasm',
        intensity: 0.8,
        explanation: 'המילים חיוביות אבל עיניים צרות + ביקשה שקט לפני = הציון לא תואם. "כיתה נפלאה" = "אתם לא נפלאים עכשיו".',
        difficulty: 'hard',
        tags: ['classroom', 'teacher', 'sarcasm'],
    },
    {
        id: 'ps11',
        text: 'ילד חדש בכיתה. כשקיבלתם קבוצות, הוא נשאר לבד ואמר: "לא נורא, אני רגיל." ונשא עיניים רק לרגע.',
        scene: 'כיתה',
        correctEmotion: 'shy',
        intensity: 0.7,
        explanation: '"אני רגיל" = מנסה לא להיראות כואב. המבט הקצר גילה מה המילים הסתירו. הוא צריך שמישהו יגיע אליו.',
        difficulty: 'hard',
        tags: ['loneliness', 'new-student'],
    },
    {
        id: 'ps12',
        text: 'שאלת חבר אם הוא יכול לבוא לבית שלך. הוא השיב: "בטח! כן, בטח..." ואז חיפש בטלפון ואמר שיבדוק.',
        scene: 'הפסקה',
        correctEmotion: 'caution',
        intensity: 0.6,
        explanation: '"בטח" כפול + בדיקה בטלפון = לא בטוח שהוא מתלהב. עדיף לא להניח שזה יקרה — חכה לאישור ברור.',
        difficulty: 'hard',
        tags: ['invitation', 'ambiguous'],
    },
]

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCRIPTS
// What to SAY / NOT SAY / DO when you detect each emotion.
// Shows up in CueCards and after correct identification in Practice Mode.
// ─────────────────────────────────────────────────────────────────────────────

export interface ResponseScript {
    doSay: string[]      // Suggested phrases
    dontSay: string[]    // What NOT to say
    doAction: string[]   // Non-verbal actions
    tip: string          // One key insight
}

export const RESPONSE_SCRIPTS: Record<EmotionType, ResponseScript> = {
    approachable: {
        doSay:    ['"היי! מה קורה?"', '"רוצה לשחק?"', '"שמחתי לראות אותך"'],
        dontSay:  ['"אתה בסדר?"', '"למה אתה כל כך שמח?"'],
        doAction: ['חייך בחזרה', 'עשה קשר עין', 'ניגש/ת אליו/ה'],
        tip: 'זה הרגע הכי טוב לגשת ולהתחיל שיחה!',
    },
    calm: {
        doSay:    ['"אפשר לשאול אותך משהו?"', '"יש דקה?"', '"מה דעתך על..."'],
        dontSay:  ['"למה אתה כל כך שקט?"', '"אתה משעמם אותי"'],
        doAction: ['שמור על קצב שיחה שקט', 'אל תנסה להנפיש אותו/אותה'],
        tip: 'רגוע = זמן טוב לשיחה עמוקה יותר.',
    },
    caution: {
        doSay:    ['"הכל בסדר?"', '"נוח לך לדבר עכשיו?"'],
        dontSay:  ['"למה אתה מוזר?"', '"אתה בטח כועס עליי"'],
        doAction: ['תן לו/לה מרחב', 'אל תלחץ לתשובה מיידית', 'המתן'],
        tip: 'כשיש אותות מעורבים — שאל במקום להניח.',
    },
    intense: {
        doSay:    ['"אני רואה שאתה מרגיש חזק"', '"בוא נדבר אחרי שרגעת"', '"אני כאן"'],
        dontSay:  ['"תירגע!"', '"זה לא כזה גדול"', '"אל תהיה בייבי"'],
        doAction: ['תרחיק עצמך קצת', 'אל תתמודד עם הנושא עכשיו', 'חכה'],
        tip: 'האדם לא מוכן לשמוע עכשיו. עדיף לחכות.',
    },
    sarcasm: {
        doSay:    ['"התכוונת שאני...?"', '"זה היה ציני?"', '"לא בטוח הבנתי"'],
        dontSay:  ['"כן, תודה!"', '"ממש כן!"'],
        doAction: ['עקוב אחרי הטון, לא המילים', 'חפש אישור מפורש', 'אל תגיב כאילו זה ישיר'],
        tip: 'אם הטון לא מתאים למילים — בקש הבהרה. זה לא חולשה.',
    },
    shy: {
        doSay:    ['"אין לחץ"', '"קח את הזמן שלך"', '"אני כאן אם תרצה"'],
        dontSay:  ['"למה אתה כל כך שקט?"', '"דבר כבר!"', '"מה הבעיה שלך?"'],
        doAction: ['אל תסתכל עליו/עליה יותר מדי', 'שבו יחד בשקט', 'גש/י לאט'],
        tip: 'ביישנות היא לא בעיה. תן מרחב, והוא/היא יגיעו אליך.',
    },
}

