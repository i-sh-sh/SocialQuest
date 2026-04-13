'use client'
/**
 * hooks/useTTS.ts
 * Text-to-speech hook using the Web Speech API (on-device, no network).
 * Falls back gracefully when API is unavailable.
 */

import { useCallback, useEffect, useState } from 'react'

interface TTSOptions {
    lang?: string
    rate?: number    // 0.5–2.0
    pitch?: number   // 0–2
    volume?: number  // 0–1
}

export function useTTS(defaultOptions: TTSOptions = {}) {
    const [supported, setSupported] = useState(false)
    const [speaking, setSpeaking] = useState(false)

    useEffect(() => {
        setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
    }, [])

    const speak = useCallback((text: string, options: TTSOptions = {}) => {
        if (!supported || typeof window === 'undefined') return
        window.speechSynthesis.cancel()
        const utter = new SpeechSynthesisUtterance(text)
        utter.lang   = options.lang   ?? defaultOptions.lang   ?? 'he-IL'
        utter.rate   = options.rate   ?? defaultOptions.rate   ?? 0.9
        utter.pitch  = options.pitch  ?? defaultOptions.pitch  ?? 1.0
        utter.volume = options.volume ?? defaultOptions.volume ?? 1.0
        utter.onstart = () => setSpeaking(true)
        utter.onend   = () => setSpeaking(false)
        utter.onerror = () => setSpeaking(false)
        window.speechSynthesis.speak(utter)
    }, [supported, defaultOptions])

    const stop = useCallback(() => {
        if (typeof window !== 'undefined') window.speechSynthesis.cancel()
        setSpeaking(false)
    }, [])

    return { speak, stop, speaking, supported }
}
