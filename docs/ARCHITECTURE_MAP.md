# HabitQuest Mobile - Architecture Map

## Entry Points

```
App.js
  └── AppNavigator.js (root navigator)
        ├── AuthScreen (if not authenticated)
        ├── OnboardingNavigator (if no habits)
        │     └── Welcome → ProfileSetup → Lifestyle → Commitment
        │         → Archetype → Difficulty → HabitCustomize
        └── MainTabs (if onboarding complete)
              └── Command | BattleMap | Arsenal | Records
```

## Folder Structure

```
src/
├── screens/          # UI screens (12 files)
├── navigation/       # React Navigation config
├── context/          # Zustand store (useGameStore.js)
├── hooks/            # Custom hooks (useAuth.js)
├── lib/              # Utilities & services
│   ├── supabase.js   # Supabase client init
│   ├── syncService.js # Cloud sync logic
│   ├── storage.js    # AsyncStorage helpers
│   ├── dates.js      # Date formatting
│   └── theme.js      # Colors/spacing (legacy)
├── data/             # Static data & generators
│   ├── gameData.js   # Classes, ranks, phases, XP
│   └── personalizedHabits.js # Habit generation
└── assets/           # Images, fonts
```

## State Management

### Zustand Store (`useGameStore.js`)

**User State**:
- `username`, `archetype`, `difficulty`
- `commitmentAnswers`, `lifestyleAnswers`

**Progress State**:
- `level`, `xp`, `currentDay`, `dayStarted`
- `currentStreak`, `longestStreak`
- `totalDaysCompleted`, `perfectDaysCount`, `totalXPEarned`

**Habit State**:
- `habits[]` - Array of habit objects with id, name, type, xp, streak, etc.
- `dailyProgress{}` - Today's completion status per habit
- `dayHistory[]` - Historical daily logs

**UI State**:
- `dayCompleted` - Whether today is submitted
- `achievements{}` - Unlocked achievement IDs

**Persistence**: Zustand `persist` middleware → AsyncStorage

## Authentication Flow

```
useAuth.js
  ├── Supabase Auth listener (onAuthStateChange)
  ├── States: user, loading, initialized, isAuthenticated
  └── Methods: signIn, signUp, signOut

SecureStore (expo-secure-store)
  └── Stores Supabase session tokens securely
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USER ACTION                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SCREEN COMPONENT                         │
│  (DashboardScreen, ArsenalScreen, etc.)                    │
│  - Reads state via useGameStore hooks                       │
│  - Calls actions to mutate state                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ZUSTAND STORE                            │
│  - Mutates state                                           │
│  - Persist middleware auto-saves to AsyncStorage           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SYNC SERVICE                             │
│  - Called after state changes (when online)                │
│  - Pushes to Supabase                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE                                 │
│  - profiles table (user data)                              │
│  - daily_logs table (history)                              │
│  - Auth (user sessions)                                    │
└─────────────────────────────────────────────────────────────┘
```

## Key Screens & Their Data

| Screen | Reads | Writes |
|--------|-------|--------|
| DashboardScreen | habits, dailyProgress, currentDay, phase | toggleHabit, submitDay, handleRelapse |
| BattleMapScreen | dayHistory, currentDay, streaks | (none) |
| ArsenalScreen | all stats, habits, achievements | resetGame |
| RecordsScreen | dayHistory | (none) |
| CommitmentScreen | - | setCommitmentAnswers |
| LifestyleScreen | - | setLifestyleAnswers |
| ArchetypeScreen | - | setArchetype |
| DifficultyScreen | commitmentAnswers, lifestyleAnswers | setDifficulty |
| HabitCustomizeScreen | all answers, difficulty | initializeHabits |

## Navigation Structure

```javascript
// Root: Native Stack
Stack.Navigator
  ├── "Auth" → AuthScreen
  ├── "Onboarding" → OnboardingStack.Navigator
  │     ├── "Welcome"
  │     ├── "ProfileSetup"
  │     ├── "Lifestyle"
  │     ├── "Commitment"
  │     ├── "Archetype"
  │     ├── "Difficulty"
  │     └── "HabitCustomize"
  └── "Main" → Tab.Navigator (custom tab bar)
        ├── "Command" → DashboardScreen
        ├── "BattleMap" → BattleMapScreen
        ├── "Arsenal" → ArsenalScreen
        └── "Records" → RecordsScreen
```

## External Services

| Service | Purpose | Config Location |
|---------|---------|-----------------|
| Supabase Auth | User authentication | `src/lib/supabase.js` |
| Supabase DB | Cloud sync | `src/lib/syncService.js` |
| Expo SecureStore | Token storage | `src/lib/supabase.js` |
| AsyncStorage | Local persistence | Zustand persist middleware |
