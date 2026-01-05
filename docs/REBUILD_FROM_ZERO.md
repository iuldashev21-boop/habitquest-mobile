# HabitQuest Mobile - Rebuild From Zero Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Xcode) or Android Emulator
- Supabase account with project created

---

## Step 1: Create Expo Project

```bash
npx create-expo-app habitquest-mobile --template blank
cd habitquest-mobile
```

## Step 2: Install Dependencies

```bash
# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# State Management
npm install zustand @react-native-async-storage/async-storage

# Supabase
npm install @supabase/supabase-js
npm install expo-secure-store
npm install react-native-url-polyfill

# Expo Extras
npm install expo-font expo-splash-screen expo-status-bar expo-notifications
```

## Step 3: Environment Variables

Create `src/lib/supabase.js`:

```javascript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

const SecureStoreAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

## Step 4: Set Up Folder Structure

```bash
mkdir -p src/{screens,navigation,context,hooks,lib,data,assets}
```

## Step 5: Create Core Files

### 5.1 Game Data (`src/data/gameData.js`)
Copy from web app. Contains:
- `CLASSES` - Archetype definitions with colors, ranks
- `PHASES` - 66-day journey phases
- `XP_PER_LEVEL`, `PERFECT_DAY_BONUS`
- `getPhase()`, `getRank()` helpers

### 5.2 Zustand Store (`src/context/useGameStore.js`)
Port from web with these changes:
- Replace `localStorage` persist with AsyncStorage:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

const useGameStore = create(
  persist(
    (set, get) => ({
      // ... state and actions
    }),
    {
      name: 'habitquest-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### 5.3 Auth Hook (`src/hooks/useAuth.js`)
```javascript
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      setInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    initialized,
    isAuthenticated: !!user,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signOut: () => supabase.auth.signOut(),
  };
};
```

## Step 6: Create Navigation

### `src/navigation/AppNavigator.js`
```javascript
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Conditional rendering based on:
// 1. isAuthenticated (from useAuth)
// 2. hasCompletedOnboarding (habits.length > 0)
```

## Step 7: Create Screens

Order of implementation:
1. `AuthScreen.js` - Email/password login
2. `WelcomeScreen.js` - Intro with "Begin" button
3. `ProfileSetupScreen.js` - Username input
4. `CommitmentScreen.js` - Multi-step questionnaire
5. `LifestyleScreen.js` - Lifestyle assessment
6. `ArchetypeScreen.js` - Class selection
7. `DifficultyScreen.js` - Difficulty with habit preview
8. `HabitCustomizeScreen.js` - Final review before start
9. `DashboardScreen.js` - Daily habit tracking
10. `BattleMapScreen.js` - 66-day calendar
11. `ArsenalScreen.js` - Stats and settings
12. `RecordsScreen.js` - Historical logs

## Step 8: Supabase Database Setup

Run in Supabase SQL Editor:

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  archetype TEXT,
  difficulty TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  current_day INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  habits JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily logs table
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_number INTEGER,
  xp_earned INTEGER DEFAULT 0,
  is_perfect BOOLEAN DEFAULT FALSE,
  successful_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  relapse_count INTEGER DEFAULT 0,
  habits JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can read own logs" ON daily_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Step 9: Run Development

```bash
# Start Expo
npm start

# Or specific platform
npm run ios
npm run android
```

## Step 10: Build for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Package.json Scripts Reference

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  }
}
```

## Common Issues

| Issue | Solution |
|-------|----------|
| "Text strings must be rendered within Text" | Wrap all text in `<Text>` |
| Keyboard covers input | Use `KeyboardAvoidingView` |
| Tab bar covers content | Add `paddingBottom: 100` to scroll content |
| Auth state undefined on load | Wait for `initialized` flag |
| SecureStore fails on web | Use AsyncStorage fallback for web |
