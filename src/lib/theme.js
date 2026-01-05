// HabitQuest Theme - Matching web app colors

export const colors = {
  // Base
  background: '#000000',
  surface: '#111111',
  surfaceLight: '#1a1a1a',
  card: '#0d0d0d',

  // Text
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',

  // Archetype Colors
  archetypes: {
    SHADOW: '#6366f1',      // Indigo
    ASCENDANT: '#22c55e',   // Green
    WRATH: '#ef4444',       // Red
    SOVEREIGN: '#eab308',   // Yellow/Gold
  },

  // Status Colors
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',

  // Habit Types
  demon: '#ef4444',
  power: '#22c55e',

  // UI Elements
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.2)',

  // Gradients (as array for LinearGradient)
  gradients: {
    shadow: ['#6366f1', '#4f46e5'],
    ascendant: ['#22c55e', '#16a34a'],
    wrath: ['#ef4444', '#dc2626'],
    sovereign: ['#eab308', '#ca8a04'],
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  fontFamily: {
    regular: 'System',
    bold: 'System',
    // Will be replaced with custom fonts later
    heading: 'System',
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  }
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Common component styles
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: typography.sizes.md,
    fontWeight: 'bold',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: typography.sizes.md,
  },
};

export default { colors, spacing, typography, borderRadius, commonStyles };
