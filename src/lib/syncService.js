import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ========== VALIDATION HELPERS ==========

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SYNC_QUEUE_KEY = 'habitquest-sync-queue';

/**
 * Validate user ID format
 */
const validateUserId = (userId) => {
  if (!userId || typeof userId !== 'string') {
    return { valid: false, error: 'User ID is required' };
  }
  if (!UUID_REGEX.test(userId)) {
    return { valid: false, error: 'Invalid user ID format' };
  }
  return { valid: true };
};

/**
 * Validate profile data
 */
const validateProfileData = (data) => {
  const errors = [];

  if (data.xp !== undefined && (typeof data.xp !== 'number' || data.xp < 0)) {
    errors.push('XP must be a non-negative number');
  }
  if (data.level !== undefined && (typeof data.level !== 'number' || data.level < 1)) {
    errors.push('Level must be a positive number');
  }
  if (data.currentDay !== undefined && (typeof data.currentDay !== 'number' || data.currentDay < 1)) {
    errors.push('Current day must be a positive number');
  }
  if (data.currentStreak !== undefined && (typeof data.currentStreak !== 'number' || data.currentStreak < 0)) {
    errors.push('Current streak must be a non-negative number');
  }
  if (data.habits !== undefined && !Array.isArray(data.habits)) {
    errors.push('Habits must be an array');
  }
  if (data.username !== undefined && typeof data.username !== 'string') {
    errors.push('Username must be a string');
  }
  if (data.archetype !== undefined && data.archetype !== null) {
    const validArchetypes = ['SPECTER', 'ASCENDANT', 'WRATH', 'SOVEREIGN'];
    if (!validArchetypes.includes(data.archetype)) {
      errors.push('Invalid archetype');
    }
  }
  if (data.difficulty !== undefined && data.difficulty !== null) {
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(data.difficulty)) {
      errors.push('Invalid difficulty');
    }
  }

  return errors.length > 0
    ? { valid: false, errors }
    : { valid: true };
};

/**
 * Validate daily log data
 */
const validateLogData = (data) => {
  const errors = [];

  if (data.dayNumber !== undefined && (typeof data.dayNumber !== 'number' || data.dayNumber < 1)) {
    errors.push('Day number must be a positive number');
  }
  if (data.xpEarned !== undefined && (typeof data.xpEarned !== 'number' || data.xpEarned < 0)) {
    errors.push('XP earned must be a non-negative number');
  }
  if (data.habits !== undefined && !Array.isArray(data.habits)) {
    errors.push('Habits must be an array');
  }
  if (data.isPerfect !== undefined && typeof data.isPerfect !== 'boolean') {
    errors.push('isPerfect must be a boolean');
  }

  return errors.length > 0
    ? { valid: false, errors }
    : { valid: true };
};

/**
 * Validate date format (YYYY-MM-DD)
 */
const validateDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') {
    return { valid: false, error: 'Date is required' };
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return { valid: false, error: 'Invalid date format (expected YYYY-MM-DD)' };
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date' };
  }
  return { valid: true };
};

// ========== OFFLINE SYNC QUEUE ==========

/**
 * Queue a sync operation for later (when offline)
 */
export const queueSync = async (operation, userId, data) => {
  try {
    const queue = JSON.parse(await AsyncStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    queue.push({
      operation,
      userId,
      data,
      timestamp: Date.now(),
      retries: 0
    });
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    if (__DEV__) {
      console.log('[Sync] Queued operation:', operation);
    }
  } catch (err) {
    console.error('[Sync] Failed to queue operation:', err);
  }
};

/**
 * Process queued sync operations
 */
export const processSyncQueue = async () => {
  try {
    const queue = JSON.parse(await AsyncStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    if (queue.length === 0) return { processed: 0, failed: 0 };

    const results = { processed: 0, failed: 0 };
    const remainingQueue = [];

    for (const item of queue) {
      let success = false;

      try {
        if (item.operation === 'saveProfile') {
          const result = await saveUserProfile(item.userId, item.data, true);
          success = result.success;
        } else if (item.operation === 'saveDailyLog') {
          const result = await saveDailyLog(item.userId, item.data.date, item.data, true);
          success = result.success;
        }
      } catch (err) {
        console.error('[Sync] Queue item failed:', err);
      }

      if (success) {
        results.processed++;
      } else {
        item.retries++;
        if (item.retries < 3) {
          remainingQueue.push(item);
        }
        results.failed++;
      }
    }

    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remainingQueue));

    if (__DEV__) {
      console.log('[Sync] Queue processed:', results);
    }

    return results;
  } catch (err) {
    console.error('[Sync] Failed to process queue:', err);
    return { processed: 0, failed: 0, error: err };
  }
};

// ========== PROFILE SYNC ==========

/**
 * Save user profile to Supabase
 * @param {string} userId - The authenticated user's ID
 * @param {object} profileData - The profile data to save
 * @param {boolean} skipQueue - Skip queueing on failure (for queue processing)
 */
export const saveUserProfile = async (userId, profileData, skipQueue = false) => {
  try {
    // Validate user ID
    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.valid) {
      return { success: false, error: { message: userIdValidation.error } };
    }

    // Validate profile data
    const profileValidation = validateProfileData(profileData);
    if (!profileValidation.valid) {
      return { success: false, error: { message: profileValidation.errors.join(', ') } };
    }

    // Debug: Check if we have a valid session
    const { data: { session } } = await supabase.auth.getSession();
    if (__DEV__) {
      console.log('[Sync] Saving profile for user:', userId);
      console.log('[Sync] Session exists:', !!session);
      console.log('[Sync] Session user:', session?.user?.id);
    }

    if (!session) {
      console.error('[Sync] No active session - cannot save');
      if (!skipQueue) {
        await queueSync('saveProfile', userId, profileData);
      }
      return { success: false, error: { message: 'No active session' }, queued: !skipQueue };
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: profileData.username,
        archetype: profileData.archetype,
        difficulty: profileData.difficulty,
        xp: profileData.xp,
        level: profileData.level,
        current_streak: profileData.currentStreak,
        longest_streak: profileData.longestStreak,
        day_started: profileData.dayStarted,
        current_day: profileData.currentDay,
        habits: profileData.habits,
        achievements: profileData.achievements,
        total_days_completed: profileData.totalDaysCompleted,
        perfect_days_count: profileData.perfectDaysCount,
        total_xp_earned: profileData.totalXPEarned,
        commitment_answers: profileData.commitmentAnswers,
        last_completed_date: profileData.lastCompletedDate,
        day_locked_at: profileData.dayLockedAt,
        last_submit_date: profileData.lastSubmitDate,
        last_celebration_date: profileData.lastCelebrationDate,
        daily_side_quests: profileData.dailySideQuests,
        completed_side_quests: profileData.completedSideQuests,
        side_quests_date: profileData.sideQuestsDate,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('[Sync] Error saving profile:', error.message, error.code, error.details);
      return { success: false, error };
    }

    if (__DEV__) {
      console.log('[Sync] Profile saved successfully');
    }
    return { success: true };
  } catch (err) {
    console.error('[Sync] Exception saving profile:', err);
    return { success: false, error: err };
  }
};

/**
 * Load user profile from Supabase
 * @param {string} userId - The authenticated user's ID
 */
export const loadUserProfile = async (userId) => {
  try {
    // Validate user ID
    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.valid) {
      return { success: false, error: { message: userIdValidation.error } };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // No profile found is not an error - user might be new
      if (error.code === 'PGRST116') {
        return { success: true, data: null };
      }
      console.error('Error loading profile:', error);
      return { success: false, error };
    }

    // Transform database columns to store format
    const profileData = data ? {
      username: data.username,
      archetype: data.archetype,
      difficulty: data.difficulty,
      xp: data.xp || 0,
      level: data.level || 1,
      currentStreak: data.current_streak || 0,
      longestStreak: data.longest_streak || 0,
      dayStarted: data.day_started,
      currentDay: data.current_day || 1,
      habits: data.habits || [],
      achievements: data.achievements || {
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
      totalDaysCompleted: data.total_days_completed || 0,
      perfectDaysCount: data.perfect_days_count || 0,
      totalXPEarned: data.total_xp_earned || 0,
      commitmentAnswers: data.commitment_answers,
      onboardingComplete: Boolean(data.habits && data.habits.length > 0),
      lastCompletedDate: data.last_completed_date,
      dayLockedAt: data.day_locked_at,
      lastSubmitDate: data.last_submit_date,
      lastCelebrationDate: data.last_celebration_date,
      dailySideQuests: data.daily_side_quests || [],
      completedSideQuests: data.completed_side_quests || [],
      sideQuestsDate: data.side_quests_date
    } : null;

    return { success: true, data: profileData };
  } catch (err) {
    console.error('Exception loading profile:', err);
    return { success: false, error: err };
  }
};

// ========== DAILY LOG SYNC ==========

/**
 * Save a daily log entry to Supabase
 * @param {string} userId - The authenticated user's ID
 * @param {string} date - The date string (YYYY-MM-DD)
 * @param {object} logData - The daily log data
 * @param {boolean} skipQueue - Skip queueing on failure (for queue processing)
 */
export const saveDailyLog = async (userId, date, logData, skipQueue = false) => {
  try {
    // Validate user ID
    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.valid) {
      return { success: false, error: { message: userIdValidation.error } };
    }

    // Validate date
    const dateValidation = validateDate(date);
    if (!dateValidation.valid) {
      return { success: false, error: { message: dateValidation.error } };
    }

    // Validate log data
    const logValidation = validateLogData(logData);
    if (!logValidation.valid) {
      return { success: false, error: { message: logValidation.errors.join(', ') } };
    }

    const { error } = await supabase
      .from('daily_logs')
      .upsert({
        user_id: userId,
        date: date,
        day_number: logData.dayNumber,
        habits: logData.habits,
        xp_earned: logData.xpEarned,
        is_perfect: logData.isPerfect,
        successful_count: logData.successfulCount,
        total_count: logData.totalCount,
        relapse_count: logData.relapseCount
      }, {
        onConflict: 'user_id,date'
      });

    if (error) {
      console.error('Error saving daily log:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error('Exception saving daily log:', err);
    return { success: false, error: err };
  }
};

/**
 * Load all daily logs for a user from Supabase
 * @param {string} userId - The authenticated user's ID
 */
export const loadDailyLogs = async (userId) => {
  try {
    // Validate user ID
    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.valid) {
      return { success: false, error: { message: userIdValidation.error } };
    }

    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error loading daily logs:', error);
      return { success: false, error };
    }

    // Transform to store format
    const logs = (data || []).map(log => ({
      date: log.date,
      dayNumber: log.day_number,
      habits: log.habits || [],
      xpEarned: log.xp_earned || 0,
      isPerfect: log.is_perfect || false,
      successfulCount: log.successful_count || 0,
      totalCount: log.total_count || 0,
      relapseCount: log.relapse_count || 0
    }));

    return { success: true, data: logs };
  } catch (err) {
    console.error('Exception loading daily logs:', err);
    return { success: false, error: err };
  }
};

// ========== FULL SYNC ==========

/**
 * Perform a full sync - load from Supabase and merge with local
 * @param {string} userId - The authenticated user's ID
 */
export const fullSync = async (userId) => {
  const [profileResult, logsResult] = await Promise.all([
    loadUserProfile(userId),
    loadDailyLogs(userId)
  ]);

  return {
    profile: profileResult,
    dailyLogs: logsResult
  };
};

/**
 * Save all data to Supabase
 * @param {string} userId - The authenticated user's ID
 * @param {object} storeState - The full store state
 */
export const saveAllData = async (userId, storeState) => {
  // Save profile
  const profileResult = await saveUserProfile(userId, storeState);

  // Save all daily logs
  const logPromises = (storeState.dayHistory || []).map(log =>
    saveDailyLog(userId, log.date, log)
  );

  const logResults = await Promise.all(logPromises);
  const allLogsSuccess = logResults.every(r => r.success);

  return {
    profile: profileResult,
    dailyLogs: { success: allLogsSuccess }
  };
};

/**
 * Delete all user data from Supabase (for account reset)
 * @param {string} userId - The authenticated user's ID
 */
export const deleteUserData = async (userId) => {
  try {
    // Delete daily logs first (foreign key constraint)
    const { error: logsError } = await supabase
      .from('daily_logs')
      .delete()
      .eq('user_id', userId);

    if (logsError) {
      console.error('Error deleting daily logs:', logsError);
    }

    // Delete profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      return { success: false, error: profileError };
    }

    return { success: true };
  } catch (err) {
    console.error('Exception deleting user data:', err);
    return { success: false, error: err };
  }
};
