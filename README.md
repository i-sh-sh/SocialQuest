# SocialLens (SocialQuest) 🔍

A real-world "social GPS" and interactive learning platform designed to help neurodivergent children context-read social situations, process emotions, and build long-term social independence.

Built with **Next.js 14**, **React**, **TailwindCSS**, and **TypeScript**, operating entirely **client-side** (Privacy by Design).

---

## 🌟 Core Philosophy
- **Fading Methodology**: The platform dynamically adjusts its level of support. A user might start with maximum cues ("Therapist level" guidance) and slowly gradient down to 100% independence based on successful real-world interactions.
- **Micro-Learning**: Learning happens in the moment, using quick logs, interactive practice scenes, and bite-sized social stories.
- **Privacy by Design**: All records, logs, user profiles, and session reports are kept only in the user's browser `localStorage`. No cloud data collection.

## 🚀 Features (v1.0.0)

### 1. 👁️ The "Live" View & Visual Interpreter
A simulated AR-like interface providing immediate feedback on social cues.
- Translates emotions into visual aesthetics (e.g., Green for Approachable/Calm, Red for Intense).
- **Cue Cards**: "What to Do" and "What to Say" actionable scripts based on the emotion detected.
- **TTS Support**: Emotion descriptions and labels can be read out loud using Web Speech API.

### 2. 📝 Full-Featured Social Journal (v2)
- **Day View**: Timeline of interactions with contextual tags (Classroom, Home, Recess etc.).
- **Week View**: Automatically aggregates weekly progress, dominant emotions, fading levels, and creates bar charts.
- **Session Report Generator**: Auto-generates a formatted Hebrew report with algorithmic insights (e.g., intensity trend) that can be copied directly and shared with the therapist.

### 3. 🎮 Practice Mode
- An interactive simulator putting the user in realistic scenarios across different difficulty levels.
- Immediate feedback, XP scoring based on accuracy and speed.
- Logs successes to the fading algorithm.

### 4. 📖 Social Stories Reader
- A catalog of scenarios (e.g., "Greeting a stranger", "Losing a game") based on **Carol Gray's** Social Stories methodology.
- Immersive, step-by-step reading flow with emotion tags, icons, and integrated TTS.

### 5. 🎯 Therapy Goals System (Supervisor Mode)
- Parents/Therapists can set specific, IEP-aligned goals (e.g., "Achieve 30% Fading in 2 weeks" or "Log 5 interactions").
- Real-time progress trackers automatically calculate advancement from the child's entries.
- Profile switching between Supervisor (Settings/Goals) and Child (Play/Log).

### 6. 🏆 Gamification & XP
- Real-time experience points, leveling system, and achievement medals ("First Log", "Perfect Week", etc.) to encourage daily usage.

---

## 🛠️ Technology Stack
- **Framework**: Next.js 14.2 (App Router, Static Export).
- **Styling**: Tailwind CSS, Vanilla CSS (`index.css` for animations & glassmorphism).
- **Storage**: Browser `localStorage` (via custom React hooks/context).
- **Icons & Emojis**: Native OS emoji for lightweight asset delivery.

## 📦 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

3. **Build for production**:
   ```bash
   npm run build
   ```
   *Note: This app is configured for static export (`output: 'export'` in `next.config.js`). It creates a self-contained `out` directory.*

## 🔒 Privacy & Data
No backend interaction is required or provided. All profiles, log entries, and usage statistics are strictly resident on the machine where the application runs.

---

<div dir="rtl">

# 🔍 SocialLens — GPS חברתי

> *"כשכולם רואים את אותה המציאות — אנחנו מוסיפים לה צבע"*

---

## החזון

יש ילדים שנולדים לתוך עולם שמדבר שתי שפות במקביל —  
את מה שנאמר, ואת מה שמתכוונים.

רוב האנשים לומדים לפענח את השפה השנייה בלי לשים לב.  
הם קולטים מבט, משמיעים שינוי בטון, קוראים הבעה — ויודעים.

**לילדים עם ASD, השפה השנייה הזו לא מגיעה באופן אוטומטי.**  
לא כי הם פחות חכמים — אלא כי המוח שלהם מקודד את המציאות אחרת.

SocialLens נולדה מתוך שאלה אחת פשוטה:

> **מה אם היינו יכולים לצבוע את הרמזים החברתיים בצבעים גלויים לעין?**

לא להסביר. לא ללמד בכיתה. פשוט — להאיר אותם בזמן אמת,  
בדיוק כמו שGPS מאיר את הדרך הנכונה בלי שתצטרך להבין מפות.

---

## מה זה SocialLens

מערכת ניווט חברתית שרצה על מכשיר קצה (Edge AI) ומנתחת בזמן אמת:

- **הבעות פנים** של האנשים שמולך
- **טון הדיבור** והקצב
- **השפה הגופנית** ועוצמת הרגש

ומתרגמת את כל אלה לשפה אחת פשוטה: **צבע + אייקון + משפט.**

אין אינפורמציה עודפת. אין הצפה. רק מה שצריך לדעת, עכשיו.

---

## שפת הצבעים

| צבע | משמעות | מתי מופיע |
|-----|---------|-----------|
| 🟢 **ירוק** `#58CC02` | אפשר לגשת | האדם פתוח, שמח, מזמין שיחה |
| 🟠 **כתום** `#FFA500` | שים לב | ציניות, סרקזם — המילים לא תמיד ישירות |
| 🔴 **אדום** `#FF4B4B` | עוצמה גבוהה | כעס, מתח, כדאי לחכות |
| 🔵 **כחול** `#1CB0F6` | רגוע ונייטרלי | שיחה ישירה, ללא עומס רגשי |

---

## הרכיבים המרכזיים

### 🌟 SocialHalo — הילה חברתית
הילה צבעונית ומתנשמת שמקיפה את הדובר.  
עוצמת הפועם משקפת את עוצמת הרגש — ממש כמו לב שדופק.  
ככל שהרגש חזק יותר, ההילה פועמת מהר ובוהקת יותר.

### 🃏 CueCards — כרטיסיות הסבר
לאחר זיהוי רגש, מופיעות 3 כרטיסיות קטנות:
- מה **הפנים** אומרות
- מה **הטון** אומר
- **מה זה אומר** — בשפה פשוטה ויישומית

### ⛅ MoodWeather — מזג האוויר החברתי
מטאפורת מזג האוויר מתארת את **האווירה הכללית בחדר**:
- ☀️ שמשי = אווירה חיובית ופתוחה
- ⛅ מעורב = ניטרלי, קשה לקרוא
- ☁️ מעונן = אווירה לא ברורה
- ⛈️ סוערת = מתח ועוצמה גבוהה

### 🎯 FadingManager — מנגנון הדהייה
זה הלב של המערכת.

המטרה הסופית של SocialLens היא **לגרום לעצמה להיות מיותרת.**

הסיוע מתחיל בצבעים מלאים ובהירים.  
ככל שהילד לומד לזהות את הרמז לבד — הצבעים דוהים בהדרגה.  
עד שיום אחד הוא רואה את המציאות כמו שהיא, ללא תמיכה.


</div>
