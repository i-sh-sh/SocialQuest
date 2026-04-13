'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { VisualInterpreter } from '@/components/VisualInterpreter'
import { MoodWeather } from '@/components/MoodWeather'
import { FadingManager } from '@/components/FadingManager'
import { SimulatorPanel } from '@/components/SimulatorPanel'
import { LogEntrySheet } from '@/components/LogEntrySheet'
import { SupervisorDashboard } from '@/components/SupervisorDashboard'
import { emotionToWeather } from '@/lib/engine'
import { NAV_ITEMS } from '@/lib/constants'

export default function HomePage() {
    const {
        emotion, intensity, isLive, isTransitioning,
        setEmotion, toggleLive,
        fadingState, fadingOpacity, nudgeFading,
        activeProfile, activeXP,
        addEntry, recordCorrectDetection,
        store: { state, setViewMode },
    } = useApp()

    const [activeTab, setActiveTab] = useState<'live' | 'settings'>('live')
    const [showLogSheet, setShowLogSheet] = useState(false)

    const handleLogSave = useCallback((context: string, wasCorrect: boolean, scene?: import('@/lib/types').SocialScene) => {
        addEntry(emotion, intensity, context, fadingState.level, undefined, undefined, scene)
        if (wasCorrect) recordCorrectDetection()
    }, [emotion, intensity, fadingState.level, addEntry, recordCorrectDetection])

    if (!state.isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-dvh">
                <div className="text-text-muted text-sm animate-pulse">טוען...</div>
            </div>
        )
    }

    const isSupervisor = state.viewMode === 'supervisor'

    return (
        <div className="flex flex-col min-h-dvh max-w-md mx-auto">
            {/* Header */}
            <header className="glass sticky top-0 z-30 border-b border-border px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🔍</span>
                    <div>
                        <h1 className="text-base font-extrabold text-text-primary leading-tight">SocialLens</h1>
                        <p className="text-xs text-text-muted">
                            {isSupervisor ? '🩺 מצב מטפל' : 'GPS חברתי'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {activeXP && (
                        <Link href="/quests" className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-xs font-bold text-text-secondary">
                            ⭐ {activeXP.totalXP}
                        </Link>
                    )}
                    {!isSupervisor && (
                        <button
                            id="btn-toggle-live"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${isLive ? 'bg-intense text-white' : 'bg-surface-2 text-text-secondary border border-border'}`}
                            onClick={toggleLive}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-text-muted'}`} />
                            {isLive ? 'חי' : 'דמו'}
                        </button>
                    )}
                    <Link
                        href="/settings"
                        id="btn-settings-header"
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-2 border border-border text-base active:scale-95 transition-all"
                        title="הגדרות"
                    >
                        ⚙️
                    </Link>
                    <button
                        id="btn-switch-mode"
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-2 border border-border text-base active:scale-95 transition-all"
                        title={isSupervisor ? 'עבור למצב ילד' : 'עבור למצב מטפל'}
                        onClick={() => setViewMode(isSupervisor ? 'child' : 'supervisor')}
                    >
                        {isSupervisor ? '🧒' : '🩺'}
                    </button>
                </div>
            </header>

            {/* ─── SUPERVISOR MODE ─── */}
            {isSupervisor && (
                <>
                    <main className="flex-1 overflow-y-auto px-5 py-5 page-enter">
                        <SupervisorDashboard
                            childProfile={activeProfile}
                            entries={state.logEntries.filter(e => e.profileId === state.activeProfileId)}
                            fadingState={fadingState}
                            childXP={activeXP}
                            onFadingChange={(level) => nudgeFading(level - fadingState.level)}
                            therapistProfileId={activeProfile?.id}
                        />
                    </main>
                    <nav className="glass border-t border-border px-6 py-3 flex items-center justify-around">
                        {NAV_ITEMS.map(item => item.href ? (
                            <Link key={item.id} id={item.id} href={item.href}
                                className={`flex flex-col items-center gap-1 ${item.href === '/' ? 'text-calm' : 'text-text-muted'}`}>
                                <span className="text-xl">{item.icon}</span>
                                <span className="text-[10px] font-bold">{item.label}</span>
                            </Link>
                        ) : (
                            <button key={item.id} id={item.id} className="flex flex-col items-center gap-1 text-text-muted">
                                <span className="text-xl">{item.icon}</span>
                                <span className="text-[10px] font-bold">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </>
            )}

            {/* ─── CHILD MODE ─── */}
            {!isSupervisor && (
                <>
                    {/* Tabs */}
                    <div className="flex bg-white border-b border-border px-5 gap-1 pt-2">
                        {(['live', 'settings'] as const).map(tab => (
                            <button
                                key={tab} id={`tab-${tab}`}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-t-lg transition-all ${activeTab === tab ? 'text-calm border-b-2 border-calm' : 'text-text-muted'}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab === 'live' ? '👁️ מצב חי' : '⚙️ הגדרות'}
                            </button>
                        ))}
                    </div>

                    <main className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5 page-enter">
                        {activeTab === 'live' && <>
                            <MoodWeather
                                weatherType={emotionToWeather(emotion)}
                                participantCount={3}
                                roomName="הכיתה"
                                fadeOpacity={fadingOpacity}
                            />
                            <div className="bg-white rounded-3xl border border-border p-6 shadow-card flex flex-col items-center gap-2">
                                <VisualInterpreter
                                    currentEmotion={emotion}
                                    intensity={intensity}
                                    fadingState={fadingState}
                                    personName="דניאל"
                                    showCueCards
                                    isTransitioning={isTransitioning}
                                    onCorrect={recordCorrectDetection}
                                />
                            </div>
                            <div className="bg-white rounded-3xl border border-border p-5 shadow-card">
                                <SimulatorPanel
                                    activeEmotion={emotion}
                                    activeIntensity={intensity}
                                    onSelect={setEmotion}
                                />
                            </div>
                        </>}

                        {activeTab === 'settings' && <>
                            <FadingManager
                                fadingState={fadingState}
                                onLevelChange={(level) => nudgeFading(level - fadingState.level)}
                            />
                            {activeProfile && (
                                <div className="bg-white rounded-3xl border border-border p-5 shadow-card flex items-center gap-3">
                                    <span className="text-3xl">{activeProfile.avatarIcon ?? '👤'}</span>
                                    <div>
                                        <p className="font-extrabold text-text-primary">{activeProfile.name}</p>
                                        <p className="text-xs text-text-muted">🧒 ילד/ה</p>
                                    </div>
                                    {activeXP && (
                                        <div className="mr-auto text-right">
                                            <p className="font-extrabold text-text-primary">⭐ {activeXP.totalXP} XP</p>
                                            <p className="text-xs text-text-muted">רמה {activeXP.level + 1}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="flex items-start gap-3 bg-calm-light rounded-2xl p-4 border border-calm/30">
                                <span className="text-xl">🔒</span>
                                <div>
                                    <p className="text-sm font-bold text-calm-dark">Privacy by Design</p>
                                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">כל הנתונים שמורים רק על המכשיר. אין שרת, אין ענן.</p>
                                </div>
                            </div>
                        </>}
                    </main>

                    {/* Log entry FAB + nav */}
                    <div className="relative">
                        {/* Floating "Log Moment" button */}
                        <button
                            id="btn-log-entry"
                            className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-5 py-2.5 rounded-full bg-calm text-white text-sm font-extrabold shadow-lg active:scale-95 transition-all"
                            onClick={() => setShowLogSheet(true)}
                        >
                            📌 רשום רגע
                        </button>
                        <nav className="glass border-t border-border px-6 pt-7 pb-3 flex items-center justify-around">
                            {NAV_ITEMS.map(item => item.href ? (
                                <Link key={item.id} id={item.id} href={item.href}
                                    className={`flex flex-col items-center gap-1 ${item.href === '/' ? 'text-calm' : 'text-text-muted'}`}>
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="text-[10px] font-bold">{item.label}</span>
                                </Link>
                            ) : (
                                <button key={item.id} id={item.id} className="flex flex-col items-center gap-1 text-text-muted">
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="text-[10px] font-bold">{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Log Entry Sheet */}
                    <LogEntrySheet
                        isOpen={showLogSheet}
                        emotion={emotion}
                        intensity={intensity}
                        fadingState={fadingState}
                        onSave={handleLogSave}
                        onClose={() => setShowLogSheet(false)}
                    />
                </>
            )}
        </div>
    )
}
