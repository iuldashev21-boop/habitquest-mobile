import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import useGameStore from '../context/useGameStore';
import { CLASSES, getPhase } from '../data/gameData';

// Day status colors
const DAY_STATUS = {
  PERFECT: { bg: '#166534', border: '#22c55e', label: 'Perfect' },
  PARTIAL: { bg: '#854d0e', border: '#eab308', label: 'Partial' },
  FAILED: { bg: '#7f1d1d', border: '#ef4444', label: 'Failed' },
  FUTURE: { bg: '#1a1a1a', border: '#333333', label: 'Future' },
  TODAY: { bg: '#1a1a1a', border: null, label: 'Today' },
  EMPTY: { bg: '#0a0a0a', border: '#222222', label: 'Empty' },
};

// Format date for display
const formatDateDisplay = (dateStr) => {
  try {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
};

// Format date as YYYY-MM-DD
const formatDateYMD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const BattleMapScreen = () => {
  const [selectedDay, setSelectedDay] = useState(null);

  const archetype = useGameStore((state) => state.archetype);
  const dayStarted = useGameStore((state) => state.dayStarted);
  const currentDay = useGameStore((state) => state.currentDay);
  const currentStreak = useGameStore((state) => state.currentStreak);
  const longestStreak = useGameStore((state) => state.longestStreak);
  const dayHistory = useGameStore((state) => state.dayHistory) || [];

  const archetypeData = CLASSES[archetype] || CLASSES.SPECTER;
  const accentColor = archetypeData?.colors?.accent || '#8a8a8a';
  const phase = getPhase(currentDay);

  // Calculate stats from history
  const stats = useMemo(() => {
    const perfectDays = dayHistory.filter((d) => d.isPerfect).length;
    const totalLogged = dayHistory.length;
    return { perfectDays, totalLogged };
  }, [dayHistory]);

  // Generate 66-day grid
  const journeyDays = useMemo(() => {
    if (!dayStarted) return [];

    const startDate = new Date(dayStarted);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDateYMD(today);

    const days = [];
    for (let i = 0; i < 66; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);
      dayDate.setHours(0, 0, 0, 0);
      const dateStr = formatDateYMD(dayDate);
      const dayNum = i + 1;

      // Find history for this day
      const historyEntry = dayHistory.find((h) => h.date === dateStr);

      // Determine status
      let status;
      if (dateStr === todayStr) {
        status = 'TODAY';
      } else if (dayDate > today) {
        status = 'FUTURE';
      } else if (historyEntry) {
        if (historyEntry.isPerfect) {
          status = 'PERFECT';
        } else if (historyEntry.successfulCount > 0) {
          status = 'PARTIAL';
        } else {
          status = 'FAILED';
        }
      } else {
        status = dayDate < today ? 'EMPTY' : 'FUTURE';
      }

      days.push({
        dayNum,
        date: dateStr,
        displayDate: dayDate,
        status,
        history: historyEntry || null,
      });
    }
    return days;
  }, [dayStarted, dayHistory]);

  // Group days by week for calendar display
  const calendarWeeks = useMemo(() => {
    if (journeyDays.length === 0) return [];

    const weeks = [];
    let currentWeek = [];

    const firstDay = journeyDays[0]?.displayDate;
    if (!firstDay) return [];

    // Adjust to Monday-based week (0 = Monday, 6 = Sunday)
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    // Add empty cells for days before journey start
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(null);
    }

    // Add all journey days
    journeyDays.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Fill last week if incomplete
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [journeyDays]);

  // Handle day click
  const handleDayClick = (day) => {
    if (day && day.status !== 'FUTURE' && day.status !== 'EMPTY') {
      setSelectedDay(day);
    }
  };

  // Get border color for a day
  const getDayBorderColor = (day) => {
    if (!day) return 'transparent';
    if (day.status === 'TODAY') return accentColor;
    return DAY_STATUS[day.status].border;
  };

  // Get background color for a day
  const getDayBgColor = (day) => {
    if (!day) return 'transparent';
    return DAY_STATUS[day.status].bg;
  };

  if (!dayStarted) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>[:::]</Text>
          </View>
          <Text style={styles.emptyTitle}>START YOUR JOURNEY</Text>
          <Text style={styles.emptyText}>
            Complete your first day to begin tracking your 66-day battle map.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: accentColor }]}>BATTLE MAP</Text>
          <Text style={styles.subtitle}>
            Day {Math.min(currentDay, 66)}/66 -{' '}
            <Text style={{ color: accentColor }}>
              {phase.name.toUpperCase()}
            </Text>
          </Text>
        </View>

        {/* 66-Day Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            {/* Phase separators */}
            <View style={[styles.phaseSeparator, { left: '33.33%' }]} />
            <View style={[styles.phaseSeparator, { left: '66.66%' }]} />

            {/* Progress fill */}
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((currentDay / 66) * 100, 100)}%`,
                  backgroundColor: accentColor,
                },
              ]}
            />

            {/* Current position marker */}
            <View
              style={[
                styles.progressMarker,
                {
                  left: `${Math.min((currentDay / 66) * 100, 100)}%`,
                  backgroundColor: accentColor,
                },
              ]}
            />
          </View>

          {/* Phase labels */}
          <View style={styles.phaseLabels}>
            <Text
              style={[
                styles.phaseLabel,
                { color: currentDay <= 22 ? accentColor : '#555555' },
              ]}
            >
              FRAGILE
            </Text>
            <Text
              style={[
                styles.phaseLabel,
                {
                  color:
                    currentDay > 22 && currentDay <= 44 ? accentColor : '#555555',
                },
              ]}
            >
              BUILDING
            </Text>
            <Text
              style={[
                styles.phaseLabel,
                {
                  color:
                    currentDay > 44 && currentDay <= 66 ? accentColor : '#555555',
                },
              ]}
            >
              LOCKED IN
            </Text>
            {currentDay > 66 && (
              <Text style={[styles.phaseLabel, { color: '#fbbf24', fontWeight: 'bold' }]}>
                FORGED
              </Text>
            )}
          </View>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarSection}>
          {/* Day headers */}
          <View style={styles.dayHeaders}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <Text key={i} style={styles.dayHeader}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar weeks */}
          <View style={styles.calendarGrid}>
            {calendarWeeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.calendarWeek}>
                {week.map((day, dayIndex) => (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.dayCell,
                      {
                        backgroundColor: getDayBgColor(day),
                        borderColor: getDayBorderColor(day),
                        opacity: !day ? 0 : 1,
                      },
                    ]}
                    onPress={() => handleDayClick(day)}
                    disabled={!day || day.status === 'FUTURE' || day.status === 'EMPTY'}
                    activeOpacity={0.7}
                  >
                    {day && (
                      <>
                        <Text
                          style={[
                            styles.dayNum,
                            {
                              color:
                                day.status === 'TODAY'
                                  ? accentColor
                                  : day.status === 'FUTURE'
                                  ? '#444444'
                                  : '#999999',
                            },
                          ]}
                        >
                          {day.dayNum}
                        </Text>
                        {day.status === 'PERFECT' && (
                          <Text style={styles.perfectStar}>*</Text>
                        )}
                        {day.status === 'TODAY' && (
                          <View
                            style={[styles.todayDot, { backgroundColor: accentColor }]}
                          />
                        )}
                      </>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: DAY_STATUS.PERFECT.border },
                ]}
              />
              <Text style={styles.legendText}>Perfect</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: DAY_STATUS.PARTIAL.border },
                ]}
              />
              <Text style={styles.legendText}>Partial</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: DAY_STATUS.FAILED.border },
                ]}
              />
              <Text style={styles.legendText}>Failed</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: 'transparent', borderWidth: 2, borderColor: accentColor },
                ]}
              />
              <Text style={styles.legendText}>Today</Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>/\</Text>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{currentStreak || 0}</Text>
              <Text style={styles.statLabel}>CURRENT STREAK</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statIcon, { color: '#eab308' }]}>V</Text>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{longestStreak || 0}</Text>
              <Text style={styles.statLabel}>LONGEST STREAK</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statIcon, { color: '#22c55e' }]}>*</Text>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{stats.perfectDays}</Text>
              <Text style={styles.statLabel}>PERFECT DAYS</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statIcon, { color: accentColor }]}>+</Text>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{stats.totalLogged}</Text>
              <Text style={styles.statLabel}>DAYS LOGGED</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Day Detail Modal */}
      <Modal
        visible={selectedDay !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedDay(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedDay(null)}
        >
          <View style={styles.modal} onStartShouldSetResponder={() => true}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setSelectedDay(null)}
            >
              <Text style={styles.modalCloseText}>X</Text>
            </TouchableOpacity>

            {selectedDay && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: accentColor }]}>
                    DAY {selectedDay.dayNum}
                  </Text>
                  <Text style={styles.modalDate}>
                    {formatDateDisplay(selectedDay.date)}
                  </Text>

                  {selectedDay.history?.isPerfect && (
                    <View style={styles.perfectBadge}>
                      <Text style={styles.perfectBadgeIcon}>*</Text>
                      <Text style={styles.perfectBadgeText}>PERFECT DAY</Text>
                    </View>
                  )}
                </View>

                {selectedDay.history ? (
                  <>
                    {/* Habits list */}
                    <View style={styles.modalHabits}>
                      <Text style={styles.modalSubtitle}>MISSIONS</Text>
                      {selectedDay.history.habits?.map((habit, index) => (
                        <View key={index} style={styles.habitRow}>
                          <View style={styles.habitStatus}>
                            {habit.status === 'completed' && (
                              <Text style={styles.habitStatusIcon}>V</Text>
                            )}
                            {habit.status === 'missed' && (
                              <Text style={[styles.habitStatusIcon, { color: '#ef4444' }]}>
                                X
                              </Text>
                            )}
                            {habit.status === 'relapsed' && (
                              <Text style={[styles.habitStatusIcon, { color: '#f97316' }]}>
                                !
                              </Text>
                            )}
                          </View>
                          <Text
                            style={[
                              styles.habitName,
                              {
                                textDecorationLine:
                                  habit.status === 'missed' ? 'line-through' : 'none',
                                color:
                                  habit.status === 'completed'
                                    ? '#ffffff'
                                    : habit.status === 'relapsed'
                                    ? '#f97316'
                                    : '#666666',
                              },
                            ]}
                          >
                            {habit.name}
                          </Text>
                          <Text style={styles.habitStatusLabel}>
                            {habit.status === 'completed'
                              ? 'Done'
                              : habit.status === 'relapsed'
                              ? 'Relapsed'
                              : 'Missed'}
                          </Text>
                        </View>
                      )) || (
                        <Text style={styles.noData}>No habit data recorded</Text>
                      )}
                    </View>

                    {/* XP earned */}
                    <View style={styles.modalXP}>
                      <Text style={styles.xpLabel}>XP EARNED</Text>
                      <Text style={[styles.xpValue, { color: accentColor }]}>
                        +{selectedDay.history.xpEarned || 0}
                      </Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.modalEmpty}>
                    <Text style={styles.noData}>
                      {selectedDay.status === 'TODAY'
                        ? 'Complete your missions and submit to log this day.'
                        : 'No data recorded for this day.'}
                    </Text>
                  </View>
                )}
              </>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    letterSpacing: 1,
  },
  progressSection: {
    marginBottom: 32,
  },
  progressBar: {
    position: 'relative',
    height: 8,
    backgroundColor: '#1a1a1a',
    marginBottom: 12,
    overflow: 'visible',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
  },
  progressMarker: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    marginLeft: -8,
    borderWidth: 2,
    borderColor: '#000000',
  },
  phaseSeparator: {
    position: 'absolute',
    top: -4,
    width: 2,
    height: 16,
    backgroundColor: '#333333',
  },
  phaseLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  phaseLabel: {
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '600',
  },
  calendarSection: {
    marginBottom: 32,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    color: '#555555',
    fontWeight: '600',
  },
  calendarGrid: {
    gap: 4,
  },
  calendarWeek: {
    flexDirection: 'row',
    gap: 4,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  dayNum: {
    fontSize: 12,
    fontWeight: '600',
  },
  perfectStar: {
    position: 'absolute',
    bottom: 1,
    right: 2,
    fontSize: 8,
    color: '#22c55e',
    fontWeight: 'bold',
  },
  todayDot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
  },
  legendText: {
    fontSize: 10,
    color: '#666666',
  },
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  statIcon: {
    fontSize: 20,
    color: '#f97316',
    fontWeight: 'bold',
  },
  statInfo: {
    flex: 1,
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
    letterSpacing: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyIconText: {
    fontSize: 24,
    color: '#333333',
  },
  emptyTitle: {
    fontSize: 20,
    color: '#444444',
    letterSpacing: 2,
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    maxWidth: 280,
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
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 14,
    color: '#666666',
  },
  perfectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  perfectBadgeIcon: {
    fontSize: 14,
    color: '#fbbf24',
    fontWeight: 'bold',
  },
  perfectBadgeText: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: '600',
    letterSpacing: 1,
  },
  modalHabits: {
    marginBottom: 20,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#555555',
    letterSpacing: 2,
    marginBottom: 12,
    fontWeight: '600',
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  habitStatus: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitStatusIcon: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: 'bold',
  },
  habitName: {
    flex: 1,
    fontSize: 14,
  },
  habitStatusLabel: {
    fontSize: 10,
    color: '#555555',
    textTransform: 'uppercase',
  },
  noData: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    paddingVertical: 20,
  },
  modalXP: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  xpLabel: {
    fontSize: 14,
    color: '#666666',
    letterSpacing: 1,
    fontWeight: '600',
  },
  xpValue: {
    fontSize: 24,
    fontWeight: '600',
  },
  modalEmpty: {
    paddingVertical: 20,
  },
});

export default BattleMapScreen;
