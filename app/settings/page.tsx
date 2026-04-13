'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { NAV_ITEMS } from '@/lib/constants'
import type { UserProfile } from '@/lib/types'

const AVATARS = ['🧒', '👦', '👧', '🧑', '👨', '👩', '🎓', '🩺', '👨‍👩‍👧', '🦊', '🐻', '🐼', '🌟', '🦋', '🚀']
const ROLES: { value: UserProfile['role']; label: string; icon: string; desc: string }[] = [
    { value: 'child',     label: 'ילד/ה',   icon: '🧒', desc: 'משתמש שלומד לזהות רגשות' },
    { value: 'therapist', label: 'מטפל/ת',  icon: '🩺', desc: 'מטפל שעוקב אחר ההתקדמות' },
    { value: 'parent',    label: 'הורה',    icon: '👨‍👩‍👧', desc: 'הורה שעוקב ותומך' },
]

export default function SettingsPage() {
    const { activeProfile, store, createProfile, switchProfile } = useApp()
    const { state, setViewMode } = store
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newName, setNewName] = useState('')
    const [newRole, setNewRole] = useState<UserProfile['role']>('child')
    const [newAvatar, setNewAvatar] = useState('🧒')

    const handleCreateProfile = useCallback(() => {
        if (!newName.trim()) return
        const profile = createProfile(newName.trim(), newRole, newAvatar)
        switchProfile(profile.id)
        setShowCreateForm(false)
        setNewName('')
        setNewRole('child')
        setNewAvatar('🧒')
    }, [newName, newRole, newAvatar, createProfile, switchProfile])

    const isSupervisor = state.viewMode === 'supervisor'

    if (!state.isLoaded) return (
        <div className="flex items-center justify-center min-h-dvh">
            <div className="text-text-muted text-sm animate-pulse">טוען...</div>
        </div>
    )

    return (
        <div className="flex flex-col min-h-dvh max-w-md mx-auto">
            <header className="glass sticky top-0 z-30 border-b border-border px-5 py-3 flex items-center gap-3">
                <Link href="/" id="btn-back" className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-2 border border-border active:scale-95 transition-all">←</Link>
                <div className="flex-1">
                    <h1 className="text-base font-extrabold text-text-primary">הגדרות</h1>
                    <p className="text-xs text-text-muted">ניהול פרופילים ומצב תצוגה</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5 page-enter">

                {/* View Mode Toggle */}
                <div className="bg-white rounded-3xl border border-border p-5 shadow-card flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">👁️</span>
                        <h3 className="font-extrabold text-text-primary">מצב תצוגה</h3>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                        מצב ילד מציג את המסך הרגיל לזיהוי רגשות.
                        מצב מטפל/הורה מציג דשבורד עם נתונים ואפשרות לנהל את הרמה.
                    </p>
                    <div className="flex gap-2">
                        <button
                            id="btn-child-mode"
                            className={`flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition-all active:scale-95 flex flex-col items-center gap-1 ${!isSupervisor ? 'border-calm bg-calm/10 text-calm' : 'border-border text-text-muted'}`}
                            onClick={() => setViewMode('child')}
                        >
                            <span className="text-2xl">🧒</span>
                            מצב ילד
                        </button>
                        <button
                            id="btn-supervisor-mode"
                            className={`flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition-all active:scale-95 flex flex-col items-center gap-1 ${isSupervisor ? 'border-intense bg-intense/10 text-intense' : 'border-border text-text-muted'}`}
                            onClick={() => setViewMode('supervisor')}
                        >
                            <span className="text-2xl">🩺</span>
                            מצב מטפל
                        </button>
                    </div>
                </div>

                {/* Profile list */}
                <div className="bg-white rounded-3xl border border-border p-5 shadow-card flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">👤</span>
                            <h3 className="font-extrabold text-text-primary">פרופילים</h3>
                        </div>
                        <button
                            id="btn-add-profile"
                            className="text-xs font-bold text-calm bg-calm/10 px-3 py-1.5 rounded-full active:scale-95 transition-all"
                            onClick={() => setShowCreateForm(v => !v)}
                        >
                            {showCreateForm ? '✕ ביטול' : '+ הוסף פרופיל'}
                        </button>
                    </div>

                    {/* Existing profiles */}
                    <div className="flex flex-col gap-2">
                        {state.profiles.map(profile => {
                            const isActive = profile.id === state.activeProfileId
                            const roleLabel = profile.role === 'child' ? 'ילד/ה' : profile.role === 'therapist' ? 'מטפל/ת' : 'הורה'
                            const xp = state.xpMap[profile.id]
                            return (
                                <button
                                    key={profile.id}
                                    id={`profile-${profile.id}`}
                                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all active:scale-95 w-full text-right ${isActive ? 'border-calm bg-calm/5' : 'border-border hover:border-calm/30'}`}
                                    onClick={() => !isActive && switchProfile(profile.id)}
                                >
                                    <span className="text-2xl">{profile.avatarIcon ?? '👤'}</span>
                                    <div className="flex-1">
                                        <p className="font-bold text-text-primary text-sm">{profile.name}</p>
                                        <p className="text-xs text-text-muted">{roleLabel}</p>
                                    </div>
                                    {xp && <p className="text-xs font-semibold text-text-secondary">⭐ {xp.totalXP}</p>}
                                    {isActive && <span className="text-xs font-extrabold text-calm bg-calm/15 px-2 py-0.5 rounded-full">פעיל</span>}
                                </button>
                            )
                        })}
                    </div>

                    {/* Create profile form */}
                    {showCreateForm && (
                        <div className="flex flex-col gap-3 pt-2 border-t border-border">
                            <p className="text-xs font-semibold text-text-muted">פרופיל חדש</p>

                            {/* Name */}
                            <input
                                id="new-profile-name"
                                type="text"
                                placeholder="שם הפרופיל"
                                className="w-full rounded-xl border border-border bg-surface p-3 text-sm focus:outline-none focus:border-calm"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                            />

                            {/* Role */}
                            <div className="flex flex-col gap-1.5">
                                <p className="text-xs text-text-muted">תפקיד</p>
                                <div className="flex gap-2">
                                    {ROLES.map(r => (
                                        <button key={r.value} id={`role-${r.value}`}
                                            className={`flex-1 py-2 rounded-xl border-2 text-xs font-bold transition-all active:scale-95 ${newRole === r.value ? 'border-calm bg-calm/10 text-calm' : 'border-border text-text-muted'}`}
                                            onClick={() => setNewRole(r.value)}>
                                            <span className="block text-lg mb-0.5">{r.icon}</span>
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Avatar */}
                            <div className="flex flex-col gap-1.5">
                                <p className="text-xs text-text-muted">אווטאר</p>
                                <div className="flex flex-wrap gap-2">
                                    {AVATARS.map(av => (
                                        <button key={av}
                                            className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all active:scale-95 ${newAvatar === av ? 'bg-calm/20 ring-2 ring-calm' : 'bg-surface-2'}`}
                                            onClick={() => setNewAvatar(av)}>
                                            {av}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                id="btn-create-profile"
                                className={`w-full py-3 rounded-xl text-sm font-extrabold transition-all active:scale-95 ${newName.trim() ? 'bg-calm text-white' : 'bg-surface-2 text-text-muted cursor-not-allowed'}`}
                                onClick={handleCreateProfile}
                                disabled={!newName.trim()}
                            >
                                ✓ צור פרופיל
                            </button>
                        </div>
                    )}
                </div>

                {/* Privacy */}
                <div className="flex items-start gap-3 bg-calm-light rounded-2xl p-4 border border-calm/30">
                    <span className="text-xl">🔒</span>
                    <div>
                        <p className="text-sm font-bold text-calm-dark">Privacy by Design</p>
                        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">כל הנתונים שמורים רק על המכשיר שלך. אין שרת, אין ענן, אין שיתוף.</p>
                    </div>
                </div>
            </main>

            <nav className="glass border-t border-border px-6 py-3 flex items-center justify-around">
                {NAV_ITEMS.map(item => (
                    item.href ? (
                        <Link key={item.id} id={item.id} href={item.href}
                            className={`flex flex-col items-center gap-1 ${item.href === '/settings' ? 'text-calm' : 'text-text-muted'}`}>
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </Link>
                    ) : (
                        <button key={item.id} id={item.id}
                            className="flex flex-col items-center gap-1 text-text-muted">
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </button>
                    )
                ))}
            </nav>
        </div>
    )
}
