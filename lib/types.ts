// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type EmotionType = 'approachable' | 'caution' | 'intense' | 'calm' | 'sarcasm' | 'shy'
export type MoodWeatherType = 'sunny' | 'cloudy' | 'stormy' | 'partly-cloudy'
export type CueType = 'tone' | 'facial' | 'gesture' | 'words'
export type UserRole = 'child' | 'therapist' | 'parent'
export type FadingStageId = 'beginner' | 'learning' | 'advancing' | 'skilled' | 'independent'

// ─────────────────────────────────────────────────────────────────────────────
// EMOTION & SIGNAL
// ─────────────────────────────────────────────────────────────────────────────

export interface EmotionSignal {
    emotion: EmotionType
    intensity: number          // 0–1
    label: string
    sublabel: string
    icon: string
    timestamp: Date
}

export interface SocialCue {
    id: string
    type: CueType
    emotion: EmotionType
    description: string
    example?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// FADING (SCAFFOLDING / INDEPENDENCE)
// ─────────────────────────────────────────────────────────────────────────────

export interface FadingState {
    level: number              // 0–1  (0 = full support, 1 = fully independent)
    streak: number             // correct identifications in a row
    lastUpdated: Date
}

export interface FadingStage {
    id: FadingStageId
    label: string
    description: string
    icon: string
    color: string
    range: [number, number]    // [min, max) of fading level
}

// ─────────────────────────────────────────────────────────────────────────────
// LOG
// ─────────────────────────────────────────────────────────────────────────────

export type SocialScene = 'classroom' | 'recess' | 'home' | 'public' | 'therapy' | 'other'

export interface LogEntry {
    id: string
    date: Date
    emotion: EmotionType
    intensity: number          // 0–1
    context: string
    scene?: SocialScene        // social context tag
    cues: SocialCue[]
    fadingLevel: number        // snapshot of fading at time of log
    notes?: string
    profileId: string          // which user made this entry
    xpEarned?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// USER PROFILES
// ─────────────────────────────────────────────────────────────────────────────

export interface UserProfile {
    id: string
    role: UserRole
    name: string
    avatarIcon?: string        // emoji
    createdAt: Date
    /** IDs of profiles this user manages (therapist → child, parent → child) */
    managedProfileIds?: string[]
    /** For child: link to their therapist/parent */
    supervisorProfileId?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// ACHIEVEMENTS & XP
// ─────────────────────────────────────────────────────────────────────────────

export type AchievementCategory =
    | 'streak'          // reading emotions in a row
    | 'accuracy'        // % correct detections
    | 'exploration'     // trying all emotion types
    | 'independence'    // reaching a fading milestone
    | 'social'          // real-life interactions logged
    | 'milestone'       // general milestone (first entry, 7 days, etc.)

export interface Achievement {
    id: string
    category: AchievementCategory
    title: string
    description: string
    icon: string
    xpReward: number
    /** Condition check — evaluated against SessionStats */
    condition: (stats: SessionStats) => boolean
    /** Once unlocked, stored in UserXP.unlockedIds */
    unlockedAt?: Date
}

export interface UserXP {
    profileId: string
    totalXP: number
    level: number              // derived: Math.floor(totalXP / XP_PER_LEVEL)
    unlockedAchievementIds: string[]
    /** Rolling history for level-up animations */
    recentXPGains: { amount: number; reason: string; timestamp: Date }[]
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSION
// A "session" = one live/demo interaction period
// ─────────────────────────────────────────────────────────────────────────────

export interface Session {
    id: string
    profileId: string
    startedAt: Date
    endedAt?: Date
    emotionsRead: { emotion: EmotionType; correct: boolean }[]
    xpEarned: number
}

// ─────────────────────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────────────────────

export interface SessionStats {
    totalEntries: number
    streak: number
    fadingLevel: number
    unlockedAchievementIds: string[]
    dominantEmotion: EmotionType | null
    totalXP: number
    level: number
}

export interface DayStats {
    date: Date
    entries: LogEntry[]
    dominant: EmotionType | null
    avgFadingLevel: number
    totalXP: number
}

export interface WeekStats {
    days: DayStats[]
    totalEntries: number
    avgFadingLevel: number
    dominantEmotion: EmotionType | null
    totalXP: number
    newAchievements: Achievement[]
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL APP STATE (used by context/hooks)
// ─────────────────────────────────────────────────────────────────────────────

export interface AppState {
    activeProfileId: string | null
    profiles: UserProfile[]
    currentEmotion: EmotionType
    currentIntensity: number
    isLive: boolean
    fadingState: FadingState
    logEntries: LogEntry[]
    xpMap: Record<string, UserXP>     // profileId → UserXP
    sessions: Session[]
    isLoaded: boolean                  // localStorage hydration complete
    viewMode: 'child' | 'supervisor'   // role-based UI mode
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPE GUARDS
// ─────────────────────────────────────────────────────────────────────────────

export function isEmotionType(v: unknown): v is EmotionType {
    return v === 'approachable' || v === 'caution' || v === 'intense' || v === 'calm'
}

export function isUserRole(v: unknown): v is UserRole {
    return v === 'child' || v === 'therapist' || v === 'parent'
}

export function isLogEntry(v: unknown): v is LogEntry {
    if (!v || typeof v !== 'object') return false
    const e = v as Record<string, unknown>
    return (
        typeof e.id === 'string' &&
        typeof e.emotion === 'string' &&
        isEmotionType(e.emotion) &&
        typeof e.intensity === 'number' &&
        typeof e.context === 'string' &&
        typeof e.fadingLevel === 'number' &&
        typeof e.profileId === 'string'
    )
}

export function isUserProfile(v: unknown): v is UserProfile {
    if (!v || typeof v !== 'object') return false
    const p = v as Record<string, unknown>
    return (
        typeof p.id === 'string' &&
        typeof p.name === 'string' &&
        isUserRole(p.role)
    )
}
