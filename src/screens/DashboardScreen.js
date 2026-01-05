import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import useGameStore from '../context/useGameStore';
import { CLASSES, XP_PER_LEVEL, SIDE_QUESTS, SIDE_QUESTS_PER_DAY, getPhase, isScheduledDay } from '../data/gameData';

const DashboardScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [demonsExpanded, setDemonsExpanded] = useState(true);
  const [powersExpanded, setPowersExpanded] = useState(true);
  const [sideQuestsExpanded, setSideQuestsExpanded] = useState(false);
  const [countdown, setCountdown] = useState('');

  // Ref to track if component is mounted (prevents memory leaks)
  const isMountedRef = useRef(true);
  const countdownIntervalRef = useRef(null);

  const username = useGameStore((state) => state.username);
  const archetype = useGameStore((state) => state.archetype);
  const habits = useGameStore((state) => state.habits);
  const xp = useGameStore((state) => state.xp);
  const level = useGameStore((state) => state.level);
  const currentStreak = useGameStore((state) => state.currentStreak);
  const currentDay = useGameStore((state) => state.currentDay);
  const dayLockedAt = useGameStore((state) => state.dayLockedAt);
  const dailySideQuests = useGameStore((state) => state.dailySideQuests);
  const completeHabit = useGameStore((state) => state.completeHabit);
  const logRelapse = useGameStore((state) => state.logRelapse);
  const markDayCompleted = useGameStore((state) => state.markDayCompleted);
  const checkAndResetDay = useGameStore((state) => state.checkAndResetDay);
  const completeSideQuest = useGameStore((state) => state.completeSideQuest);

  const archetypeData = CLASSES[archetype] || {};
  const archetypeColor = archetypeData.colors?.accent || '#ffffff';

  // Phase info
  const phase = getPhase(currentDay);

  // Track mounted state for cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Clear any pending intervals on unmount
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, []);

  // Check for day reset on mount
  useEffect(() => {
    checkAndResetDay();
  }, []);

  // Countdown timer for locked day
  useEffect(() => {
    // Clear existing interval before setting up new one
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (!dayLockedAt) {
      if (isMountedRef.current) {
        setCountdown('');
      }
      return;
    }

    const updateCountdown = () => {
      // Only update state if component is still mounted
      if (!isMountedRef.current) return;

      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow - now;
      if (diff <= 0) {
        setCountdown('00:00:00');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      );
    };

    updateCountdown();
    countdownIntervalRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [dayLockedAt]);

  const onRefresh = async () => {
    setRefreshing(true);
    checkAndResetDay();
    setRefreshing(false);
  };

  // Filter habits for today
  const todaysHabits = habits.filter((h) => isScheduledDay(h.frequency || 'daily'));
  const demons = todaysHabits.filter((h) => h.type === 'demon');
  const powers = todaysHabits.filter((h) => h.type === 'power');

  // Check if all habits are handled
  const allHandled = todaysHabits.every(
    (h) => h.completed || (h.type === 'demon' && h.relapsedToday)
  );

  const isDayLocked = !!dayLockedAt;

  // Calculate level progress
  const xpInLevel = xp % XP_PER_LEVEL;
  const progressPercent = (xpInLevel / XP_PER_LEVEL) * 100;

  // Get rank
  const rankIndex = Math.min(
    Math.floor((level - 1) / 5),
    (archetypeData?.ranks?.length || 1) - 1
  );
  const rank = archetypeData?.ranks?.[rankIndex] || 'Initiate';

  // Calculate XP earned today
  const todayXP = todaysHabits
    .filter(h => h.completed)
    .reduce((sum, h) => sum + (h.xp || 0), 0);

  const completedCount = todaysHabits.filter(h => h.completed).length;

  // Get today's date formatted
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleClean = (habit) => {
    if (isDayLocked || habit.completed) return;
    completeHabit(habit.id);
  };

  const handleRelapse = (habit) => {
    if (isDayLocked || habit.relapsedToday) return;
    logRelapse(habit.id);
  };

  const handlePowerComplete = (habit) => {
    if (isDayLocked || habit.completed) return;
    completeHabit(habit.id);
  };

  const handleSubmitDay = () => {
    if (!allHandled || isDayLocked) return;
    markDayCompleted();
  };

  const handleSideQuestComplete = (questId) => {
    if (isDayLocked) return;
    completeSideQuest(questId);
  };

  // Get side quests for today
  const todaysSideQuests = dailySideQuests || [];
  const completedSideQuests = todaysSideQuests.filter(q => q.completed).length;

  // Day Complete View
  if (isDayLocked) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Minimal Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.avatar, { borderColor: archetypeColor }]}>
                <Text style={styles.avatarText}>
                  {archetypeData.emoji || '⚔'}
                </Text>
              </View>
              <View>
                <Text style={[styles.username, { color: archetypeColor }]}>
                  {username}
                </Text>
                <Text style={styles.rankText}>{rank}</Text>
              </View>
            </View>
          </View>

          {/* Day Complete Card */}
          <View style={styles.dayCompleteCard}>
            <View style={[styles.completeIcon, { borderColor: archetypeColor }]}>
              <Text style={styles.completeIconText}>✓</Text>
            </View>
            <Text style={styles.dayCompleteTitle}>DAY {currentDay} COMPLETE</Text>
            <View style={styles.completeStats}>
              <View style={styles.completeStat}>
                <Text style={[styles.completeStatValue, { color: archetypeColor }]}>
                  +{todayXP}
                </Text>
                <Text style={styles.completeStatLabel}>XP EARNED</Text>
              </View>
              <View style={styles.completeStatDivider} />
              <View style={styles.completeStat}>
                <Text style={styles.completeStatValue}>{currentStreak}</Text>
                <Text style={styles.completeStatLabel}>DAY STREAK</Text>
              </View>
            </View>
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownLabel}>Next day in</Text>
              <Text style={[styles.countdownTime, { color: archetypeColor }]}>
                {countdown}
              </Text>
            </View>
          </View>

          {/* Side Quests Still Available */}
          {todaysSideQuests.length > 0 && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.sectionHeaderButton}
                onPress={() => setSideQuestsExpanded(!sideQuestsExpanded)}
              >
                <View style={styles.sectionHeaderLeft}>
                  <Text style={[styles.sectionIcon, { color: archetypeColor }]}>◆</Text>
                  <Text style={[styles.sectionTitle, { color: archetypeColor }]}>
                    SIDE QUESTS
                  </Text>
                </View>
                <View style={styles.sectionHeaderRight}>
                  <Text style={styles.sectionCount}>
                    {completedSideQuests}/{todaysSideQuests.length}
                  </Text>
                  <Text style={styles.chevron}>
                    {sideQuestsExpanded ? '▼' : '▶'}
                  </Text>
                </View>
              </TouchableOpacity>
              {sideQuestsExpanded && (
                <View style={styles.sideQuestsContainer}>
                  {todaysSideQuests.map((quest) => (
                    <View
                      key={quest.id}
                      style={[
                        styles.sideQuestCard,
                        quest.completed && styles.sideQuestCompleted,
                      ]}
                    >
                      <Text style={styles.sideQuestName}>
                        {quest.name}
                      </Text>
                      <Text style={[styles.sideQuestXp, { color: archetypeColor }]}>
                        +{quest.xp}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.sideQuestButton,
                          quest.completed && styles.sideQuestButtonDone,
                          { borderColor: archetypeColor },
                        ]}
                        onPress={() => handleSideQuestComplete(quest.id)}
                        disabled={quest.completed}
                      >
                        <Text style={styles.sideQuestButtonText}>
                          {quest.completed ? '✓' : ''}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={archetypeColor}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatar, { borderColor: archetypeColor }]}>
              <Text style={styles.avatarText}>
                {archetypeData.emoji || '⚔'}
              </Text>
            </View>
            <View>
              <Text style={[styles.username, { color: archetypeColor }]}>
                {username}
              </Text>
              <Text style={styles.rankText}>{rank}</Text>
            </View>
          </View>
          {currentStreak >= 7 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakNumber}>{currentStreak}</Text>
            </View>
          )}
        </View>

        {/* Date */}
        <Text style={styles.dateText}>{dateString}</Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.levelSection}>
            <Text style={styles.levelLabel}>LV</Text>
            <Text style={[styles.levelValue, { color: archetypeColor }]}>{level}</Text>
          </View>
          <View style={styles.xpBarContainer}>
            <View style={styles.xpBar}>
              <View
                style={[
                  styles.xpBarFill,
                  { width: `${progressPercent}%`, backgroundColor: archetypeColor },
                ]}
              />
            </View>
            <Text style={styles.xpText}>{xpInLevel}/{XP_PER_LEVEL}</Text>
          </View>
        </View>

        {/* Phase Progress */}
        <View style={styles.phaseContainer}>
          <View style={styles.phaseHeader}>
            <Text style={styles.phaseDay}>DAY {currentDay}/66</Text>
            <Text style={[styles.phaseName, { color: archetypeColor }]}>
              {phase.name.toUpperCase()}
            </Text>
          </View>
          <View style={styles.phaseBar}>
            <View
              style={[
                styles.phaseBarFill,
                {
                  width: `${Math.min((currentDay / 66) * 100, 100)}%`,
                  backgroundColor: archetypeColor,
                },
              ]}
            />
          </View>
        </View>

        {/* Demons Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeaderButton}
            onPress={() => setDemonsExpanded(!demonsExpanded)}
          >
            <View style={styles.sectionHeaderLeft}>
              <Text style={[styles.sectionIcon, { color: '#dc2626' }]}>✕</Text>
              <Text style={[styles.sectionTitle, { color: '#dc2626' }]}>
                DEMONS TO SLAY
              </Text>
            </View>
            <Text style={styles.chevron}>
              {demonsExpanded ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {demonsExpanded && (
            <View style={styles.habitsContainer}>
              {demons.map((habit) => (
                <View
                  key={habit.id}
                  style={[
                    styles.demonCard,
                    habit.completed && styles.demonCardClean,
                    habit.relapsedToday && styles.demonCardRelapsed,
                  ]}
                >
                  <View style={styles.habitHeader}>
                    <Text
                      style={[
                        styles.habitName,
                        (habit.completed || habit.relapsedToday) && styles.habitNameDone,
                      ]}
                    >
                      {habit.name}
                    </Text>
                    <Text style={styles.habitXp}>+{habit.xp} XP</Text>
                  </View>
                  {habit.streak > 0 && (
                    <Text style={styles.habitStreak}>
                      🔥 {habit.streak} day streak
                    </Text>
                  )}
                  {!habit.completed && !habit.relapsedToday ? (
                    <View style={styles.demonButtons}>
                      <TouchableOpacity
                        style={styles.cleanButton}
                        onPress={() => handleClean(habit)}
                      >
                        <Text style={styles.cleanButtonText}>CLEAN</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.relapseButton}
                        onPress={() => handleRelapse(habit)}
                      >
                        <Text style={styles.relapseButtonText}>RELAPSE</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.statusBadge}>
                      <Text
                        style={[
                          styles.statusText,
                          { color: habit.completed ? '#22c55e' : '#dc2626' },
                        ]}
                      >
                        {habit.completed ? '✓ CLEAN' : '✕ RELAPSED'}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Powers Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeaderButton}
            onPress={() => setPowersExpanded(!powersExpanded)}
          >
            <View style={styles.sectionHeaderLeft}>
              <Text style={[styles.sectionIcon, { color: '#22c55e' }]}>+</Text>
              <Text style={[styles.sectionTitle, { color: '#22c55e' }]}>
                POWERS TO BUILD
              </Text>
            </View>
            <Text style={styles.chevron}>
              {powersExpanded ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {powersExpanded && (
            <View style={styles.habitsContainer}>
              {powers.map((habit) => (
                <View
                  key={habit.id}
                  style={[
                    styles.powerCard,
                    habit.completed && styles.powerCardDone,
                  ]}
                >
                  <View style={styles.powerContent}>
                    <View style={styles.habitHeader}>
                      <Text
                        style={[
                          styles.habitName,
                          habit.completed && styles.habitNameDone,
                        ]}
                      >
                        {habit.name}
                      </Text>
                      <Text style={[styles.habitXp, { color: '#22c55e' }]}>
                        +{habit.xp} XP
                      </Text>
                    </View>
                    {habit.streak > 0 && (
                      <Text style={styles.habitStreak}>
                        🔥 {habit.streak} day streak
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.powerButton,
                      habit.completed && styles.powerButtonDone,
                    ]}
                    onPress={() => handlePowerComplete(habit)}
                    disabled={habit.completed}
                  >
                    <Text style={styles.powerButtonText}>
                      {habit.completed ? '✓' : ''}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Side Quests Section */}
        {todaysSideQuests.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeaderButton}
              onPress={() => setSideQuestsExpanded(!sideQuestsExpanded)}
            >
              <View style={styles.sectionHeaderLeft}>
                <Text style={[styles.sectionIcon, { color: archetypeColor }]}>◆</Text>
                <Text style={[styles.sectionTitle, { color: archetypeColor }]}>
                  SIDE QUESTS
                </Text>
              </View>
              <View style={styles.sectionHeaderRight}>
                <Text style={styles.sectionCount}>
                  {completedSideQuests}/{todaysSideQuests.length}
                </Text>
                <Text style={styles.chevron}>
                  {sideQuestsExpanded ? '▼' : '▶'}
                </Text>
              </View>
            </TouchableOpacity>
            {sideQuestsExpanded && (
              <View style={styles.sideQuestsContainer}>
                {todaysSideQuests.map((quest) => (
                  <View
                    key={quest.id}
                    style={[
                      styles.sideQuestCard,
                      quest.completed && styles.sideQuestCompleted,
                    ]}
                  >
                    <Text style={styles.sideQuestName}>
                      {quest.name}
                    </Text>
                    <Text style={[styles.sideQuestXp, { color: archetypeColor }]}>
                      +{quest.xp}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.sideQuestButton,
                        quest.completed && styles.sideQuestButtonDone,
                        { borderColor: archetypeColor },
                      ]}
                      onPress={() => handleSideQuestComplete(quest.id)}
                      disabled={quest.completed}
                    >
                      <Text style={styles.sideQuestButtonText}>
                        {quest.completed ? '✓' : ''}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Submit Section */}
        <View style={styles.submitSection}>
          <View style={styles.submitStats}>
            <Text style={styles.submitLabel}>TODAY</Text>
            <Text style={[styles.submitXp, { color: archetypeColor }]}>
              +{todayXP} XP
            </Text>
            <Text style={styles.submitProgress}>
              {completedCount}/{todaysHabits.length} completed
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: allHandled ? archetypeColor : '#333' },
            ]}
            onPress={handleSubmitDay}
            disabled={!allHandled}
          >
            <Text style={styles.submitButtonText}>
              {archetypeData.submitButton || 'END DAY'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  avatarText: {
    fontSize: 24,
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1,
  },
  rankText: {
    fontSize: 12,
    color: '#888',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  streakIcon: {
    fontSize: 16,
  },
  streakNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  dateText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  levelSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  levelLabel: {
    fontSize: 12,
    color: '#888',
  },
  levelValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  xpBarContainer: {
    flex: 1,
    gap: 4,
  },
  xpBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  xpText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
  },
  phaseContainer: {
    backgroundColor: '#111',
    padding: 12,
    marginBottom: 16,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  phaseDay: {
    fontSize: 12,
    color: '#888',
    letterSpacing: 1,
  },
  phaseName: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '600',
  },
  phaseBar: {
    height: 3,
    backgroundColor: '#333',
  },
  phaseBarFill: {
    height: '100%',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeaderButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
  },
  sectionCount: {
    fontSize: 12,
    color: '#666',
  },
  chevron: {
    fontSize: 10,
    color: '#666',
  },
  habitsContainer: {
    gap: 8,
  },
  demonCard: {
    backgroundColor: '#0d0808',
    borderWidth: 1,
    borderColor: '#2a1a1a',
    padding: 16,
  },
  demonCardClean: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  demonCardRelapsed: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  powerCard: {
    backgroundColor: '#080d08',
    borderWidth: 1,
    borderColor: '#1a2a1a',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  powerCardDone: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  powerContent: {
    flex: 1,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  habitName: {
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
  },
  habitNameDone: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  habitXp: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  habitStreak: {
    fontSize: 12,
    color: '#f97316',
    marginTop: 4,
  },
  demonButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  cleanButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#22c55e',
    paddingVertical: 10,
    alignItems: 'center',
  },
  cleanButtonText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  relapseButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#dc2626',
    paddingVertical: 10,
    alignItems: 'center',
  },
  relapseButtonText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  statusBadge: {
    marginTop: 12,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  powerButton: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  powerButtonDone: {
    backgroundColor: '#22c55e',
  },
  powerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sideQuestsContainer: {
    gap: 6,
  },
  sideQuestCard: {
    backgroundColor: '#0a080a',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  sideQuestCompleted: {
    opacity: 0.5,
  },
  sideQuestName: {
    flex: 1,
    fontSize: 14,
    color: '#888',
  },
  sideQuestXp: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
  },
  sideQuestButton: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideQuestButtonDone: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sideQuestButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  submitSection: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    marginTop: 16,
  },
  submitStats: {
    alignItems: 'center',
    marginBottom: 16,
  },
  submitLabel: {
    fontSize: 10,
    color: '#666',
    letterSpacing: 2,
    marginBottom: 4,
  },
  submitXp: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  submitProgress: {
    fontSize: 12,
    color: '#888',
  },
  submitButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
  },
  // Day Complete Styles
  dayCompleteCard: {
    backgroundColor: '#1a1a1a',
    padding: 32,
    alignItems: 'center',
    marginTop: 32,
  },
  completeIcon: {
    width: 80,
    height: 80,
    borderWidth: 3,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  completeIconText: {
    fontSize: 32,
    color: '#22c55e',
  },
  dayCompleteTitle: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 24,
  },
  completeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  completeStat: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  completeStatValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  completeStatLabel: {
    fontSize: 10,
    color: '#666',
    letterSpacing: 1,
    marginTop: 4,
  },
  completeStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333',
  },
  countdownContainer: {
    alignItems: 'center',
  },
  countdownLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  countdownTime: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: 4,
  },
});

export default DashboardScreen;
