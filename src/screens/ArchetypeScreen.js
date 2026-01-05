import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import useGameStore from '../context/useGameStore';

const ARCHETYPES = [
  {
    id: 'SPECTER',
    name: 'Specter',
    icon: '///',
    motto: 'Move in silence. Let results speak.',
    description: 'Master of discipline and digital detox',
    traits: ['Stealth', 'Focus', 'Precision'],
    color: '#8a8a8a',
  },
  {
    id: 'ASCENDANT',
    name: 'Ascendant',
    icon: '^^^',
    motto: 'Sacrifice now. Transcend later.',
    description: 'Seeker of spiritual growth and mindfulness',
    traits: ['Wisdom', 'Balance', 'Clarity'],
    color: '#f97316',
  },
  {
    id: 'WRATH',
    name: 'Wrath',
    icon: 'XXX',
    motto: 'No mercy for weakness. No excuses.',
    description: 'Fueled by physical dominance and power',
    traits: ['Intensity', 'Strength', 'Grit'],
    color: '#dc2626',
  },
  {
    id: 'SOVEREIGN',
    name: 'Sovereign',
    icon: '|||',
    motto: 'I rule myself. I build my empire.',
    description: 'Commander of productivity and wealth',
    traits: ['Leadership', 'Ambition', 'Control'],
    color: '#fbbf24',
  },
];

const ArchetypeScreen = ({ navigation }) => {
  const setArchetype = useGameStore((state) => state.setArchetype);

  const handleSelect = (archetypeId) => {
    setArchetype(archetypeId);
    navigation.navigate('Difficulty');
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
          <Text style={styles.title}>CHOOSE YOUR PATH</Text>
          <Text style={styles.subtitle}>
            Each archetype shapes your journey differently
          </Text>

          {/* Archetype Cards */}
          <View style={styles.cardsContainer}>
            {ARCHETYPES.map((archetype) => (
              <TouchableOpacity
                key={archetype.id}
                style={[styles.card, { borderColor: archetype.color }]}
                onPress={() => handleSelect(archetype.id)}
                activeOpacity={0.7}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { borderColor: archetype.color }]}>
                    <Text style={[styles.icon, { color: archetype.color }]}>
                      {archetype.icon}
                    </Text>
                  </View>
                  <View style={styles.cardTitleSection}>
                    <Text style={[styles.cardName, { color: archetype.color }]}>
                      {archetype.name}
                    </Text>
                    <Text style={styles.cardMotto}>{archetype.motto}</Text>
                  </View>
                </View>

                <Text style={styles.cardDescription}>{archetype.description}</Text>

                {/* Traits */}
                <View style={styles.traitsContainer}>
                  {archetype.traits.map((trait) => (
                    <View
                      key={trait}
                      style={[styles.trait, { borderColor: archetype.color }]}
                    >
                      <Text style={[styles.traitText, { color: archetype.color }]}>
                        {trait}
                      </Text>
                    </View>
                  ))}
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
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardTitleSection: {
    flex: 1,
  },
  cardName: {
    fontSize: 20,
    fontWeight: '600',
  },
  cardMotto: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    fontStyle: 'italic',
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
  },
  traitsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  trait: {
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  traitText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ArchetypeScreen;
