import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CLASSES,
  XP_PER_LEVEL,
  PHASES,
  getStreakMultiplier,
  PERFECT_DAY_BONUS,
  SIDE_QUESTS,
  SIDE_QUESTS_PER_DAY,
  FREQUENCY_TYPES,
  getWeekStart,
  getWeekCompletions,
  isScheduledDay
} from '../data/gameData';
import { getTodayYMD, formatDateYMD, startOfLocalDay } from '../lib/dates';
import {
  saveUserProfile,
  loadUserProfile,
  saveDailyLog,
  loadDailyLogs,
  fullSync,
  deleteUserData
} from '../lib/syncService';

// Helper function to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Debounce utility to prevent burst sync traffic
let syncTimeout = null;
const SYNC_DEBOUNCE_MS = 300;

const debouncedSync = (syncFn) => {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  syncTimeout = setTimeout(() => {
    syncFn();
    syncTimeout = null;
  }, SYNC_DEBOUNCE_MS);
};

// Helper function to get daily side quests based on date seed
const getDailySideQuests = (dateString) => {
  // Use date as seed for consistent daily selection
  const seed = dateString.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  const shuffled = [...SIDE_QUESTS].sort((a, b) => {
    const hashA = (seed * a.id.charCodeAt(3)) % 100;
    const hashB = (seed * b.id.charCodeAt(3)) % 100;
    return hashA - hashB;
  });
  return shuffled.slice(0, SIDE_QUESTS_PER_DAY);
};

// Helper function to get start of day timestamp
const getStartOfDay = (date = new Date()) => {
  const result = startOfLocalDay(date);
  return result ? result.getTime() : 0;
};

// Helper function to check if a date string is today
const isToday = (dateString) => {
  if (!dateString) return false;
  return dateString === getTodayYMD();
};

// Helper function to check if it's a new day (past midnight)
const isNewDay = (lastDateString) => {
  if (!lastDateString) return true;
  return lastDateString !== getTodayYMD();
};

// Helper function to calculate days since start
const calculateDaysSinceStart = (startDate) => {
  if (!startDate) return 0;
  const start = getStartOfDay(new Date(startDate));
  const today = getStartOfDay(new Date());
  return Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
};

// Helper function to get current phase based on days
export const getCurrentPhase = (dayStarted) => {
  const days = calculateDaysSinceStart(dayStarted);

  if (days <= 22) return PHASES.FRAGILE;
  if (days <= 44) return PHASES.BUILDING;
  if (days <= 66) return PHASES.LOCKED_IN;
  return PHASES.FORGED;
};

const useGameStore = create(
  persist(
    (set, get) => ({
      // ========== USER STATE ==========
      username: null,
      lifestyleAnswers: null, // { answers: {}, score: number, level: string }
      commitmentAnswers: null, // { struggles: [], seriousness: '', identity: '', ready: boolean }
      onboardingComplete: false,
      archetype: null,
      difficulty: null,
      habits: [],
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      dayStarted: null,
      currentDay: 1,
      lastCompletedDate: null,

      // Day lock-in state
      dayLockedAt: null, // Timestamp when day was completed/locked

      // Submission tracking (persisted)
      lastSubmitDate: null, // Date string (YYYY-MM-DD) when last submitted
      lastCelebrationDate: null, // Date string when celebration was last shown

      // Side quests state
      dailySideQuests: [], // Today's available side quests
      completedSideQuests: [], // IDs of completed side quests today
      sideQuestsDate: null, // Date string for current side quests

      // Day history for Battle Map and Records
      dayHistory: [], // Array of { date, dayNumber, habits, xpEarned, isPerfect, successfulCount, totalCount, relapseCount }

      // Achievement tracking (persisted)
      achievements: {
        firstBlood: false,      // Complete 1 day
        weekWarrior: false,     // 7 day streak
        twoWeeks: false,        // 14 day streak
        monthly: false,         // 30 day streak
        lockedIn: false,        // 45 day streak
        forged: false,          // 66 day streak
        centurion: false,       // 100 day streak
        perfectWeek: false,     // 7 perfect days in a row
        perfectMonth: false     // 30 perfect days total
      },

      // Aggregate stats (persisted)
      totalDaysCompleted: 0,
      perfectDaysCount: 0,
      totalXPEarned: 0,

      // Sync state
      isSyncing: false,
      syncError: null,
      lastSyncTime: null,
      userId: null, // Set when user logs in

      // ========== ACTIONS ==========

      // Set the user's display name
      setUsername: (username) => set({ username }),

      // Set the lifestyle assessment answers
      setLifestyleAnswers: (answers) => set({ lifestyleAnswers: answers }),

      // ========== SYNC ACTIONS ==========

      // Set the user ID (called on login)
      setUserId: (userId) => set({ userId }),

      // Load data from Supabase on login
      loadFromSupabase: async (userId) => {
        set({ isSyncing: true, syncError: null, userId });

        try {
          const result = await fullSync(userId);

          if (result.profile.success && result.profile.data) {
            // Supabase has data - use it
            const profileData = result.profile.data;
            const dailyLogs = result.dailyLogs.success ? result.dailyLogs.data : [];

            set({
              ...profileData,
              dayHistory: dailyLogs,
              isSyncing: false,
              lastSyncTime: Date.now()
            });

            // Explicitly check for day reset after loading data
            setTimeout(() => get().checkAndResetDay(), 0);

            return { success: true, hasData: true };
          } else if (result.profile.success && !result.profile.data) {
            // No data in Supabase - check if we have local data to sync up
            const state = get();
            if (state.habits && state.habits.length > 0) {
              // We have local data - sync it to Supabase
              await get().syncToSupabase();
            }
            set({ isSyncing: false, lastSyncTime: Date.now() });
            return { success: true, hasData: false };
          } else {
            // Error loading
            set({ isSyncing: false, syncError: 'Failed to load data' });
            return { success: false, error: result.profile.error };
          }
        } catch (err) {
          set({ isSyncing: false, syncError: err.message });
          return { success: false, error: err };
        }
      },

      // Sync current state to Supabase
      syncToSupabase: async () => {
        const state = get();
        if (!state.userId) return { success: false, error: 'No user ID' };

        set({ isSyncing: true, syncError: null });

        try {
          // Save profile
          const profileResult = await saveUserProfile(state.userId, {
            username: state.username,
            archetype: state.archetype,
            difficulty: state.difficulty,
            xp: state.xp,
            level: state.level,
            currentStreak: state.currentStreak,
            longestStreak: state.longestStreak,
            dayStarted: state.dayStarted,
            currentDay: state.currentDay,
            habits: state.habits,
            achievements: state.achievements,
            totalDaysCompleted: state.totalDaysCompleted,
            perfectDaysCount: state.perfectDaysCount,
            totalXPEarned: state.totalXPEarned,
            lifestyleAnswers: state.lifestyleAnswers,
            commitmentAnswers: state.commitmentAnswers,
            lastCompletedDate: state.lastCompletedDate,
            dayLockedAt: state.dayLockedAt,
            lastSubmitDate: state.lastSubmitDate,
            lastCelebrationDate: state.lastCelebrationDate,
            dailySideQuests: state.dailySideQuests,
            completedSideQuests: state.completedSideQuests,
            sideQuestsDate: state.sideQuestsDate
          });

          if (!profileResult.success) {
            set({ isSyncing: false, syncError: 'Failed to save profile' });
            return profileResult;
          }

          set({ isSyncing: false, lastSyncTime: Date.now() });
          return { success: true };
        } catch (err) {
          set({ isSyncing: false, syncError: err.message });
          return { success: false, error: err };
        }
      },

      // Sync a daily log entry
      syncDailyLog: async (logEntry) => {
        const state = get();
        if (!state.userId) return { success: false, error: 'No user ID' };

        try {
          return await saveDailyLog(state.userId, logEntry.date, logEntry);
        } catch (err) {
          console.error('Failed to sync daily log:', err);
          return { success: false, error: err };
        }
      },

      // Clear sync state on logout
      clearSyncState: () => set({
        userId: null,
        isSyncing: false,
        syncError: null,
        lastSyncTime: null
      }),

      // Clear just the sync error
      clearSyncError: () => set({ syncError: null }),

      // Set the commitment answers from onboarding
      setCommitmentAnswers: (answers) => set({ commitmentAnswers: answers }),

      // Set the user's archetype
      setArchetype: (archetype) => set({ archetype }),

      // Set the difficulty level
      setDifficulty: (difficulty) => set({ difficulty }),

      // Initialize habits from mission card selection and complete onboarding
      initializeHabits: (habitsData) => {
        const now = Date.now();
        const habits = habitsData.map((habit) => ({
          id: habit.id || generateId(),
          name: habit.name,
          type: habit.type,
          xp: habit.xp,
          frequency: habit.frequency || 'daily',
          completed: false,
          relapsedToday: false, // Track if demon was relapsed today (still allows submission)
          completedDates: [], // Track all completion dates for frequency-based habits
          streak: 0, // For daily habits: consecutive days. For weekly: consecutive weeks
          longestStreak: 0,
          relapses: 0,
          dayStarted: now,
          weekStreak: 0 // For non-daily habits: consecutive successful weeks
        }));

        set({
          habits,
          dayStarted: now,
          currentDay: 1,
          xp: 0,
          level: 1,
          currentStreak: 0,
          longestStreak: 0,
          lastCompletedDate: null,
          onboardingComplete: true
        });

        // Sync to Supabase after onboarding
        debouncedSync(() => get().syncToSupabase());
      },

      // Add a single habit
      addHabit: (habit) => {
        const newHabit = {
          id: habit.id || generateId(),
          name: habit.name,
          type: habit.type,
          xp: habit.xp,
          frequency: habit.frequency || 'daily',
          completed: false,
          relapsedToday: false,
          completedDates: [],
          streak: 0,
          longestStreak: 0,
          relapses: 0,
          dayStarted: Date.now(),
          weekStreak: 0
        };

        set((state) => ({
          habits: [...state.habits, newHabit]
        }));
      },

      // Remove a habit by ID
      removeHabit: (habitId) => {
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== habitId)
        }));
      },

      // Complete a habit - adds XP and updates streak
      completeHabit: (habitId) => {
        const state = get();
        const habitIndex = state.habits.findIndex((h) => h.id === habitId);

        if (habitIndex === -1) return;

        const habit = state.habits[habitIndex];
        if (habit.completed) return; // Already completed today

        // Calculate XP with streak multiplier
        const streakMultiplier = getStreakMultiplier(state.currentStreak);
        const earnedXp = Math.floor(habit.xp * streakMultiplier);

        // Add today to completedDates
        const todayStr = getTodayYMD();
        const newCompletedDates = [...(habit.completedDates || [])];
        if (!newCompletedDates.includes(todayStr)) {
          newCompletedDates.push(todayStr);
        }

        // Calculate streak based on frequency
        let newStreak = habit.streak;
        if (habit.frequency === 'daily') {
          // Daily habits: increment streak each day
          newStreak = habit.streak + 1;
        } else {
          // Non-daily habits: streak is counted per successful week
          // Streak increment happens at week end in checkAndResetDay
          newStreak = habit.streak;
        }

        // Update the habit
        const updatedHabits = [...state.habits];
        updatedHabits[habitIndex] = {
          ...habit,
          completed: true,
          completedDates: newCompletedDates,
          streak: newStreak,
          longestStreak: Math.max(habit.longestStreak, newStreak)
        };

        // Calculate new XP and level
        const newXp = state.xp + earnedXp;
        const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;

        set({
          habits: updatedHabits,
          xp: newXp,
          level: newLevel
        });

        // Check if all SCHEDULED habits are completed for perfect day bonus
        const allScheduledCompleted = updatedHabits.every((h) => {
          const isScheduled = isScheduledDay(h.frequency || 'daily');
          return !isScheduled || h.completed;
        });

        if (allScheduledCompleted) {
          const perfectXp = Math.floor(PERFECT_DAY_BONUS * streakMultiplier);
          const finalXp = newXp + perfectXp;
          const finalLevel = Math.floor(finalXp / XP_PER_LEVEL) + 1;

          set({
            xp: finalXp,
            level: finalLevel
          });
        }

        // Sync to Supabase after completing habit
        debouncedSync(() => get().syncToSupabase());
      },

      // Undo a habit completion - only allowed if day not yet submitted
      uncompleteHabit: (habitId) => {
        const state = get();

        // Don't allow undo if day is already submitted
        if (state.isTodaySubmitted && state.isTodaySubmitted()) {
          return { success: false, reason: 'Day already submitted' };
        }

        // Check if day is locked
        if (state.dayLockedAt !== null) {
          return { success: false, reason: 'Day is locked' };
        }

        const habitIndex = state.habits.findIndex((h) => h.id === habitId);
        if (habitIndex === -1) return { success: false, reason: 'Habit not found' };

        const habit = state.habits[habitIndex];
        if (!habit.completed) return { success: false, reason: 'Habit not completed' };

        // Check if we currently have a perfect day (before uncompleting)
        const wasAllCompleted = state.habits.every((h) => {
          const isScheduled = isScheduledDay(h.frequency || 'daily');
          return !isScheduled || h.completed;
        });

        // Remove today from completedDates
        const todayStr = getTodayYMD();
        const newCompletedDates = (habit.completedDates || []).filter(d => d !== todayStr);

        // Calculate XP to remove (reverse of completeHabit)
        const streakMultiplier = getStreakMultiplier(state.currentStreak);
        let xpToRemove = Math.floor(habit.xp * streakMultiplier);

        // If we were at a perfect day, also revert the perfect day bonus
        if (wasAllCompleted) {
          const perfectBonus = Math.floor(PERFECT_DAY_BONUS * streakMultiplier);
          xpToRemove += perfectBonus;
        }

        // Revert streak for daily habits
        let newStreak = habit.streak;
        if (habit.frequency === 'daily' && habit.streak > 0) {
          newStreak = habit.streak - 1;
        }

        // Update the habit
        const updatedHabits = [...state.habits];
        updatedHabits[habitIndex] = {
          ...habit,
          completed: false,
          completedDates: newCompletedDates,
          streak: newStreak
        };

        // Calculate new XP (ensure it doesn't go negative)
        const newXp = Math.max(0, state.xp - xpToRemove);
        const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;

        set({
          habits: updatedHabits,
          xp: newXp,
          level: newLevel
        });

        // Sync to Supabase
        debouncedSync(() => get().syncToSupabase());

        return { success: true, xpRemoved: xpToRemove };
      },

      // Relapse on a demon habit - resets habit streak only, loses 50% of XP earned from this habit
      // IMPORTANT: Does NOT reset the 66-day journey or global streak
      relapseHabit: (habitId) => {
        const state = get();
        const habitIndex = state.habits.findIndex((h) => h.id === habitId);

        if (habitIndex === -1) return null;

        const habit = state.habits[habitIndex];
        if (habit.type !== 'demon') return null; // Only demons can relapse

        const RECOVERY_XP = 5; // XP for being honest about relapse

        // Calculate XP penalty: 50% of XP earned from THIS HABIT ONLY
        // XP earned from this habit = streak * habit.xp
        const xpEarnedFromHabit = habit.streak * habit.xp;
        const xpPenalty = Math.floor(xpEarnedFromHabit * 0.5);

        // Apply penalty but add recovery XP
        const netXpChange = RECOVERY_XP - xpPenalty;
        const newXp = Math.max(0, state.xp + netXpChange);
        const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;

        // Store the streak before resetting
        const streakBeforeRelapse = habit.streak;
        const newLongestStreak = Math.max(habit.longestStreak, streakBeforeRelapse);

        // Update ONLY this habit - don't touch other habits or global journey
        const updatedHabits = [...state.habits];
        updatedHabits[habitIndex] = {
          ...habit,
          completed: false,
          relapsedToday: true, // Mark as relapsed (still allows day submission)
          streak: 0,
          longestStreak: newLongestStreak,
          relapses: habit.relapses + 1
        };

        // Update state - DO NOT reset currentStreak (global) or dayStarted (66-day journey)
        set({
          habits: updatedHabits,
          xp: newXp,
          level: newLevel
          // Note: currentStreak, dayStarted, currentDay are NOT modified
        });

        // Sync to Supabase after relapse
        debouncedSync(() => get().syncToSupabase());

        // Return info for UI feedback
        return {
          xpLost: xpPenalty,
          recoveryXp: RECOVERY_XP,
          streakLost: streakBeforeRelapse,
          totalRelapses: habit.relapses + 1,
          longestStreak: newLongestStreak
        };
      },

      // Reset day - called at the start of a new day
      resetDay: () => {
        const state = get();
        const today = getStartOfDay();
        const lastCompleted = state.lastCompletedDate
          ? getStartOfDay(new Date(state.lastCompletedDate))
          : null;

        // Check if we completed all habits yesterday
        const allCompletedYesterday = state.habits.every((h) => h.completed);
        const isConsecutiveDay = lastCompleted &&
          (today - lastCompleted === 24 * 60 * 60 * 1000);

        // Update streak based on yesterday's performance
        let newCurrentStreak = state.currentStreak;
        if (allCompletedYesterday && isConsecutiveDay) {
          newCurrentStreak = state.currentStreak + 1;
        } else if (!isConsecutiveDay && lastCompleted) {
          newCurrentStreak = 0;
        }

        // Reset all habits to not completed
        const resetHabits = state.habits.map((habit) => ({
          ...habit,
          completed: false,
          // Reset streak if habit wasn't completed (for powers)
          streak: habit.completed ? habit.streak : 0
        }));

        // Calculate new current day
        const newCurrentDay = calculateDaysSinceStart(state.dayStarted);

        set({
          habits: resetHabits,
          currentDay: newCurrentDay,
          currentStreak: newCurrentStreak,
          longestStreak: Math.max(state.longestStreak, newCurrentStreak),
          lastCompletedDate: allCompletedYesterday ? state.lastCompletedDate : null
        });
      },

      // Mark today as completed (called when submitting daily progress)
      // This now also LOCKS the day - no more habit changes until reset
      // Allows submission even with relapses - relapsed demons count as "handled"
      // STREAK LOGIC: Streak increments on EVERY submitted day (relapses don't break streak)
      markDayCompleted: () => {
        const state = get();
        // Only check SCHEDULED habits (non-rest-day habits)
        const scheduledHabits = state.habits.filter((h) => isScheduledDay(h.frequency || 'daily'));

        // A habit is "handled" if it's completed OR if it's a relapsed demon
        const allScheduledHandled = scheduledHabits.every((h) =>
          h.completed || (h.type === 'demon' && h.relapsedToday)
        );

        if (allScheduledHandled) {
          // Count successful habits (completed, not relapsed)
          const successfulCount = scheduledHabits.filter((h) => h.completed).length;
          const totalCount = scheduledHabits.length;
          const isPerfectDay = successfulCount === totalCount;

          // STREAK ALWAYS INCREMENTS when user submits their day
          // Relapses are tracked separately but don't break the streak
          // The streak represents "days you showed up" not "perfect days"
          const newCurrentStreak = state.currentStreak + 1;
          const newLongestStreak = Math.max(state.longestStreak, newCurrentStreak);
          const today = getTodayYMD();

          // Calculate XP earned today (approximate from habit XP)
          const xpEarned = scheduledHabits
            .filter((h) => h.completed)
            .reduce((sum, h) => sum + h.xp, 0);

          // Calculate day number based on completed days, not elapsed time
          // This ensures day numbers are sequential (1, 2, 3...) regardless of timing
          const dayNumber = state.totalDaysCompleted + 1;

          // Count relapses
          const relapseCount = scheduledHabits.filter((h) => h.relapsedToday).length;

          // Create history entry for Battle Map and Records
          const historyEntry = {
            date: today,
            dayNumber,
            habits: scheduledHabits.map((h) => ({
              id: h.id,
              name: h.name,
              type: h.type,
              xp: h.xp,
              status: h.completed ? 'completed' : (h.relapsedToday ? 'relapsed' : 'missed'),
              streak: h.streak
            })),
            xpEarned,
            isPerfect: isPerfectDay,
            successfulCount,
            totalCount,
            relapseCount
          };

          // Update day history (replace if same date exists)
          const existingIndex = state.dayHistory.findIndex((d) => d.date === today);
          const newDayHistory = [...state.dayHistory];
          const isNewDay = existingIndex < 0;

          if (existingIndex >= 0) {
            newDayHistory[existingIndex] = historyEntry;
          } else {
            newDayHistory.push(historyEntry);
          }

          // Update aggregate stats (only increment for new days)
          const newTotalDaysCompleted = isNewDay
            ? state.totalDaysCompleted + 1
            : state.totalDaysCompleted;
          const newPerfectDaysCount = isNewDay && isPerfectDay
            ? state.perfectDaysCount + 1
            : state.perfectDaysCount;
          const newTotalXPEarned = state.totalXPEarned + xpEarned;

          // Check and update achievements
          const newAchievements = { ...state.achievements };

          // Streak-based achievements
          if (newTotalDaysCompleted >= 1) newAchievements.firstBlood = true;
          if (newLongestStreak >= 7) newAchievements.weekWarrior = true;
          if (newLongestStreak >= 14) newAchievements.twoWeeks = true;
          if (newLongestStreak >= 30) newAchievements.monthly = true;
          if (newLongestStreak >= 45) newAchievements.lockedIn = true;
          if (newLongestStreak >= 66) newAchievements.forged = true;
          if (newLongestStreak >= 100) newAchievements.centurion = true;

          // Perfect day achievements
          if (newPerfectDaysCount >= 30) newAchievements.perfectMonth = true;

          // Check for perfect week (7 consecutive perfect days)
          const sortedHistory = [...newDayHistory].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
          );
          let consecutivePerfect = 0;
          for (const day of sortedHistory) {
            if (day.isPerfect) {
              consecutivePerfect++;
              if (consecutivePerfect >= 7) {
                newAchievements.perfectWeek = true;
                break;
              }
            } else {
              break;
            }
          }

          // Track newly unlocked achievements
          const newlyUnlocked = [];
          Object.keys(newAchievements).forEach((key) => {
            if (newAchievements[key] && !state.achievements[key]) {
              newlyUnlocked.push(key);
            }
          });

          set({
            lastCompletedDate: Date.now(),
            dayLockedAt: Date.now(),
            lastSubmitDate: today,
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak,
            dayHistory: newDayHistory,
            totalDaysCompleted: newTotalDaysCompleted,
            perfectDaysCount: newPerfectDaysCount,
            totalXPEarned: newTotalXPEarned,
            achievements: newAchievements
          });

          // Critical: Day submission syncs immediately (not debounced) to ensure
          // daily log is saved promptly. Short delay allows state to settle first.
          setTimeout(() => {
            get().syncToSupabase();
            get().syncDailyLog(historyEntry);
          }, 100);

          return {
            streakUpdated: true,
            newStreak: newCurrentStreak,
            dayLocked: true,
            successfulCount,
            totalCount,
            isPerfectDay,
            relapseCount,
            newlyUnlockedAchievements: newlyUnlocked
          };
        }

        return { streakUpdated: false };
      },

      // Mark celebration as shown for today
      markCelebrationShown: () => {
        set({ lastCelebrationDate: getTodayYMD() });
      },

      // Check if today has been submitted
      isTodaySubmitted: () => {
        const state = get();
        return isToday(state.lastSubmitDate);
      },

      // Check if celebration was already shown today
      wasCelebrationShownToday: () => {
        const state = get();
        return isToday(state.lastCelebrationDate);
      },

      // Check if day is currently locked
      isDayLocked: () => {
        const state = get();
        return state.dayLockedAt !== null;
      },

      // Get time remaining until midnight (next day reset) in ms
      getTimeUntilUnlock: () => {
        const state = get();
        if (!state.dayLockedAt) return 0;

        // Calculate time until midnight local time
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0); // Next midnight

        const remaining = midnight.getTime() - now.getTime();
        return Math.max(0, remaining);
      },

      // Refresh side quests for today
      refreshSideQuests: () => {
        const today = getTodayYMD();
        const state = get();

        // Only refresh if it's a new day
        if (state.sideQuestsDate !== today) {
          const todaysQuests = getDailySideQuests(today);
          set({
            dailySideQuests: todaysQuests,
            completedSideQuests: [],
            sideQuestsDate: today
          });
        }
      },

      // Complete a side quest
      completeSideQuest: (questId) => {
        const state = get();

        // Check if already completed
        if (state.completedSideQuests.includes(questId)) return null;

        // Find the quest
        const quest = state.dailySideQuests.find((q) => q.id === questId);
        if (!quest) return null;

        // Calculate XP with streak multiplier
        const streakMultiplier = getStreakMultiplier(state.currentStreak);
        const earnedXp = Math.floor(quest.xp * streakMultiplier);

        // Update XP and level
        const newXp = state.xp + earnedXp;
        const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;

        set({
          completedSideQuests: [...state.completedSideQuests, questId],
          xp: newXp,
          level: newLevel
        });

        // Sync to Supabase after completing side quest
        debouncedSync(() => get().syncToSupabase());

        return { xpEarned: earnedXp, quest };
      },

      // Get today's side quests with completion status
      getSideQuests: () => {
        const state = get();
        const today = getTodayYMD();

        // Auto-refresh if needed
        if (state.sideQuestsDate !== today) {
          get().refreshSideQuests();
          return get().dailySideQuests.map((q) => ({
            ...q,
            completed: false
          }));
        }

        return state.dailySideQuests.map((q) => ({
          ...q,
          completed: state.completedSideQuests.includes(q.id)
        }));
      },

      // Check if we need to reset for a new day (uses MIDNIGHT local time)
      checkAndResetDay: () => {
        const state = get();
        if (!state.dayStarted) return false;

        const todayString = getTodayYMD();

        // Check if it's a new day based on lastSubmitDate
        // If lastSubmitDate is not today, we need to check for reset
        if (!isNewDay(state.lastSubmitDate) && state.lastSubmitDate) {
          // Same day as last submit - don't reset
          return false;
        }

        // Check if habits are already reset for today by checking sideQuestsDate
        // If sideQuestsDate is today and habits are not completed, already reset
        if (state.sideQuestsDate === todayString) {
          // Already processed today
          return false;
        }

        const today = getStartOfDay();
        const lastCompleted = state.lastCompletedDate
          ? getStartOfDay(new Date(state.lastCompletedDate))
          : null;

        // Calculate if yesterday was completed (streak continues)
        const yesterday = today - (24 * 60 * 60 * 1000);
        const wasYesterdayCompleted = lastCompleted === yesterday;

        // Check if it's a new week (Monday)
        const todayDate = new Date();
        const isMonday = todayDate.getDay() === 1;
        const lastWeekStart = new Date(getWeekStart());
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        // Reset habits for new day and handle weekly streak updates
        const resetHabits = state.habits.map((habit) => {
          const frequency = habit.frequency || 'daily';
          let newStreak = habit.streak;
          let newWeekStreak = habit.weekStreak || 0;

          // For daily habits: reset streak if not completed yesterday
          if (frequency === 'daily') {
            if (!habit.completed && state.sideQuestsDate) {
              // Habit wasn't completed yesterday (if we had a previous day)
              newStreak = 0;
            }
          } else if (isMonday) {
            // For non-daily habits: check last week's completion on Monday
            const lastWeekCompletions = getWeekCompletions(habit.completedDates || [], lastWeekStart);
            const target = FREQUENCY_TYPES[frequency]?.targetPerWeek || 3;

            if (lastWeekCompletions >= target) {
              // Last week was successful, increment week streak
              newWeekStreak = (habit.weekStreak || 0) + 1;
              newStreak = newWeekStreak;
            } else if (state.sideQuestsDate) {
              // Last week failed (only if we had tracking)
              newWeekStreak = 0;
              newStreak = 0;
            }
          }

          return {
            ...habit,
            completed: false,
            relapsedToday: false, // Reset relapse status for new day
            streak: newStreak,
            weekStreak: newWeekStreak,
            longestStreak: Math.max(habit.longestStreak, newStreak)
          };
        });

        // Update current day
        const newCurrentDay = calculateDaysSinceStart(state.dayStarted);

        // Determine streak: continue if yesterday was completed, else reset to 0
        let newCurrentStreak = state.currentStreak;
        if (!wasYesterdayCompleted && lastCompleted && lastCompleted < today) {
          // Yesterday wasn't completed, break streak
          newCurrentStreak = 0;
        } else if (!lastCompleted && state.currentDay > 1) {
          // No completion date but we're past day 1, break streak
          newCurrentStreak = 0;
        }

        // Refresh side quests for new day
        const todaysQuests = getDailySideQuests(todayString);

        set({
          habits: resetHabits,
          currentDay: newCurrentDay,
          currentStreak: newCurrentStreak,
          dayLockedAt: null, // Unlock the day
          dailySideQuests: todaysQuests,
          completedSideQuests: [],
          sideQuestsDate: todayString
          // Note: lastSubmitDate is NOT cleared - it stays as the last submit date
          // It will be updated when user submits today
        });

        return true; // Day was reset
      },

      // Calculate level based on total XP
      calculateLevel: () => {
        const state = get();
        return Math.floor(state.xp / XP_PER_LEVEL) + 1;
      },

      // Get current rank based on level and archetype
      getRank: () => {
        const state = get();
        if (!state.archetype) return null;

        const classData = CLASSES[state.archetype];
        if (!classData) return null;

        // Each rank spans 5 levels
        const rankIndex = Math.min(
          Math.floor((state.level - 1) / 5),
          classData.ranks.length - 1
        );
        return classData.ranks[rankIndex];
      },

      // Get current phase based on days since start
      getCurrentPhase: () => {
        const state = get();
        return getCurrentPhase(state.dayStarted);
      },

      // Get archetype data
      getArchetypeData: () => {
        const state = get();
        if (!state.archetype) return null;
        return CLASSES[state.archetype];
      },

      // Get XP progress within current level
      getLevelProgress: () => {
        const state = get();
        return {
          current: state.xp % XP_PER_LEVEL,
          total: XP_PER_LEVEL,
          percentage: (state.xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100
        };
      },

      // Get stats summary
      getStats: () => {
        const state = get();
        const demons = state.habits.filter((h) => h.type === 'demon');
        const powers = state.habits.filter((h) => h.type === 'power');

        return {
          totalHabits: state.habits.length,
          demonsCount: demons.length,
          powersCount: powers.length,
          completedToday: state.habits.filter((h) => h.completed).length,
          totalRelapses: demons.reduce((sum, h) => sum + h.relapses, 0),
          averageStreak: state.habits.length > 0
            ? Math.round(state.habits.reduce((sum, h) => sum + h.streak, 0) / state.habits.length)
            : 0
        };
      },

      // Get habit's weekly progress (for non-daily habits)
      getHabitWeekProgress: (habitId) => {
        const state = get();
        const habit = state.habits.find((h) => h.id === habitId);
        if (!habit) return null;

        const frequency = habit.frequency || 'daily';
        const target = FREQUENCY_TYPES[frequency]?.targetPerWeek || 7;
        const completions = getWeekCompletions(habit.completedDates || []);

        return {
          current: completions,
          target,
          isComplete: completions >= target,
          frequency
        };
      },

      // Check if a habit is scheduled for today
      isHabitScheduledToday: (habitId) => {
        const state = get();
        const habit = state.habits.find((h) => h.id === habitId);
        if (!habit) return true;

        return isScheduledDay(habit.frequency || 'daily');
      },

      // Get all habits that are scheduled for today
      getScheduledHabits: () => {
        const state = get();
        return state.habits.filter((h) => isScheduledDay(h.frequency || 'daily'));
      },

      // ========== HISTORY HELPERS ==========

      // Get history entry by date
      getHistoryByDate: (date) => {
        const state = get();
        return state.dayHistory.find((d) => d.date === date) || null;
      },

      // Get filtered history
      getFilteredHistory: (filter = 'all') => {
        const state = get();
        let filtered = [...state.dayHistory];

        switch (filter) {
          case 'perfect':
            filtered = filtered.filter((d) => d.isPerfect);
            break;
          case 'relapses':
            filtered = filtered.filter((d) => d.relapseCount > 0);
            break;
          default:
            break;
        }

        // Sort by date (most recent first)
        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      },

      // Calculate consecutive perfect days
      calculatePerfectStreak: () => {
        const state = get();
        const sortedHistory = [...state.dayHistory].sort((a, b) =>
          new Date(b.date) - new Date(a.date)
        );

        let consecutivePerfect = 0;
        for (const day of sortedHistory) {
          if (day.isPerfect) {
            consecutivePerfect++;
          } else {
            break;
          }
        }
        return consecutivePerfect;
      },

      // Get total relapses from all habits
      getTotalRelapses: () => {
        const state = get();
        return state.habits.reduce((sum, h) => sum + (h.relapses || 0), 0);
      },

      // Reset entire game state
      resetGame: () => {
        set({
          username: null,
          lifestyleAnswers: null,
          commitmentAnswers: null,
          onboardingComplete: false,
          archetype: null,
          difficulty: null,
          habits: [],
          xp: 0,
          level: 1,
          currentStreak: 0,
          longestStreak: 0,
          dayStarted: null,
          currentDay: 1,
          lastCompletedDate: null,
          dayLockedAt: null,
          lastSubmitDate: null,
          lastCelebrationDate: null,
          dailySideQuests: [],
          completedSideQuests: [],
          sideQuestsDate: null,
          dayHistory: [],
          achievements: {
            firstBlood: false,
            weekWarrior: false,
            twoWeeks: false,
            monthly: false,
            lockedIn: false,
            forged: false,
            centurion: false,
            perfectWeek: false,
            perfectMonth: false
          },
          totalDaysCompleted: 0,
          perfectDaysCount: 0,
          totalXPEarned: 0
        });
      },

      // Delete all user data from Supabase
      deleteFromSupabase: async () => {
        const state = get();
        if (state.userId) {
          const result = await deleteUserData(state.userId);
          return result;
        }
        return { success: true };
      }
    }),
    {
      name: 'habitquest-storage',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState, version) => {
        // Migration stub for future schema changes
        // Add migrations here as needed when version increments
        // Handle pre-versioned data (undefined/null) and version 0
        if (!version || version === 0) {
          // Migration from version 0 to 1
          return { ...persistedState };
        }
        return persistedState;
      }
    }
  )
);

export default useGameStore;
