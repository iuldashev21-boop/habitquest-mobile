# HabitQuest Mobile - Glossary

## Core Concepts

### Archetype
User's chosen character class that determines color theme and ranks.
- **Options**: SPECTER (gray), ASCENDANT (orange), WRATH (red), SOVEREIGN (gold)
- **Location**: `src/data/gameData.js` → `CLASSES` object
- **Used in**: `ArchetypeScreen.js`, all screens for accent color

### Demon
A bad habit to eliminate (e.g., "No Porn", "No Social Media").
- **Actions**: Clean (success) or Relapse (failure)
- **Location**: `dailyProgress[habitId]` in store
- **XP**: Earned on Clean, lost on Relapse

### Power
A good habit to build (e.g., "Exercise", "Meditate").
- **Actions**: Complete or Miss
- **Location**: Same as Demon in store
- **XP**: Earned on completion only

### Phase
Stage in the 66-day habit formation journey.
- **Phases**: Fragile (1-22), Building (23-44), Locked In (45-66), Forged (67+)
- **Location**: `src/data/gameData.js` → `PHASES`, `getPhase()`

### Perfect Day
A day where all habits were completed successfully (no misses, no relapses).
- **Bonus**: +50 XP (`PERFECT_DAY_BONUS`)
- **Location**: Calculated in `submitDay()` action

---

## Technical Terms

### Expo
React Native development platform. Provides build tools, OTA updates, and native APIs.
- **Config**: `app.json`
- **Commands**: `expo start`, `expo build`

### React Navigation
Library for screen navigation in React Native.
- **Types used**: Native Stack, Bottom Tabs
- **Location**: `src/navigation/AppNavigator.js`

### Zustand
Lightweight state management library (alternative to Redux).
- **Location**: `src/context/useGameStore.js`
- **Pattern**: `useGameStore((state) => state.field)`

### AsyncStorage
Key-value storage for React Native (like localStorage for web).
- **Package**: `@react-native-async-storage/async-storage`
- **Used by**: Zustand persist middleware

### SecureStore
Encrypted storage for sensitive data (Expo).
- **Package**: `expo-secure-store`
- **Location**: `src/lib/supabase.js` (stores auth tokens)

### Supabase
Open-source Firebase alternative (Postgres + Auth + Realtime).
- **Client**: `src/lib/supabase.js`
- **Sync**: `src/lib/syncService.js`
- **Tables**: `profiles`, `daily_logs`

### RLS (Row Level Security)
Postgres feature ensuring users can only access their own data.
- **Location**: Supabase SQL policies
- **Pattern**: `auth.uid() = user_id`

---

## App-Specific Terms

### Command (Tab)
Main dashboard screen for daily habit tracking.
- **File**: `src/screens/DashboardScreen.js`

### Battle Map (Tab)
Calendar view showing 66-day progress.
- **File**: `src/screens/BattleMapScreen.js`

### Arsenal (Tab)
Profile, stats, achievements, and settings.
- **File**: `src/screens/ArsenalScreen.js`

### Records (Tab)
Historical daily log browser with filters.
- **File**: `src/screens/RecordsScreen.js`

### dayHistory
Array of completed day records stored in state.
- **Structure**: `{ date, dayNumber, xpEarned, isPerfect, habits[], ... }`
- **Location**: `useGameStore.dayHistory`

### dailyProgress
Object tracking today's habit completion status.
- **Structure**: `{ [habitId]: 'completed' | 'relapsed' | 'missed' | null }`
- **Location**: `useGameStore.dailyProgress`

### commitmentAnswers
User responses from onboarding questionnaire.
- **Fields**: `struggles[]`, `readiness`, `why`, `environment`
- **Used by**: `personalizedHabits.js` for habit generation

### lifestyleAnswers
User's current lifestyle assessment scores.
- **Fields**: `sleep`, `screen`, `exercise`, `water`, `mindset` (poor/okay/good)
- **Used by**: `personalizedHabits.js` for Power habit scaling

---

## File Quick Reference

| Term | File |
|------|------|
| CLASSES | `src/data/gameData.js` |
| PHASES | `src/data/gameData.js` |
| XP_PER_LEVEL | `src/data/gameData.js` |
| generateDemons | `src/data/personalizedHabits.js` |
| generatePowers | `src/data/personalizedHabits.js` |
| useGameStore | `src/context/useGameStore.js` |
| useAuth | `src/hooks/useAuth.js` |
| supabase | `src/lib/supabase.js` |
| syncToSupabase | `src/lib/syncService.js` |
| AppNavigator | `src/navigation/AppNavigator.js` |

---

## Abbreviations

| Abbrev | Meaning |
|--------|---------|
| XP | Experience Points |
| RN | React Native |
| RLS | Row Level Security |
| OTA | Over The Air (updates) |
| PWA | Progressive Web App |
| SSR | Server-Side Rendering |
