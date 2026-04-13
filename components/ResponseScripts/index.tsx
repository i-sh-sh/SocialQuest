'use client'
/**
 * components/ResponseScripts/index.tsx
 * Collapsible panel showing "What to say / do" for a detected emotion.
 * Used in CueCards (live view) and Practice Mode (after answer reveal).
 */

import { useState } from 'react'
import type { EmotionType } from '@/lib/types'
import { EMOTION_COLORS, EMOTIONS, RESPONSE_SCRIPTS } from '@/lib/constants'

export function ResponseScripts({ emotion, defaultOpen = false }: { emotion: EmotionType; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen)
    const colors = EMOTION_COLORS[emotion]
    const def = EMOTIONS[emotion]
    const script = RESPONSE_SCRIPTS[emotion]

    return (
        <div className="w-full rounded-2xl border overflow-hidden" style={{ borderColor: colors.primary + '30' }}>
            <button
                id={`response-toggle-${emotion}`}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-all active:scale-[0.99]"
                style={{ backgroundColor: colors.light }}
                onClick={() => setOpen(v => !v)}
            >
                <span className="flex items-center gap-2">
                    <span>{def.icon}</span>
                    <span style={{ color: colors.dark }}>מה לומר / לעשות?</span>
                </span>
                <span className="text-base transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'none', color: colors.dark }}>
                    ▾
                </span>
            </button>

            {open && (
                <div className="bg-white divide-y divide-border">
                    {/* Do say */}
                    <div className="px-4 py-3 flex flex-col gap-1.5">
                        <p className="text-[10px] font-extrabold text-approachable uppercase tracking-wide">✓ מה להגיד</p>
                        {script.doSay.map((s, i) => (
                            <p key={i} className="text-sm text-text-primary bg-approachable/5 rounded-xl px-3 py-1.5 border border-approachable/20">
                                {s}
                            </p>
                        ))}
                    </div>

                    {/* Don't say */}
                    <div className="px-4 py-3 flex flex-col gap-1.5">
                        <p className="text-[10px] font-extrabold text-intense uppercase tracking-wide">✗ מה לא להגיד</p>
                        {script.dontSay.map((s, i) => (
                            <p key={i} className="text-sm text-text-secondary bg-intense/5 rounded-xl px-3 py-1.5 border border-intense/20 line-through decoration-intense/40">
                                {s}
                            </p>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="px-4 py-3 flex flex-col gap-1.5">
                        <p className="text-[10px] font-extrabold text-calm uppercase tracking-wide">→ מה לעשות</p>
                        {script.doAction.map((s, i) => (
                            <p key={i} className="text-sm text-text-secondary flex items-start gap-2">
                                <span className="text-calm mt-0.5">•</span> {s}
                            </p>
                        ))}
                    </div>

                    {/* Tip */}
                    <div className="px-4 py-3 flex items-start gap-2" style={{ backgroundColor: colors.light + '80' }}>
                        <span className="text-base flex-shrink-0">💡</span>
                        <p className="text-xs font-semibold leading-snug" style={{ color: colors.dark }}>
                            {script.tip}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
