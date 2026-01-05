import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import useGameStore from '../context/useGameStore';
import { useAuth } from '../hooks/useAuth';
import { CLASSES, XP_PER_LEVEL } from '../data/gameData';

// Achievement definitions
const ACHIEVEMENTS = [
  {
    id: 'firstBlood',
    name: 'First Blood',
    description: 'Complete your first day',
    icon: '[1]',
    unlockText: 'Complete 1 day',
  },
  {
    id: 'weekWarrior',
    name: 'Week Warrior',
    description: '7 day streak',
    icon: '[7]',
    unlockText: 'Reach 7 day streak',
  },
  {
    id: 'twoWeeks',
    name: 'Two Weeks',
    description: '14 day streak',
    icon: '/\\',
    unlockText: 'Reach 14 day streak',
  },
  {
    id: 'monthly',
    name: 'Monthly',
    description: '30 day streak',
    icon: '||',
    unlockText: 'Reach 30 day streak',
  },
  {
    id: 'lockedIn',
    name: 'Locked In',
    description: '45 day streak',
    icon: '[#]',
    unlockText: 'Reach 45 day streak',
  },
  {
    id: 'forged',
    name: 'FORGED',
    description: '66 day streak',
    icon: 'XX',
    unlockText: 'Reach 66 day streak',
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: '100 day streak',
    icon: '100',
    unlockText: 'Reach 100 day streak',
  },
  {
    id: 'perfectWeek',
    name: 'Perfect Week',
    description: '7 perfect days',
    icon: '*7',
    unlockText: 'Get 7 consecutive perfect days',
  },
  {
    id: 'perfectMonth',
    name: 'Perfect Month',
    description: '30 perfect days',
    icon: '*30',
    unlockText: 'Get 30 perfect days',
  },
];

const ArsenalScreen = () => {
  const { signOut } = useAuth();
  const [habitsExpanded, setHabitsExpanded] = useState(false);
  const [achievementsExpanded, setAchievementsExpanded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const username = useGameStore((state) => state.username);
  const archetype = useGameStore((state) => state.archetype);
  const level = useGameStore((state) => state.level);
  const xp = useGameStore((state) => state.xp);
  const currentStreak = useGameStore((state) => state.currentStreak);
  const longestStreak = useGameStore((state) => state.longestStreak);
  const habits = useGameStore((state) => state.habits);
  const dayHistory = useGameStore((state) => state.dayHistory) || [];
  const achievements = useGameStore((state) => state.achievements) || {};
  const totalDaysCompleted = useGameStore((state) => state.totalDaysCompleted) || 0;
  const perfectDaysCount = useGameStore((state) => state.perfectDaysCount) || 0;
  const totalXPEarned = useGameStore((state) => state.totalXPEarned) || 0;
  const resetGame = useGameStore((state) => state.resetGame);

  const archetypeData = CLASSES[archetype] || CLASSES.SPECTER;
  const accentColor = archetypeData?.colors?.accent || '#8a8a8a';

  // Calculate level progress
  const levelProgress = useMemo(() => {
    const currentLevelXP = xp % XP_PER_LEVEL;
    const percentage = (currentLevelXP / XP_PER_LEVEL) * 100;
    return { current: currentLevelXP, total: XP_PER_LEVEL, percentage };
  }, [xp]);

  // Get current rank
  const currentRank = useMemo(() => {
    if (!archetypeData) return '';
    const rankIndex = Math.min(
      Math.floor((level - 1) / 5),
      archetypeData.ranks.length - 1
    );
    return archetypeData.ranks[rankIndex];
  }, [level, archetypeData]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalRelapses = habits.reduce((sum, h) => sum + (h.relapses || 0), 0);
    return {
      currentStreak: currentStreak || 0,
      longestStreak: longestStreak || 0,
      totalDays: totalDaysCompleted || dayHistory.length,
      perfectDays: perfectDaysCount || dayHistory.filter((d) => d.isPerfect).length,
      totalRelapses,
      totalXP: totalXPEarned || xp,
    };
  }, [
    currentStreak,
    longestStreak,
    totalDaysCompleted,
    perfectDaysCount,
    totalXPEarned,
    dayHistory,
    habits,
    xp,
  ]);

  // Sort habits by streak
  const sortedHabits = useMemo(() => {
    return [...habits].sort((a, b) => (b.streak || 0) - (a.streak || 0));
  }, [habits]);

  // Achievement status
  const achievementStatus = useMemo(() => {
    return ACHIEVEMENTS.map((achievement) => ({
      ...achievement,
      unlocked: achievements[achievement.id] || false,
    }));
  }, [achievements]);

  const unlockedCount = achievementStatus.filter((a) => a.unlocked).length;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        onPress: async () => {
          setSettingsOpen(false);
          await signOut();
        },
      },
    ]);
  };

  const handleReset = () => {
    setShowResetConfirm(false);
    setSettingsOpen(false);
    resetGame();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileSection}>
          <View
            style={[
              styles.avatarContainer,
              { borderColor: accentColor },
            ]}
          >
            <Text style={[styles.avatarIcon, { color: accentColor }]}>
              {archetypeData?.icon || '///'}
            </Text>
          </View>

          <Text style={styles.username}>{username || 'Warrior'}</Text>

          <View style={styles.archetypeInfo}>
            <Text style={[styles.archetypeName, { color: accentColor }]}>
              {archetypeData?.name?.toUpperCase() || 'SPECTER'}
            </Text>
            <Text style={styles.separator}>|</Text>
            <Text style={styles.rankName}>{currentRank?.toUpperCase() || 'INITIATE'}</Text>
          </View>

          {/* Level & XP Bar */}
          <View style={styles.levelContainer}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelText}>Level {level || 1}</Text>
              <Text style={styles.xpText}>
                {levelProgress.current}/{levelProgress.total} XP
              </Text>
            </View>
            <View style={styles.xpBarBg}>
              <View
                style={[
                  styles.xpBarFill,
                  {
                    width: `${levelProgress.percentage}%`,
                    backgroundColor: accentColor,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={[styles.statIcon, { color: '#f97316' }]}>/\</Text>
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>CURRENT STREAK</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statIcon, { color: '#eab308' }]}>V</Text>
              <Text style={styles.statValue}>{stats.longestStreak}</Text>
              <Text style={styles.statLabel}>LONGEST STREAK</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statIcon, { color: '#3b82f6' }]}>[=]</Text>
              <Text style={styles.statValue}>{stats.totalDays}</Text>
              <Text style={styles.statLabel}>TOTAL DAYS</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statIcon, { color: '#22c55e' }]}>*</Text>
              <Text style={styles.statValue}>{stats.perfectDays}</Text>
              <Text style={styles.statLabel}>PERFECT DAYS</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statIcon, { color: '#ef4444' }]}>!</Text>
              <Text style={styles.statValue}>{stats.totalRelapses}</Text>
              <Text style={styles.statLabel}>TOTAL RELAPSES</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statIcon, { color: '#a855f7' }]}>+</Text>
              <Text style={styles.statValue}>
                {stats.totalXP.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>TOTAL XP</Text>
            </View>
          </View>
        </View>

        {/* Habit Stats - Collapsible */}
        <View style={styles.collapsibleSection}>
          <TouchableOpacity
            style={styles.collapsibleHeader}
            onPress={() => setHabitsExpanded(!habitsExpanded)}
            activeOpacity={0.7}
          >
            <View style={styles.headerLeft}>
              <Text style={[styles.headerIcon, { color: accentColor }]}>[+]</Text>
              <Text style={styles.sectionTitle}>HABIT STATS</Text>
              <Text style={styles.sectionCount}>{habits.length}</Text>
            </View>
            <Text style={styles.chevron}>{habitsExpanded ? 'v' : '>'}</Text>
          </TouchableOpacity>

          {habitsExpanded && (
            <View style={styles.collapsibleContent}>
              {sortedHabits.map((habit) => (
                <View key={habit.id} style={styles.habitCard}>
                  <View style={styles.habitHeader}>
                    <Text
                      style={[
                        styles.habitType,
                        { color: habit.type === 'demon' ? '#ef4444' : '#22c55e' },
                      ]}
                    >
                      {habit.type === 'demon' ? 'X' : '+'}
                    </Text>
                    <Text style={styles.habitName}>{habit.name}</Text>
                  </View>
                  <View style={styles.habitStats}>
                    <View style={styles.habitStat}>
                      <Text style={styles.habitStatLabel}>STREAK</Text>
                      <Text style={[styles.habitStatValue, { color: accentColor }]}>
                        {habit.streak || 0}
                      </Text>
                    </View>
                    <View style={styles.habitStat}>
                      <Text style={styles.habitStatLabel}>BEST</Text>
                      <Text style={styles.habitStatValue}>
                        {habit.longestStreak || 0}
                      </Text>
                    </View>
                    {habit.type === 'demon' && (
                      <View style={styles.habitStat}>
                        <Text style={styles.habitStatLabel}>RELAPSES</Text>
                        <Text style={[styles.habitStatValue, { color: '#ef4444' }]}>
                          {habit.relapses || 0}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Achievements - Collapsible */}
        <View style={styles.collapsibleSection}>
          <TouchableOpacity
            style={styles.collapsibleHeader}
            onPress={() => setAchievementsExpanded(!achievementsExpanded)}
            activeOpacity={0.7}
          >
            <View style={styles.headerLeft}>
              <Text style={[styles.headerIcon, { color: '#eab308' }]}>V</Text>
              <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
              <Text style={styles.sectionCount}>
                {unlockedCount}/{ACHIEVEMENTS.length}
              </Text>
            </View>
            <Text style={styles.chevron}>{achievementsExpanded ? 'v' : '>'}</Text>
          </TouchableOpacity>

          {achievementsExpanded && (
            <View style={styles.achievementsGrid}>
              {achievementStatus.map((achievement) => (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                    {
                      opacity: achievement.unlocked ? 1 : 0.4,
                      borderColor: achievement.unlocked ? '#fbbf24' : '#333333',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.achievementIcon,
                      { color: achievement.unlocked ? '#fbbf24' : '#555555' },
                    ]}
                  >
                    {achievement.icon}
                  </Text>
                  <Text
                    style={[
                      styles.achievementName,
                      { color: achievement.unlocked ? '#ffffff' : '#666666' },
                    ]}
                  >
                    {achievement.name}
                  </Text>
                  <Text style={styles.achievementDesc}>
                    {achievement.unlocked
                      ? achievement.description
                      : achievement.unlockText}
                  </Text>
                  {achievement.unlocked && (
                    <View style={styles.unlockedBadge}>
                      <Text style={styles.unlockedBadgeText}>V</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Settings & Sign Out Buttons */}
        <View style={styles.buttonsSection}>
          <TouchableOpacity
            style={[styles.settingsButton, { borderColor: accentColor }]}
            onPress={() => setSettingsOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonIcon, { color: accentColor }]}>[=]</Text>
            <Text style={styles.buttonText}>SETTINGS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonIcon}>[&lt;-</Text>
            <Text style={styles.buttonText}>SIGN OUT</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>HabitQuest v1.0.0</Text>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={settingsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSettingsOpen(false)}
        >
          <View style={styles.modal} onStartShouldSetResponder={() => true}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setSettingsOpen(false)}
            >
              <Text style={styles.modalCloseText}>X</Text>
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { color: accentColor }]}>
              SETTINGS
            </Text>

            {/* Reset Button */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingIcon, { color: '#ef4444' }]}>[R]</Text>
                <Text style={styles.settingLabel}>Reset Progress</Text>
              </View>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => setShowResetConfirm(true)}
              >
                <Text style={styles.resetButtonText}>Start Over</Text>
              </TouchableOpacity>
            </View>

            {/* Sign Out */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>[&lt;-</Text>
                <Text style={styles.settingLabel}>Sign Out</Text>
              </View>
              <TouchableOpacity
                style={styles.signOutSettingButton}
                onPress={handleSignOut}
              >
                <Text style={styles.signOutSettingText}>Sign Out</Text>
              </TouchableOpacity>
            </View>

            {/* About */}
            <View style={styles.aboutSection}>
              <Text style={styles.aboutIcon}>[i]</Text>
              <View style={styles.aboutText}>
                <Text style={styles.appName}>HabitQuest</Text>
                <Text style={styles.appVersion}>Version 1.0.0</Text>
                <Text style={styles.appCredits}>Built with discipline</Text>
              </View>
            </View>

            {/* Reset Confirmation */}
            {showResetConfirm && (
              <View style={styles.confirmOverlay}>
                <View style={styles.confirmBox}>
                  <Text style={styles.confirmTitle}>Are you sure?</Text>
                  <Text style={styles.confirmText}>
                    This will delete ALL your progress, streaks, and achievements.
                    This cannot be undone.
                  </Text>
                  <View style={styles.confirmButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setShowResetConfirm(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.confirmResetButton}
                      onPress={handleReset}
                    >
                      <Text style={styles.confirmResetText}>Reset Everything</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    marginBottom: 16,
  },
  avatarIcon: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  username: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 4,
    color: '#ffffff',
  },
  archetypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  archetypeName: {
    fontSize: 14,
    letterSpacing: 2,
    fontWeight: '600',
  },
  separator: {
    color: '#444444',
  },
  rankName: {
    fontSize: 14,
    letterSpacing: 2,
    color: '#888888',
    fontWeight: '600',
  },
  levelContainer: {
    width: '80%',
    maxWidth: 280,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  levelText: {
    fontSize: 14,
    color: '#ffffff',
    letterSpacing: 1,
    fontWeight: '600',
  },
  xpText: {
    fontSize: 12,
    color: '#666666',
  },
  xpBarBg: {
    height: 6,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '31%',
    alignItems: 'center',
    gap: 6,
    padding: 16,
    paddingHorizontal: 8,
    backgroundColor: '#1a1a1a',
  },
  statIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '600',
    lineHeight: 28,
  },
  statLabel: {
    fontSize: 9,
    color: '#666666',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  collapsibleSection: {
    marginBottom: 16,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#1a1a1a',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#888888',
    letterSpacing: 2,
    fontWeight: '600',
  },
  sectionCount: {
    fontSize: 12,
    color: '#555555',
  },
  chevron: {
    fontSize: 14,
    color: '#666666',
  },
  collapsibleContent: {
    marginTop: 8,
    gap: 8,
  },
  habitCard: {
    padding: 14,
    backgroundColor: '#111111',
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  habitType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  habitName: {
    fontSize: 14,
    color: '#cccccc',
  },
  habitStats: {
    flexDirection: 'row',
    gap: 20,
  },
  habitStat: {
    gap: 2,
  },
  habitStatLabel: {
    fontSize: 10,
    color: '#555555',
    letterSpacing: 0.5,
  },
  habitStatValue: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 12,
  },
  achievementCard: {
    width: '31%',
    alignItems: 'center',
    padding: 14,
    paddingHorizontal: 8,
    backgroundColor: '#111111',
    borderWidth: 1,
  },
  achievementIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  achievementName: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 8,
    color: '#555555',
    textAlign: 'center',
  },
  unlockedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedBadgeText: {
    fontSize: 8,
    color: '#000000',
    fontWeight: 'bold',
  },
  buttonsSection: {
    marginTop: 24,
    marginBottom: 16,
    gap: 12,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333333',
  },
  buttonIcon: {
    fontSize: 14,
    color: '#888888',
    fontWeight: 'bold',
  },
  buttonText: {
    fontSize: 14,
    color: '#888888',
    letterSpacing: 2,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#444444',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#111111',
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666666',
  },
  modalTitle: {
    fontSize: 24,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    fontSize: 14,
    color: '#888888',
    fontWeight: 'bold',
  },
  settingLabel: {
    fontSize: 14,
    color: '#cccccc',
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#7f1d1d',
  },
  resetButtonText: {
    fontSize: 12,
    color: '#ef4444',
  },
  signOutSettingButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#444444',
  },
  signOutSettingText: {
    fontSize: 12,
    color: '#888888',
  },
  aboutSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 24,
    padding: 16,
    backgroundColor: '#0a0a0a',
  },
  aboutIcon: {
    fontSize: 14,
    color: '#555555',
  },
  aboutText: {
    gap: 2,
  },
  appName: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '600',
  },
  appVersion: {
    fontSize: 12,
    color: '#555555',
  },
  appCredits: {
    fontSize: 10,
    color: '#444444',
    fontStyle: 'italic',
  },
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  confirmBox: {
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 20,
    color: '#ef4444',
    letterSpacing: 2,
    marginBottom: 12,
    fontWeight: '600',
  },
  confirmText: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'center',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#333333',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#ffffff',
  },
  confirmResetButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#7f1d1d',
  },
  confirmResetText: {
    fontSize: 14,
    color: '#ffffff',
  },
});

export default ArsenalScreen;
