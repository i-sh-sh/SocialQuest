import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import { AchievementToast } from '@/components/AchievementToast'

export const metadata: Metadata = {
    title: 'SocialLens — GPS חברתי',
    description: 'מערכת עזר ויזואלית להנגשת סיטואציות חברתיות בזמן אמת',
    manifest: '/manifest.json',
    appleWebApp: { capable: true, statusBarStyle: 'default', title: 'SocialLens' },
}
export const viewport: Viewport = {
    width: 'device-width', initialScale: 1, maximumScale: 1,
    userScalable: false, themeColor: '#1CB0F6',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="he" dir="rtl">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            </head>
            <body>
                <AppProvider>
                    <AchievementToast />
                    <div className="min-h-dvh flex flex-col">{children}</div>
                </AppProvider>
            </body>
        </html>
    )
}
