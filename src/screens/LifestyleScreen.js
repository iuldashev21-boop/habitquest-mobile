import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import useGameStore from '../context/useGameStore';

// Lifestyle assessment questions with styled icons instead of emojis
const LIFESTYLE_QUESTIONS = [
  {
    id: 'sleep',
    title: 'How many hours do you sleep?',
    subtitle: 'Be honest about your average',
    icon: 'ZZ',
    iconStyle: 'sleep',
    options: [
      { id: 'less-5', label: 'Less than 5 hours', score: 1 },
      { id: '5-6', label: '5-6 hours', score: 2 },
      { id: '6-7', label: '6-7 hours', score: 3 },
      { id: '7-8', label: '7-8 hours', score: 4 },
      { id: '8-plus', label: '8+ hours', score: 5 },
    ]
  },
  {
    id: 'screen',
    title: 'Daily screen time?',
    subtitle: 'Phone, social media, gaming',
    icon: '[ ]',
    iconStyle: 'screen',
    options: [
      { id: '8-plus', label: '8+ hours', score: 1 },
      { id: '6-8', label: '6-8 hours', score: 2 },
      { id: '4-6', label: '4-6 hours', score: 3 },
      { id: '2-4', label: '2-4 hours', score: 4 },
      { id: 'less-2', label: 'Less than 2 hours', score: 5 },
    ]
  },
  {
    id: 'exercise',
    title: 'How often do you exercise?',
    subtitle: 'Any physical activity counts',
    icon: '/\\',
    iconStyle: 'exercise',
    options: [
      { id: 'never', label: 'Never', score: 1 },
      { id: 'rarely', label: '1-2 times a month', score: 2 },
      { id: 'sometimes', label: '1-2 times a week', score: 3 },
      { id: 'often', label: '3-4 times a week', score: 4 },
      { id: 'daily', label: 'Daily', score: 5 },
    ]
  },
  {
    id: 'water',
    title: 'Daily water intake?',
    subtitle: 'Hydration is key to clarity',
    icon: '||',
    iconStyle: 'water',
    options: [
      { id: 'rarely', label: 'I forget to drink water', score: 1 },
      { id: '1-2', label: '1-2 glasses', score: 2 },
      { id: '3-4', label: '3-4 glasses', score: 3 },
      { id: '5-6', label: '5-6 glasses', score: 4 },
      { id: '8-plus', label: '8+ glasses', score: 5 },
    ]
  },
  {
    id: 'mindset',
    title: 'Current mental state?',
    subtitle: 'Your mental clarity right now',
    icon: '◇',
    iconStyle: 'mind',
    options: [
      { id: 'struggling', label: 'Struggling daily', score: 1 },
      { id: 'foggy', label: 'Often foggy/unmotivated', score: 2 },
      { id: 'neutral', label: 'Neutral - some good days', score: 3 },
      { id: 'good', label: 'Generally positive', score: 4 },
      { id: 'excellent', label: 'Sharp and focused', score: 5 },
    ]
  },
];

const LifestyleScreen = ({ navigation }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [fadeAnim] = useState(new Animated.Value(1));
  const setLifestyleAnswers = useGameStore((state) => state.setLifestyleAnswers);

  const question = LIFESTYLE_QUESTIONS[currentQuestion];
  const isLastQuestion = currentQuestion === LIFESTYLE_QUESTIONS.length - 1;
  const totalQuestions = LIFESTYLE_QUESTIONS.length;

  const calculateScore = () => {
    let total = 0;
    Object.values(answers).forEach(answer => {
      const q = LIFESTYLE_QUESTIONS.find(q => q.id === answer.questionId);
      const opt = q?.options.find(o => o.id === answer.optionId);
      if (opt) total += opt.score;
    });
    return total;
  };

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

  const handleOptionSelect = (optionId) => {
    setAnswers({
      ...answers,
      [question.id]: { questionId: question.id, optionId }
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const score = calculateScore();
      const level = score <= 10 ? 'critical' : score <= 15 ? 'needs-work' : score <= 20 ? 'moderate' : 'good';

      if (setLifestyleAnswers) {
        setLifestyleAnswers({ answers, score, level });
      }
      navigation.navigate('Commitment');
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

  const hasAnswer = answers[question.id] !== undefined;
  const selectedOption = answers[question.id]?.optionId;

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
            {LIFESTYLE_QUESTIONS.map((_, index) => (
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
            {currentQuestion + 1}/{totalQuestions}
          </Text>

          {/* Stylized Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{question.icon}</Text>
          </View>

          {/* Question */}
          <Text style={styles.title}>{question.title}</Text>
          <Text style={styles.subtitle}>{question.subtitle}</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {question.options.map((option) => {
              const isSelected = selectedOption === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected
                  ]}
                  onPress={() => handleOptionSelect(option.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {/* Score bar indicator */}
                  <View style={styles.scoreContainer}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <View
                        key={level}
                        style={[
                          styles.scoreBlock,
                          {
                            backgroundColor: level <= option.score
                              ? (isSelected ? '#ffffff' : 'rgba(255,255,255,0.3)')
                              : 'rgba(255,255,255,0.1)'
                          }
                        ]}
                      />
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Next Button */}
          {hasAnswer && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>
                {isLastQuestion ? "Continue" : "Next"}
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
    justifyContent: 'center',
    padding: 20,
    paddingTop: 80,
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
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '300',
    letterSpacing: 2,
  },
  title: {
    fontSize: 26,
    color: '#ffffff',
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 40,
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
  scoreContainer: {
    flexDirection: 'row',
    gap: 3,
    marginLeft: 12,
  },
  scoreBlock: {
    width: 12,
    height: 6,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 18,
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
});

export default LifestyleScreen;
