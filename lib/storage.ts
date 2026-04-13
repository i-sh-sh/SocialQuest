/**
 * lib/storage.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * LocalStorage persistence layer — multi-profile, type-safe, versioned.
 *
 * DESIGN: Each key is namespaced with a version prefix so future schema
 * changes can be handled gracefully (just bump STORAGE_VERSION).
 * Replace this module with an API/Supabase adapter later without touching hooks.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { LogEntry, UserProfile, FadingState, UserXP, Session } from './types'
import { isLogEntry, isUserProfile } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_VERSION = 'v1'

const KEYS = {
    profiles:     `${STORAGE_VERSION}:profiles`,
    activeProfile:`${STORAGE_VERSION}:activeProfileId`,
    logEntries:   (profileId: string) => `${STORAGE_VERSION}:log:${profileId}`,
    fading:       (profileId: string) => `${STORAGE_VERSION}:fading:${profileId}`,
    xp:           (profileId: string) => `${STORAGE_VERSION}:xp:${profileId}`,
    sessions:     (profileId: string) => `${STORAGE_VERSION}:sessions:${profileId}`,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// SAFE JSON HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function safeGet<T>(key: string): T | null {
    if (typeof window === 'undefined') return null
    try {
        const raw = localStorage.getItem(key)
        if (!raw) return null
        return JSON.parse(raw) as T
    } catch {
        return null
    }
}

function safeSet(key: string, value: unknown): void {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
        console.warn('[storage] Failed to write:', key, e)
    }
}

function safeRemove(key: string): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
}

// ─────────────────────────────────────────────────────────────────────────────
// DATE REVIVAL — JSON.parse loses Date objects, we revive them
// ─────────────────────────────────────────────────────────────────────────────

function reviveDate<T>(obj: T): T {
    if (!obj || typeof obj !== 'object') return obj
    if (Array.isArray(obj)) return obj.map(reviveDate) as unknown as T
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
            result[k] = new Date(v)
        } else if (typeof v === 'object' && v !== null) {
            result[k] = reviveDate(v)
        } else {
            result[k] = v
        }
    }
    return result as T
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILES
// ─────────────────────────────────────────────────────────────────────────────

export function getProfiles(): UserProfile[] {
    const raw = safeGet<UserProfile[]>(KEYS.profiles)
    if (!raw || !Array.isArray(raw)) return []
    return reviveDate(raw).filter(isUserProfile)
}

export function saveProfiles(profiles: UserProfile[]): void {
    safeSet(KEYS.profiles, profiles)
}

export function upsertProfile(profile: UserProfile): void {
    const profiles = getProfiles()
    const idx = profiles.findIndex(p => p.id === profile.id)
    if (idx >= 0) profiles[idx] = profile
    else profiles.push(profile)
    saveProfiles(profiles)
}

export function deleteProfile(profileId: string): void {
    const profiles = getProfiles().filter(p => p.id !== profileId)
    saveProfiles(profiles)
    // Clean up related keys
    safeRemove(KEYS.logEntries(profileId))
    safeRemove(KEYS.fading(profileId))
    safeRemove(KEYS.xp(profileId))
    safeRemove(KEYS.sessions(profileId))
    if (getActiveProfileId() === profileId) {
        safeRemove(KEYS.activeProfile)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE PROFILE
// ─────────────────────────────────────────────────────────────────────────────

export function getActiveProfileId(): string | null {
    return safeGet<string>(KEYS.activeProfile)
}

export function setActiveProfileId(profileId: string): void {
    safeSet(KEYS.activeProfile, profileId)
}

// ─────────────────────────────────────────────────────────────────────────────
// LOG ENTRIES
// ─────────────────────────────────────────────────────────────────────────────

export function getLogEntries(profileId: string): LogEntry[] {
    const raw = safeGet<LogEntry[]>(KEYS.logEntries(profileId))
    if (!raw || !Array.isArray(raw)) return []
    return reviveDate(raw).filter(isLogEntry)
}

export function saveLogEntries(profileId: string, entries: LogEntry[]): void {
    safeSet(KEYS.logEntries(profileId), entries)
}

export function addLogEntry(profileId: string, entry: LogEntry): void {
    const entries = getLogEntries(profileId)
    entries.push(entry)
    saveLogEntries(profileId, entries)
}

export function deleteLogEntry(profileId: string, entryId: string): void {
    const entries = getLogEntries(profileId).filter(e => e.id !== entryId)
    saveLogEntries(profileId, entries)
}

// ─────────────────────────────────────────────────────────────────────────────
// FADING STATE
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_FADING: FadingState = { level: 0, streak: 0, lastUpdated: new Date() }

export function getFadingState(profileId: string): FadingState {
    const raw = safeGet<FadingState>(KEYS.fading(profileId))
    if (!raw) return { ...DEFAULT_FADING, lastUpdated: new Date() }
    return reviveDate(raw)
}

export function saveFadingState(profileId: string, state: FadingState): void {
    safeSet(KEYS.fading(profileId), state)
}

// ─────────────────────────────────────────────────────────────────────────────
// XP
// ─────────────────────────────────────────────────────────────────────────────

export function getUserXP(profileId: string): UserXP | null {
    const raw = safeGet<UserXP>(KEYS.xp(profileId))
    if (!raw) return null
    return reviveDate(raw)
}

export function saveUserXP(profileId: string, xp: UserXP): void {
    safeSet(KEYS.xp(profileId), xp)
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSIONS
// ─────────────────────────────────────────────────────────────────────────────

export function getSessions(profileId: string): Session[] {
    const raw = safeGet<Session[]>(KEYS.sessions(profileId))
    if (!raw || !Array.isArray(raw)) return []
    return reviveDate(raw)
}

export function saveSessions(profileId: string, sessions: Session[]): void {
    safeSet(KEYS.sessions(profileId), sessions)
}

export function addSession(profileId: string, session: Session): void {
    const sessions = getSessions(profileId)
    sessions.push(session)
    saveSessions(profileId, sessions)
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL STATE HYDRATION
// Load everything for a given profile in one shot (used by AppProvider on mount)
// ─────────────────────────────────────────────────────────────────────────────

export interface HydratedProfileData {
    entries: LogEntry[]
    fadingState: FadingState
    xp: UserXP | null
    sessions: Session[]
}

export function hydrateProfile(profileId: string): HydratedProfileData {
    return {
        entries:     getLogEntries(profileId),
        fadingState: getFadingState(profileId),
        xp:          getUserXP(profileId),
        sessions:    getSessions(profileId),
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// NUKE (dev / logout)
// ─────────────────────────────────────────────────────────────────────────────

export function clearAllStorage(): void {
    if (typeof window === 'undefined') return
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k?.startsWith(STORAGE_VERSION + ':')) keysToRemove.push(k)
    }
    keysToRemove.forEach(k => localStorage.removeItem(k))
}
