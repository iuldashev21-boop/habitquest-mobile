/**
 * Centralized date handling utilities
 * All date operations should use these helpers to ensure consistency
 * and avoid timezone-related bugs (especially near midnight)
 */

/**
 * Get today's date as YYYY-MM-DD string in local timezone
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const getTodayYMD = () => {
  const now = new Date();
  return formatDateYMD(now);
};

/**
 * Format a Date object to YYYY-MM-DD string in local timezone
 * @param {Date} date - The date to format
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const formatDateYMD = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse a YYYY-MM-DD string to a Date object at midnight local time
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date|null} Date object or null if invalid
 */
export const parseLocalDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') {
    return null;
  }
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }
  const [, year, month, day] = match;
  // Create date at midnight local time (not UTC)
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Get start of day (midnight) for a given date in local timezone
 * @param {Date} date - The date to get start of day for
 * @returns {Date} New Date object at midnight local time
 */
export const startOfLocalDay = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Check if two dates are the same calendar day in local timezone
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if same day
 */
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  return formatDateYMD(date1) === formatDateYMD(date2);
};

/**
 * Get a Date object for N days ago from today
 * @param {number} daysAgo - Number of days in the past
 * @returns {Date} Date object for that day at midnight local time
 */
export const getDaysAgo = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return startOfLocalDay(date);
};

/**
 * Get the day of week (0 = Sunday, 6 = Saturday)
 * @param {Date|string} date - Date object or YYYY-MM-DD string
 * @returns {number} Day of week (0-6)
 */
export const getDayOfWeek = (date) => {
  const parsedDate = typeof date === 'string' ? parseLocalDate(date) : date;
  if (!parsedDate) return null;
  return parsedDate.getDay();
};

/**
 * Check if a date is a weekday (Monday-Friday)
 * @param {Date|string} date - Date object or YYYY-MM-DD string
 * @returns {boolean} True if weekday
 */
export const isWeekday = (date) => {
  const day = getDayOfWeek(date);
  return day !== null && day !== 0 && day !== 6;
};

/**
 * Check if a date is a weekend (Saturday-Sunday)
 * @param {Date|string} date - Date object or YYYY-MM-DD string
 * @returns {boolean} True if weekend
 */
export const isWeekend = (date) => {
  const day = getDayOfWeek(date);
  return day === 0 || day === 6;
};

/**
 * Calculate days between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Number of days between dates (positive if date2 > date1)
 */
export const daysBetween = (date1, date2) => {
  const parsedDate1 = typeof date1 === 'string' ? parseLocalDate(date1) : date1;
  const parsedDate2 = typeof date2 === 'string' ? parseLocalDate(date2) : date2;
  if (!parsedDate1 || !parsedDate2) return null;

  const start = startOfLocalDay(parsedDate1);
  const end = startOfLocalDay(parsedDate2);
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Format date for user-facing display with locale support
 * @param {Date|string} date - Date object or YYYY-MM-DD string
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Localized date string
 */
export const formatDateForDisplay = (date, options = {}) => {
  const parsedDate = typeof date === 'string' ? parseLocalDate(date) : date;
  if (!parsedDate) return '';

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };

  try {
    return parsedDate.toLocaleDateString(undefined, defaultOptions);
  } catch (e) {
    // Fallback for environments without Intl support
    return formatDateYMD(parsedDate);
  }
};

/**
 * Format date with short month for compact display
 * @param {Date|string} date - Date object or YYYY-MM-DD string
 * @returns {string} Short date string (e.g., "Jan 5")
 */
export const formatDateShort = (date) => {
  return formatDateForDisplay(date, { month: 'short', day: 'numeric' });
};

/**
 * Get relative day description (Today, Yesterday, or formatted date)
 * @param {Date|string} date - Date object or YYYY-MM-DD string
 * @returns {string} Relative or formatted date string
 */
export const getRelativeDay = (date) => {
  const parsedDate = typeof date === 'string' ? parseLocalDate(date) : date;
  if (!parsedDate) return '';

  const today = startOfLocalDay(new Date());
  const dateStart = startOfLocalDay(parsedDate);
  const diffDays = Math.round((today - dateStart) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return formatDateShort(parsedDate);
};

/**
 * Check if a date is today in local timezone
 * @param {Date|string} date - Date object or YYYY-MM-DD string
 * @returns {boolean} True if the date is today
 */
export const isToday = (date) => {
  return formatDateYMD(typeof date === 'string' ? parseLocalDate(date) : date) === getTodayYMD();
};

/**
 * Check if a date is yesterday in local timezone
 * @param {Date|string} date - Date object or YYYY-MM-DD string
 * @returns {boolean} True if the date is yesterday
 */
export const isYesterday = (date) => {
  const parsedDate = typeof date === 'string' ? parseLocalDate(date) : date;
  if (!parsedDate) return false;

  const yesterday = getDaysAgo(1);
  return formatDateYMD(parsedDate) === formatDateYMD(yesterday);
};

/**
 * Get the start of the current week (Sunday) in local timezone
 * @returns {Date} Date at midnight on Sunday of current week
 */
export const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  const sunday = new Date(now.setDate(diff));
  return startOfLocalDay(sunday);
};

/**
 * Get the start of the current month in local timezone
 * @returns {Date} Date at midnight on first day of current month
 */
export const getStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};
