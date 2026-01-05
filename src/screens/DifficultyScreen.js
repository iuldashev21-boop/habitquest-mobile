import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import useGameStore from '../context/useGameStore';
import { getDifficultyOptions } from '../data/personalizedHabits';

const DifficultyScreen = ({ navigation }) => {
  const setDifficulty = useGameStore((state) => state.setDifficulty);
  const commitmentAnswers = useGameStore((state) => state.commitmentAnswers);
  const lifestyleAnswers = useGameStore((state) => state.lifestyleAnswers);

  // Generate personalized difficulty options based on user selections
  const difficultyOptions = useMemo(() => {
    const struggles = commitmentAnswers?.struggles || [];
    return getDifficultyOptions(struggles, lifestyleAnswers || {});
  }, [commitmentAnswers, lifestyleAnswers]);

  const handleSelect = (difficultyId) => {
    setDifficulty(difficultyId);
    navigation.navigate('HabitCustomize');
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
          <Text style={styles.title}>CHOOSE YOUR INTENSITY</Text>
          <Text style={styles.subtitle}>
            Based on what you told us, here's your personalized battle plan
          </Text>

          {/* Difficulty Cards */}
          <View style={styles.cardsContainer}>
            {difficultyOptions.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.card,
                  option.id === 'medium' && styles.cardRecommended,
                ]}
                onPress={() => handleSelect(option.id)}
                activeOpacity={0.7}
              >
                {option.id === 'medium' && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>RECOMMENDED</Text>
                  </View>
                )}

                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <Text style={styles.cardName}>{option.name}</Text>
                  <Text style={styles.cardDifficulty}>{option.id.toUpperCase()}</Text>
                </View>

                <Text style={styles.cardDescription}>{option.description}</Text>

                {/* Habit Preview */}
                <View style={styles.previewSection}>
                  {/* Demons Preview */}
                  <View style={styles.previewGroup}>
                    <View style={styles.previewHeader}>
                      <View style={[styles.previewDot, { backgroundColor: '#dc2626' }]} />
                      <Text style={styles.previewLabel}>
                        {option.demonCount} DEMONS TO SLAY
                      </Text>
                    </View>
                    {option.demons.slice(0, 3).map((demon, i) => (
                      <Text key={demon.id} style={styles.previewItem}>
                        {demon.name}
                      </Text>
                    ))}
                    {option.demons.length > 3 && (
                      <Text style={styles.previewMore}>
                        +{option.demons.length - 3} more
                      </Text>
                    )}
                  </View>

                  {/* Powers Preview */}
                  <View style={styles.previewGroup}>
                    <View style={styles.previewHeader}>
                      <View style={[styles.previewDot, { backgroundColor: '#22c55e' }]} />
                      <Text style={styles.previewLabel}>
                        {option.powerCount} POWERS TO BUILD
                      </Text>
                    </View>
                    {option.powers.slice(0, 3).map((power, i) => (
                      <Text key={power.id} style={styles.previewItem}>
                        {power.name}
                      </Text>
                    ))}
                    {option.powers.length > 3 && (
                      <Text style={styles.previewMore}>
                        +{option.powers.length - 3} more
                      </Text>
                    )}
                  </View>
                </View>

                {/* XP Info */}
                <View style={styles.xpContainer}>
                  <Text style={styles.xpLabel}>Daily XP Potential</Text>
                  <Text style={styles.xpValue}>{option.totalXP} XP</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
    marginBottom: 32,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333333',
    padding: 20,
  },
  cardRecommended: {
    borderColor: '#ffffff',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -1,
    right: 20,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  recommendedText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardName: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  cardDifficulty: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 2,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 20,
  },
  previewSection: {
    gap: 16,
    marginBottom: 16,
  },
  previewGroup: {
    gap: 4,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  previewDot: {
    width: 8,
    height: 8,
  },
  previewLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1,
  },
  previewItem: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    paddingLeft: 16,
  },
  previewMore: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
    paddingLeft: 16,
    fontStyle: 'italic',
  },
  xpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  xpLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  xpValue: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '600',
  },
});

export default DifficultyScreen;
