import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import useGameStore from '../context/useGameStore';

const QUESTIONS = [
  {
    id: 'struggles',
    title: "What's been holding you back?",
    subtitle: 'Select all that apply',
    multiSelect: true,
    options: [
      { id: 'porn', label: 'Porn addiction' },
      { id: 'social-media', label: 'Social media addiction' },
      { id: 'no-discipline', label: 'No discipline/routine' },
      { id: 'gaming', label: 'Gaming addiction' },
      { id: 'substances', label: 'Substance use (vape/alcohol/weed)' },
      { id: 'laziness', label: 'Laziness/procrastination' },
      { id: 'all', label: 'All of the above' }
    ]
  },
  {
    id: 'seriousness',
    title: 'How serious are you about changing?',
    subtitle: 'Be honest with yourself',
    multiSelect: false,
    options: [
      { id: 'curious', label: 'Just curious, checking this out' },
      { id: 'struggled', label: 'Want to change but struggled before' },
      { id: 'ready', label: 'Ready to commit for real this time' },
      { id: 'desperate', label: 'Desperate - my life depends on this' }
    ]
  },
  {
    id: 'identity',
    title: 'Who do you want to become?',
    subtitle: 'Visualize your future self',
    multiSelect: false,
    options: [
      { id: 'disciplined', label: 'Disciplined & focused' },
      { id: 'strong', label: 'Physically strong & healthy' },
      { id: 'sharp', label: 'Mentally sharp & confident' },
      { id: 'wealthy', label: 'Wealthy & successful' },
      { id: 'complete', label: 'All of the above - the complete package' }
    ]
  },
  {
    id: 'commitment',
    title: 'The next 66 days will be hard.',
    subtitle: 'Are you ready to suffer for your future self?',
    multiSelect: false,
    isFinal: true,
    options: [
      { id: 'ready', label: "I'm ready. Let's go." },
      { id: 'not-ready', label: 'Maybe not...' }
    ]
  }
];

const CommitmentScreen = ({ navigation }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({
    struggles: [],
    seriousness: '',
    identity: '',
    ready: null
  });
  const [showNotReady, setShowNotReady] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const setCommitmentAnswers = useGameStore((state) => state.setCommitmentAnswers);

  const question = QUESTIONS[currentQuestion];
  const isLastQuestion = currentQuestion === QUESTIONS.length - 1;

  // Fade animation for transitions
  const fadeOut = (callback) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  // Check if current question has a valid answer
  const hasAnswer = () => {
    if (question.multiSelect) {
      return answers[question.id]?.length > 0;
    }
    return answers[question.id] !== '' && answers[question.id] !== null;
  };

  const handleOptionSelect = (optionId) => {
    if (question.multiSelect) {
      // Handle "All of the above" special case
      if (optionId === 'all') {
        const allSelected = answers[question.id]?.includes('all');
        if (allSelected) {
          setAnswers({ ...answers, [question.id]: [] });
        } else {
          const allIds = question.options.map(o => o.id);
          setAnswers({ ...answers, [question.id]: allIds });
        }
      } else {
        const current = answers[question.id] || [];
        const isSelected = current.includes(optionId);

        let newSelection;
        if (isSelected) {
          newSelection = current.filter(id => id !== optionId && id !== 'all');
        } else {
          newSelection = [...current.filter(id => id !== 'all'), optionId];
        }
        setAnswers({ ...answers, [question.id]: newSelection });
      }
    } else {
      // Single select
      if (question.isFinal) {
        if (optionId === 'not-ready') {
          setShowNotReady(true);
          setAnswers({ ...answers, ready: false });
          return;
        } else {
          setAnswers({ ...answers, ready: true });
        }
      } else {
        setAnswers({ ...answers, [question.id]: optionId });
      }
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setCommitmentAnswers({
        struggles: answers.struggles,
        seriousness: answers.seriousness,
        identity: answers.identity,
        ready: true
      });
      navigation.navigate('Archetype');
    } else {
      fadeOut(() => setCurrentQuestion(currentQuestion + 1));
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      fadeOut(() => setCurrentQuestion(currentQuestion - 1));
    } else {
      navigation.goBack();
    }
  };

  const isOptionSelected = (optionId) => {
    if (question.multiSelect) {
      return answers[question.id]?.includes(optionId);
    }
    if (question.isFinal) {
      return answers.ready === (optionId === 'ready');
    }
    return answers[question.id] === optionId;
  };

  // Not ready screen
  if (showNotReady) {
    return (
      <View style={styles.container}>
        <View style={styles.notReadyContent}>
          <Text style={styles.notReadyIcon}>!</Text>
          <Text style={styles.notReadyTitle}>
            Come back when you're ready to change.
          </Text>
          <Text style={styles.notReadySubtext}>
            This journey isn't for everyone. It takes real commitment.
          </Text>
          <TouchableOpacity
            style={styles.returnButton}
            onPress={() => navigation.navigate('Welcome')}
            activeOpacity={0.8}
          >
            <Text style={styles.returnButtonText}>Return</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Progress Dots */}
          <View style={styles.progressDots}>
            {QUESTIONS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === currentQuestion
                      ? '#ffffff'
                      : index < currentQuestion
                        ? 'rgba(255, 255, 255, 0.5)'
                        : 'rgba(255, 255, 255, 0.2)',
                    transform: [{ scale: index === currentQuestion ? 1.3 : 1 }],
                  }
                ]}
              />
            ))}
          </View>

          {/* Question Counter */}
          <Text style={styles.counter}>
            {currentQuestion + 1}/{QUESTIONS.length}
          </Text>

          {/* Question */}
          <View style={styles.questionSection}>
            <Text style={styles.questionTitle}>{question.title}</Text>
            <Text style={styles.questionSubtitle}>{question.subtitle}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {question.options.map((option) => {
              const selected = isOptionSelected(option.id);
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionButton,
                    selected && styles.optionButtonSelected
                  ]}
                  onPress={() => handleOptionSelect(option.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.optionText,
                    selected && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {question.multiSelect && (
                    <View style={[
                      styles.checkbox,
                      selected && styles.checkboxSelected
                    ]}>
                      {selected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Next Button */}
          {hasAnswer() && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>
                {isLastQuestion ? "Begin My Journey" : "Next"}
              </Text>
              <Text style={styles.nextButtonArrow}>{'>'}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 80,
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
  content: {
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  counter: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 2,
    marginBottom: 32,
    textAlign: 'center',
  },
  questionSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  questionTitle: {
    fontSize: 26,
    color: '#ffffff',
    letterSpacing: 1,
    marginBottom: 12,
    lineHeight: 32,
    textAlign: 'center',
    fontWeight: '600',
  },
  questionSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 18,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#333333',
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: '#ffffff',
  },
  optionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    flex: 1,
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#555555',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkboxSelected: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  checkmark: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    paddingHorizontal: 48,
    backgroundColor: '#ffffff',
    alignSelf: 'center',
  },
  nextButtonText: {
    color: '#000000',
    fontSize: 18,
    letterSpacing: 2,
    fontWeight: '600',
  },
  nextButtonArrow: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
  // Not ready screen
  notReadyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    maxWidth: 360,
    alignSelf: 'center',
  },
  notReadyIcon: {
    fontSize: 64,
    color: '#f97316',
    marginBottom: 24,
  },
  notReadyTitle: {
    fontSize: 24,
    color: '#f97316',
    letterSpacing: 1,
    marginBottom: 16,
    lineHeight: 30,
    textAlign: 'center',
    fontWeight: '600',
  },
  notReadySubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 40,
    textAlign: 'center',
  },
  returnButton: {
    padding: 16,
    paddingHorizontal: 48,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#333333',
  },
  returnButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    letterSpacing: 2,
  },
});

export default CommitmentScreen;
