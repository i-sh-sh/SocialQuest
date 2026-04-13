'use client'
/**
 * hooks/useEmotionEngine.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages the live emotion engine — live demo sequence + transition animations.
 * Consumed by the context provider; pages just read values from context.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { EmotionType } from '@/lib/types'
import { LIVE_SEQUENCE } from '@/lib/constants'
import { buildEmotionSignal } from '@/lib/engine'
import type { EmotionSignal } from '@/lib/types'

interface UseEmotionEngineOptions {
    initialEmotion?: EmotionType
    initialIntensity?: number
    onEmotionChange?: (emotion: EmotionType, intensity: number) => void
}

export function useEmotionEngine({
    initialEmotion = 'calm',
    initialIntensity = 0.5,
    onEmotionChange,
}: UseEmotionEngineOptions = {}) {
    const [emotion, setEmotionState] = useState<EmotionType>(initialEmotion)
    const [intensity, setIntensityState] = useState(initialIntensity)
    const [isLive, setIsLive] = useState(false)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [displaySignal, setDisplaySignal] = useState<EmotionSignal | null>(null)
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

    // ── Transition animation ─────────────────────────────────────────────────

    useEffect(() => {
        setIsTransitioning(true)
        const t = setTimeout(() => {
            setDisplaySignal(buildEmotionSignal(emotion, intensity))
            setIsTransitioning(false)
        }, 200)
        return () => clearTimeout(t)
    }, [emotion, intensity])

    // ── Live demo sequence ───────────────────────────────────────────────────

    useEffect(() => {
        // Clear existing timers
        timersRef.current.forEach(clearTimeout)
        timersRef.current = []

        if (!isLive) return

        timersRef.current = LIVE_SEQUENCE.map(step =>
            setTimeout(() => {
                setEmotionState(step.emotion)
                setIntensityState(step.intensity)
                onEmotionChange?.(step.emotion, step.intensity)
            }, step.delayMs),
        )

        return () => {
            timersRef.current.forEach(clearTimeout)
            timersRef.current = []
        }
    }, [isLive, onEmotionChange])

    // ── Public API ───────────────────────────────────────────────────────────

    const setEmotion = useCallback((e: EmotionType, i: number) => {
        setEmotionState(e)
        setIntensityState(i)
        setIsLive(false)
        onEmotionChange?.(e, i)
    }, [onEmotionChange])

    const toggleLive = useCallback(() => {
        setIsLive(prev => !prev)
    }, [])

    const stopLive = useCallback(() => setIsLive(false), [])

    return {
        emotion,
        intensity,
        isLive,
        isTransitioning,
        displaySignal,
        setEmotion,
        toggleLive,
        stopLive,
    }
}
