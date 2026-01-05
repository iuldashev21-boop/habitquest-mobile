import AsyncStorage from '@react-native-async-storage/async-storage';

// Prefix for all HabitQuest keys
const HABITQUEST_PREFIXES = [
  'habitquest-',
  'game-store',
  'supabase.auth',
];

/**
 * Clear only HabitQuest-related storage
 * @returns {Promise<number>} Number of keys removed
 */
export const clearHabitQuestStorage = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const keysToRemove = allKeys.filter(key =>
      HABITQUEST_PREFIXES.some(prefix => key.startsWith(prefix))
    );

    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }

    return keysToRemove.length;
  } catch (error) {
    console.error('Error clearing HabitQuest storage:', error);
    return 0;
  }
};

/**
 * Get item from AsyncStorage
 */
export const getItem = async (key) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error('Error getting item:', error);
    return null;
  }
};

/**
 * Set item in AsyncStorage
 */
export const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error('Error setting item:', error);
    return false;
  }
};

/**
 * Remove item from AsyncStorage
 */
export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing item:', error);
    return false;
  }
};
