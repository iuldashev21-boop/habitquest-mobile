import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import useGameStore from '../context/useGameStore';

const MAX_LENGTH = 15;
const MIN_LENGTH = 2;

const isValidName = (name) => {
  const trimmed = name.trim();
  if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) {
    return false;
  }
  return /^[a-zA-Z0-9_]+$/.test(trimmed);
};

const ProfileSetupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const setUsername = useGameStore((state) => state.setUsername);

  const trimmedName = name.trim();
  const charCount = trimmedName.length;
  const isValid = isValidName(name);

  const getBorderColor = () => {
    if (error) return '#dc2626';
    if (charCount >= MIN_LENGTH && isValid) return '#22c55e';
    if (charCount > 0) return '#f97316';
    return '#333333';
  };

  const handleChange = (value) => {
    if (value.length <= MAX_LENGTH) {
      setName(value);
      setError('');
    }
  };

  const handleSubmit = () => {
    if (!isValid) {
      if (charCount < MIN_LENGTH) {
        setError('Name must be at least 2 characters');
      } else if (!/^[a-zA-Z0-9_]+$/.test(trimmedName)) {
        setError('Only letters, numbers, and underscore allowed');
      }
      return;
    }
    setUsername(trimmedName);
    navigation.navigate('Lifestyle');
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>{'<'}</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Icon */}
          <View style={[
            styles.iconContainer,
            { borderColor: isValid ? '#22c55e' : '#333333' }
          ]}>
            <Text style={[
              styles.icon,
              { color: isValid ? '#22c55e' : '#ffffff' }
            ]}>
              {'ID'}
            </Text>
          </View>

          {/* Header */}
          <Text style={styles.heading}>
            WHAT DO WE CALL YOU, SOLDIER?
          </Text>
          <Text style={styles.subtext}>
            Choose your war name
          </Text>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: getBorderColor() }
                ]}
                placeholder="Enter your name..."
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={name}
                onChangeText={handleChange}
                maxLength={MAX_LENGTH}
                autoCapitalize="none"
                autoFocus
              />
              <Text style={[
                styles.charCount,
                {
                  color: charCount > MAX_LENGTH - 3
                    ? '#f97316'
                    : charCount >= MIN_LENGTH
                      ? '#22c55e'
                      : 'rgba(255, 255, 255, 0.4)'
                }
              ]}>
                {charCount}/{MAX_LENGTH}
              </Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                {
                  width: `${Math.min((charCount / MIN_LENGTH) * 100, 100)}%`,
                  backgroundColor: isValid ? '#22c55e' : charCount > 0 ? '#f97316' : '#333333'
                }
              ]} />
            </View>

            {error ? (
              <Text style={styles.error}>{error}</Text>
            ) : null}

            <Text style={styles.hint}>
              Letters, numbers, and underscore only
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.button,
              { opacity: isValid ? 1 : 0.4 }
            ]}
            onPress={handleSubmit}
            disabled={!isValid}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>THAT'S ME</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 2,
  },
  heading: {
    fontSize: 22,
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  subtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputSection: {
    width: '100%',
    marginBottom: 32,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingRight: 60,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    color: '#ffffff',
    fontSize: 18,
    letterSpacing: 2,
    textAlign: 'center',
  },
  charCount: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -8,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#1a1a1a',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
  },
  error: {
    fontSize: 14,
    color: '#dc2626',
    marginTop: 8,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 32,
    backgroundColor: '#ffffff',
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    letterSpacing: 3,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default ProfileSetupScreen;
