import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import useGameStore from '../context/useGameStore';
import { getPersonalizedPlan } from '../data/personalizedHabits';

const HabitCustomizeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const difficulty = useGameStore((state) => state.difficulty);
  const commitmentAnswers = useGameStore((state) => state.commitmentAnswers);
  const lifestyleAnswers = useGameStore((state) => state.lifestyleAnswers);
  const initializeHabits = useGameStore((state) => state.initializeHabits);

  // Generate personalized habits based on user selections
  const plan = useMemo(() => {
    const struggles = commitmentAnswers?.struggles || [];
    return getPersonalizedPlan({
      struggles,
      lifestyleAnswers: lifestyleAnswers || {},
      difficulty: difficulty || 'medium',
    });
  }, [commitmentAnswers, lifestyleAnswers, difficulty]);

  const { demons, powers, totalXP, difficultyConfig } = plan;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Combine demons and powers into habits array
      const allHabits = [
        ...demons.map((h) => ({ ...h, type: 'demon' })),
        ...powers.map((h) => ({ ...h, type: 'power' })),
      ];

      await initializeHabits(allHabits);
      // Navigation will happen automatically via AppNavigator
    } catch (error) {
      console.error('Error initializing habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={handlePrevious}
      >
        <Text style={styles.backText}>{'<'}</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <Text style={styles.title}>YOUR BATTLE PLAN</Text>
          <Text style={styles.subtitle}>
            Personalized based on your assessment
          </Text>

          {/* Difficulty Badge */}
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>
              {difficultyConfig?.name?.toUpperCase() || 'WARRIOR'} MODE
            </Text>
          </View>

          {/* Demons Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { borderColor: '#dc2626' }]}>
                <Text style={styles.sectionIconText}>X</Text>
              </View>
              <View>
                <Text style={[styles.sectionTitle, { color: '#dc2626' }]}>
                  DEMONS TO SLAY
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Bad habits to eliminate
                </Text>
              </View>
            </View>

            {demons.map((habit, index) => (
              <View
                key={habit.id || index}
                style={[styles.habitCard, { borderColor: '#dc2626' }]}
              >
                <View style={styles.habitInfo}>
                  <View style={styles.habitLeft}>
                    <Text style={styles.habitName}>{habit.name}</Text>
                    <Text style={styles.habitDescription}>{habit.description}</Text>
                  </View>
                  <View style={styles.habitRight}>
                    <Text style={styles.habitXp}>+{habit.xp}</Text>
                    <Text style={styles.habitXpLabel}>XP</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Powers Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { borderColor: '#22c55e' }]}>
                <Text style={[styles.sectionIconText, { color: '#22c55e' }]}>+</Text>
              </View>
              <View>
                <Text style={[styles.sectionTitle, { color: '#22c55e' }]}>
                  POWERS TO BUILD
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Good habits to develop
                </Text>
              </View>
            </View>

            {powers.map((habit, index) => (
              <View
                key={habit.id || index}
                style={[styles.habitCard, { borderColor: '#22c55e' }]}
              >
                <View style={styles.habitInfo}>
                  <View style={styles.habitLeft}>
                    <Text style={styles.habitName}>{habit.name}</Text>
                    <Text style={styles.habitDescription}>{habit.description}</Text>
                  </View>
                  <View style={styles.habitRight}>
                    <Text style={[styles.habitXp, { color: '#22c55e' }]}>+{habit.xp}</Text>
                    <Text style={styles.habitXpLabel}>XP</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Total XP */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Daily XP Potential</Text>
            <Text style={styles.totalValue}>{totalXP} XP</Text>
          </View>

          <Text style={styles.note}>
            You can customize these habits later in Arsenal
          </Text>
        </View>
      </ScrollView>

      {/* Begin Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleConfirm}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.buttonText}>BEGIN YOUR JOURNEY</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  backText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 20,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 120,
    paddingBottom: 100,
  },
  content: {
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 16,
  },
  difficultyBadge: {
    alignSelf: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 32,
  },
  difficultyText: {
    color: '#ffffff',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIconText: {
    fontSize: 20,
    color: '#dc2626',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  habitCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 16,
    marginBottom: 8,
  },
  habitInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitLeft: {
    flex: 1,
    paddingRight: 16,
  },
  habitName: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  habitRight: {
    alignItems: 'flex-end',
  },
  habitXp: {
    fontSize: 18,
    color: '#dc2626',
    fontWeight: 'bold',
  },
  habitXpLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#333333',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  totalValue: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  button: {
    backgroundColor: '#ffffff',
    padding: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
  },
});

export default HabitCustomizeScreen;
