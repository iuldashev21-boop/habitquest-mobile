import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import useGameStore from '../context/useGameStore';
import { CLASSES, PERFECT_DAY_BONUS } from '../data/gameData';

// Filter options
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'perfect', label: 'Perfect' },
  { id: 'relapses', label: 'Relapses' },
];

// Format date for display
const formatDate = (dateStr) => {
  try {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const RecordsScreen = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedDay, setExpandedDay] = useState(null);

  const archetype = useGameStore((state) => state.archetype);
  const dayHistory = useGameStore((state) => state.dayHistory) || [];

  const archetypeData = CLASSES[archetype] || CLASSES.SPECTER;
  const accentColor = archetypeData?.colors?.accent || '#8a8a8a';

  // Filter and sort history
  const filteredHistory = useMemo(() => {
    let filtered = [...dayHistory];

    switch (activeFilter) {
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
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    return filtered;
  }, [dayHistory, activeFilter]);

  // Get day status
  const getDayStatus = (day) => {
    if (day.isPerfect) return 'perfect';
    if (day.relapseCount > 0) return 'relapse';
    return 'partial';
  };

  // Get status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'perfect':
        return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', label: 'PERFECT DAY', icon: '*' };
      case 'relapse':
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'HAD RELAPSE', icon: '!' };
      case 'partial':
        return { color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)', label: 'PARTIAL', icon: '~' };
      default:
        return { color: '#888888', bg: 'rgba(136, 136, 136, 0.1)', label: 'LOGGED', icon: '=' };
    }
  };

  // Calculate XP breakdown
  const calculateXPBreakdown = (day) => {
    const habitXP = day.habits
      ?.filter((h) => h.status === 'completed')
      .reduce((sum, h) => sum + (h.xp || 0), 0) || 0;

    const perfectBonus = day.isPerfect ? PERFECT_DAY_BONUS : 0;

    return {
      habitXP,
      perfectBonus,
      total: day.xpEarned || 0,
    };
  };

  // Empty state
  if (dayHistory.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: accentColor }]}>RECORDS</Text>
          <Text style={styles.subtitle}>0 Days Logged</Text>
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>[=]</Text>
          </View>
          <Text style={styles.emptyTitle}>NO RECORDS YET</Text>
          <Text style={styles.emptyText}>
            Complete your first day to start logging your journey. Every day you
            submit will be recorded here.
          </Text>
          <Text style={styles.emptySubtext}>
            Your history becomes your evidence of transformation.
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
          <Text style={[styles.title, { color: accentColor }]}>RECORDS</Text>
          <Text style={styles.subtitle}>{dayHistory.length} Days Logged</Text>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterIcon}>[/]</Text>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    activeFilter === filter.id ? accentColor : '#1a1a1a',
                },
              ]}
              onPress={() => setActiveFilter(filter.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  {
                    color:
                      activeFilter === filter.id
                        ? archetype === 'SPECTER'
                          ? '#ffffff'
                          : '#000000'
                        : '#888888',
                  },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results count */}
        {activeFilter !== 'all' && (
          <Text style={styles.resultsCount}>
            Showing {filteredHistory.length} of {dayHistory.length} days
          </Text>
        )}

        {/* Daily Log List */}
        <View style={styles.logList}>
          {filteredHistory.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No days match this filter.</Text>
            </View>
          ) : (
            filteredHistory.map((day) => {
              const status = getDayStatus(day);
              const statusStyle = getStatusStyle(status);
              const isExpanded = expandedDay === day.date;
              const xpBreakdown = calculateXPBreakdown(day);

              return (
                <View key={day.date} style={styles.dayCard}>
                  {/* Day Card Header */}
                  <TouchableOpacity
                    style={styles.dayCardHeader}
                    onPress={() => setExpandedDay(isExpanded ? null : day.date)}
                    activeOpacity={0.7}
                  >
                    {/* Top row: date and day number */}
                    <View style={styles.dayCardTop}>
                      <View style={styles.dateInfo}>
                        <Text style={styles.dateIcon}>[=]</Text>
                        <Text style={styles.dateText}>{formatDate(day.date)}</Text>
                      </View>
                      <Text style={styles.dayNumber}>Day {day.dayNumber || '?'}</Text>
                    </View>

                    {/* Status badge */}
                    <View style={styles.dayCardMiddle}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusStyle.bg },
                        ]}
                      >
                        <Text style={[styles.statusIcon, { color: statusStyle.color }]}>
                          {statusStyle.icon}
                        </Text>
                        <Text style={[styles.statusText, { color: statusStyle.color }]}>
                          {statusStyle.label}
                        </Text>
                      </View>
                    </View>

                    {/* Bottom row: completion and XP */}
                    <View style={styles.dayCardBottom}>
                      <View style={styles.completionInfo}>
                        <Text style={styles.completionIcon}>V</Text>
                        <Text style={styles.completionText}>
                          {day.successfulCount}/{day.totalCount} Completed
                        </Text>
                      </View>
                      <Text style={[styles.xpEarned, { color: accentColor }]}>
                        +{day.xpEarned} XP
                      </Text>
                      <Text style={styles.chevron}>{isExpanded ? 'v' : '>'}</Text>
                    </View>

                    {/* Relapse warning */}
                    {day.relapseCount > 0 && !isExpanded && (
                      <View style={styles.relapseWarning}>
                        <Text style={styles.relapseIcon}>!</Text>
                        <Text style={styles.relapseText}>
                          {day.relapseCount} Relapse{day.relapseCount > 1 ? 's' : ''}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <View style={styles.expandedDetail}>
                      {/* Demons Section */}
                      {day.habits?.filter((h) => h.type === 'demon').length > 0 && (
                        <View style={styles.habitSection}>
                          <Text style={styles.habitSectionTitle}>DEMONS</Text>
                          {day.habits
                            .filter((h) => h.type === 'demon')
                            .map((habit, index) => (
                              <View key={habit.id || index} style={styles.habitRow}>
                                <View style={styles.habitStatusIcon}>
                                  {habit.status === 'completed' && (
                                    <Text style={[styles.habitIcon, { color: '#22c55e' }]}>V</Text>
                                  )}
                                  {habit.status === 'relapsed' && (
                                    <Text style={[styles.habitIcon, { color: '#ef4444' }]}>!</Text>
                                  )}
                                  {habit.status === 'missed' && (
                                    <Text style={[styles.habitIcon, { color: '#666666' }]}>X</Text>
                                  )}
                                </View>
                                <Text
                                  style={[
                                    styles.habitName,
                                    {
                                      color:
                                        habit.status === 'completed'
                                          ? '#cccccc'
                                          : habit.status === 'relapsed'
                                          ? '#ef4444'
                                          : '#666666',
                                    },
                                  ]}
                                >
                                  {habit.name}
                                </Text>
                                <Text style={styles.habitStatusText}>
                                  {habit.status === 'completed' && `Clean (streak: ${habit.streak || 0})`}
                                  {habit.status === 'relapsed' && 'RELAPSED'}
                                  {habit.status === 'missed' && 'Missed'}
                                </Text>
                              </View>
                            ))}
                        </View>
                      )}

                      {/* Powers Section */}
                      {day.habits?.filter((h) => h.type === 'power').length > 0 && (
                        <View style={styles.habitSection}>
                          <Text style={styles.habitSectionTitle}>POWERS</Text>
                          {day.habits
                            .filter((h) => h.type === 'power')
                            .map((habit, index) => (
                              <View key={habit.id || index} style={styles.habitRow}>
                                <View style={styles.habitStatusIcon}>
                                  {habit.status === 'completed' && (
                                    <Text style={[styles.habitIcon, { color: '#22c55e' }]}>V</Text>
                                  )}
                                  {habit.status === 'missed' && (
                                    <Text style={[styles.habitIcon, { color: '#666666' }]}>X</Text>
                                  )}
                                </View>
                                <Text
                                  style={[
                                    styles.habitName,
                                    {
                                      color:
                                        habit.status === 'completed' ? '#cccccc' : '#666666',
                                    },
                                  ]}
                                >
                                  {habit.name}
                                </Text>
                                <Text style={styles.habitStatusText}>
                                  {habit.status === 'completed' && `Done (streak: ${habit.streak || 0})`}
                                  {habit.status === 'missed' && 'Missed'}
                                </Text>
                              </View>
                            ))}
                        </View>
                      )}

                      {/* XP Breakdown */}
                      <View style={styles.xpBreakdown}>
                        <Text style={styles.habitSectionTitle}>XP BREAKDOWN</Text>
                        <View style={styles.xpRow}>
                          <Text style={styles.xpLabel}>Habits</Text>
                          <Text style={styles.xpValue}>{xpBreakdown.habitXP} XP</Text>
                        </View>
                        {day.isPerfect && (
                          <View style={styles.xpRow}>
                            <Text style={styles.xpLabel}>Perfect Day Bonus</Text>
                            <Text style={[styles.xpValue, { color: '#fbbf24' }]}>
                              +{PERFECT_DAY_BONUS} XP
                            </Text>
                          </View>
                        )}
                        <View style={[styles.xpRow, styles.xpTotal]}>
                          <Text style={styles.xpLabel}>Total</Text>
                          <Text style={[styles.xpValue, { color: accentColor }]}>
                            {xpBreakdown.total} XP
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
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
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#111111',
  },
  filterIcon: {
    fontSize: 14,
    color: '#555555',
    fontWeight: 'bold',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: 12,
    color: '#555555',
    marginBottom: 16,
    textAlign: 'center',
  },
  logList: {
    gap: 12,
  },
  dayCard: {
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  dayCardHeader: {
    padding: 16,
  },
  dayCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateIcon: {
    fontSize: 12,
    color: '#666666',
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: '#cccccc',
  },
  dayNumber: {
    fontSize: 12,
    color: '#666666',
    letterSpacing: 1,
    fontWeight: '600',
  },
  dayCardMiddle: {
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  statusIcon: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  dayCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  completionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  completionIcon: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: 'bold',
  },
  completionText: {
    fontSize: 13,
    color: '#888888',
  },
  xpEarned: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  chevron: {
    fontSize: 14,
    color: '#555555',
  },
  relapseWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  relapseIcon: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  relapseText: {
    fontSize: 12,
    color: '#ef4444',
  },
  expandedDetail: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  habitSection: {
    marginTop: 16,
  },
  habitSectionTitle: {
    fontSize: 12,
    color: '#555555',
    letterSpacing: 2,
    marginBottom: 10,
    fontWeight: '600',
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  habitStatusIcon: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitIcon: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  habitName: {
    flex: 1,
    fontSize: 13,
  },
  habitStatusText: {
    fontSize: 11,
    color: '#555555',
  },
  xpBreakdown: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#111111',
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  xpLabel: {
    fontSize: 13,
    color: '#888888',
  },
  xpValue: {
    fontSize: 14,
    color: '#cccccc',
    fontWeight: '600',
  },
  xpTotal: {
    borderTopWidth: 1,
    borderTopColor: '#333333',
    marginTop: 6,
    paddingTop: 10,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 14,
    color: '#555555',
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
    marginBottom: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#444444',
    fontStyle: 'italic',
    textAlign: 'center',
    maxWidth: 280,
  },
});

export default RecordsScreen;
