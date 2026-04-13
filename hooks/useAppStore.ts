'use client'
/**
 * hooks/useAppStore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Central useReducer store — the single source of truth for in-memory state.
 * All mutations go through typed Actions. Side effects (persistence) are
 * handled in the context provider, not here.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useReducer, useCallback } from 'react'
import type { AppState, EmotionType, FadingState, LogEntry, UserProfile, UserXP, Session } from '@/lib/types'
import { createEmptyXP } from '@/lib/engine'

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_FADING: FadingState = { level: 0, streak: 0, lastUpdated: new Date() }

export const INITIAL_STATE: AppState = {
    activeProfileId: null,
    profiles: [],
    currentEmotion: 'calm',
    currentIntensity: 0.5,
    isLive: false,
    fadingState: DEFAULT_FADING,
    logEntries: [],
    xpMap: {},
    sessions: [],
    isLoaded: false,
    viewMode: 'child',
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export type AppAction =
    // Hydration
    | { type: 'HYDRATE'; payload: Partial<AppState> }
    | { type: 'SET_LOADED' }

    // Profile management
    | { type: 'SET_ACTIVE_PROFILE'; profileId: string }
    | { type: 'UPSERT_PROFILE'; profile: UserProfile }
    | { type: 'DELETE_PROFILE'; profileId: string }

    // Emotion / live mode
    | { type: 'SET_EMOTION'; emotion: EmotionType; intensity: number }
    | { type: 'TOGGLE_LIVE' }
    | { type: 'SET_LIVE'; isLive: boolean }

    // Fading
    | { type: 'SET_FADING'; state: FadingState }

    // Log entries
    | { type: 'ADD_LOG_ENTRY'; entry: LogEntry }
    | { type: 'DELETE_LOG_ENTRY'; entryId: string }
    | { type: 'SET_LOG_ENTRIES'; entries: LogEntry[] }

    // XP & achievements
    | { type: 'SET_XP'; profileId: string; xp: UserXP }

    // Sessions
    | { type: 'ADD_SESSION'; session: Session }

    // View mode
    | { type: 'SET_VIEW_MODE'; viewMode: 'child' | 'supervisor' }

// ─────────────────────────────────────────────────────────────────────────────
// REDUCER
// ─────────────────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {

        case 'HYDRATE':
            return { ...state, ...action.payload }

        case 'SET_LOADED':
            return { ...state, isLoaded: true }

        // ── Profiles ─────────────────────────────────────────────────────────

        case 'SET_ACTIVE_PROFILE': {
            const profileXP = state.xpMap[action.profileId] ?? createEmptyXP(action.profileId)
            return {
                ...state,
                activeProfileId: action.profileId,
                xpMap: { ...state.xpMap, [action.profileId]: profileXP },
            }
        }

        case 'UPSERT_PROFILE': {
            const exists = state.profiles.findIndex(p => p.id === action.profile.id)
            const profiles = exists >= 0
                ? state.profiles.map(p => p.id === action.profile.id ? action.profile : p)
                : [...state.profiles, action.profile]
            return { ...state, profiles }
        }

        case 'DELETE_PROFILE': {
            const profiles = state.profiles.filter(p => p.id !== action.profileId)
            const { [action.profileId]: _removed, ...xpMap } = state.xpMap
            return {
                ...state,
                profiles,
                xpMap,
                activeProfileId: state.activeProfileId === action.profileId ? null : state.activeProfileId,
            }
        }

        // ── Emotion ───────────────────────────────────────────────────────────

        case 'SET_EMOTION':
            return { ...state, currentEmotion: action.emotion, currentIntensity: action.intensity }

        case 'TOGGLE_LIVE':
            return { ...state, isLive: !state.isLive }

        case 'SET_LIVE':
            return { ...state, isLive: action.isLive }

        // ── Fading ────────────────────────────────────────────────────────────

        case 'SET_FADING':
            return { ...state, fadingState: action.state }

        // ── Log ───────────────────────────────────────────────────────────────

        case 'ADD_LOG_ENTRY':
            return { ...state, logEntries: [...state.logEntries, action.entry] }

        case 'DELETE_LOG_ENTRY':
            return { ...state, logEntries: state.logEntries.filter(e => e.id !== action.entryId) }

        case 'SET_LOG_ENTRIES':
            return { ...state, logEntries: action.entries }

        // ── XP ────────────────────────────────────────────────────────────────

        case 'SET_XP':
            return { ...state, xpMap: { ...state.xpMap, [action.profileId]: action.xp } }

        // ── Sessions ──────────────────────────────────────────────────────────

        case 'ADD_SESSION':
            return { ...state, sessions: [...state.sessions, action.session] }

        case 'SET_VIEW_MODE':
            return { ...state, viewMode: action.viewMode }

        default:
            return state
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useAppStore() {
    const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

    // Convenience selectors
    const activeProfile = state.profiles.find(p => p.id === state.activeProfileId) ?? null
    const activeXP = state.activeProfileId ? (state.xpMap[state.activeProfileId] ?? null) : null
    const entriesForActiveProfile = state.logEntries.filter(
        e => e.profileId === state.activeProfileId,
    )

    // Typed dispatch wrappers
    const setEmotion = useCallback((emotion: EmotionType, intensity: number) =>
        dispatch({ type: 'SET_EMOTION', emotion, intensity }), [])

    const toggleLive = useCallback(() => dispatch({ type: 'TOGGLE_LIVE' }), [])
    const setLive    = useCallback((isLive: boolean) => dispatch({ type: 'SET_LIVE', isLive }), [])

    const setFading  = useCallback((s: FadingState) => dispatch({ type: 'SET_FADING', state: s }), [])

    const addLogEntry = useCallback((entry: LogEntry) =>
        dispatch({ type: 'ADD_LOG_ENTRY', entry }), [])

    const deleteLogEntry = useCallback((entryId: string) =>
        dispatch({ type: 'DELETE_LOG_ENTRY', entryId }), [])

    const setXP = useCallback((profileId: string, xp: UserXP) =>
        dispatch({ type: 'SET_XP', profileId, xp }), [])

    const upsertProfile = useCallback((profile: UserProfile) =>
        dispatch({ type: 'UPSERT_PROFILE', profile }), [])

    const setActiveProfile = useCallback((profileId: string) =>
        dispatch({ type: 'SET_ACTIVE_PROFILE', profileId }), [])

    const hydrate = useCallback((payload: Partial<AppState>) =>
        dispatch({ type: 'HYDRATE', payload }), [])

    const setLoaded = useCallback(() => dispatch({ type: 'SET_LOADED' }), [])

    const setViewMode = useCallback((viewMode: 'child' | 'supervisor') =>
        dispatch({ type: 'SET_VIEW_MODE', viewMode }), [])

    return {
        state,
        dispatch,
        // Selectors
        activeProfile,
        activeXP,
        entriesForActiveProfile,
        // Actions
        setEmotion,
        toggleLive,
        setLive,
        setFading,
        addLogEntry,
        deleteLogEntry,
        setXP,
        upsertProfile,
        setActiveProfile,
        hydrate,
        setLoaded,
        setViewMode,
    }
}

export type AppStore = ReturnType<typeof useAppStore>
