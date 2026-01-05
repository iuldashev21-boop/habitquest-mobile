import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { colors } from '../lib/theme';

const WelcomeScreen = ({ navigation }) => {
  const [headingOpacity] = useState(new Animated.Value(0));
  const [subtextOpacity] = useState(new Animated.Value(0));
  const [buttonOpacity] = useState(new Animated.Value(0));
  const [lineWidth] = useState(new Animated.Value(0));

  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
      Animated.timing(lineWidth, {
        toValue: 60,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(headingOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(subtextOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBegin = () => {
    navigation.navigate('ProfileSetup');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Decorative line */}
        <Animated.View style={[styles.decorLine, { width: lineWidth }]} />

        {/* Main heading */}
        <Animated.Text style={[styles.heading, { opacity: headingOpacity }]}>
          The man you are is not the man you were meant to be.
        </Animated.Text>

        {/* Subtext */}
        <Animated.Text style={[styles.subtext, { opacity: subtextOpacity }]}>
          It's time to change that.
        </Animated.Text>

        {/* Button */}
        <Animated.View style={[styles.buttonContainer, { opacity: buttonOpacity }]}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleBegin}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>BEGIN THE WAR</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 600,
    paddingHorizontal: 20,
  },
  decorLine: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 32,
  },
  heading: {
    fontSize: 28,
    color: '#ffffff',
    letterSpacing: 1,
    lineHeight: 38,
    marginBottom: 24,
    fontWeight: '400',
    textAlign: 'center',
  },
  subtext: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 48,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  buttonText: {
    fontSize: 18,
    letterSpacing: 3,
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default WelcomeScreen;
