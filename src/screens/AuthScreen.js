import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

const AuthScreen = () => {
  const [mode, setMode] = useState('signin'); // 'signin', 'signup', 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { signIn, signUp, resetPassword } = useAuth();

  const isSignUp = mode === 'signup';
  const isReset = mode === 'reset';

  const handleSubmit = async () => {
    setMessage(null);

    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!isReset && !password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if (isSignUp && !username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    setLoading(true);
    try {
      if (isReset) {
        const { error } = await resetPassword(email);
        if (error) {
          Alert.alert('Error', error.message);
        } else {
          setMessage('Check your email for a password reset link');
        }
      } else if (isSignUp) {
        const { error } = await signUp(email, password, username);
        if (error) {
          Alert.alert('Sign Up Failed', error.message);
        } else {
          setMessage('Check your email to confirm your account');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          Alert.alert('Login Failed', error.message);
        }
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setMessage(null);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {/* Logo */}
            <Text style={styles.logo}>HABITQUEST</Text>
            <Text style={styles.tagline}>
              {isReset ? 'Reset Your Password' : 'Forge Your Discipline'}
            </Text>

            {/* Form */}
            <View style={styles.form}>
              {isSignUp && (
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Username"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  autoCapitalize="none"
                />
              )}

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              {!isReset && (
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  secureTextEntry
                  autoComplete={isSignUp ? 'new-password' : 'password'}
                />
              )}

              {message && <Text style={styles.message}>{message}</Text>}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isReset
                      ? 'SEND RESET LINK'
                      : isSignUp
                        ? 'CREATE ACCOUNT'
                        : 'SIGN IN'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            {!isSignUp && !isReset && (
              <TouchableOpacity
                style={styles.forgotButton}
                onPress={() => switchMode('reset')}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            {/* Back to Sign In */}
            {isReset && (
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => switchMode('signin')}
              >
                <Text style={styles.toggleText}>Back to Sign In</Text>
              </TouchableOpacity>
            )}

            {/* Toggle Sign In / Sign Up */}
            {!isReset && (
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => switchMode(isSignUp ? 'signin' : 'signup')}
              >
                <Text style={styles.toggleText}>
                  {isSignUp
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 40,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  logo: {
    fontSize: 32,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 4,
    fontWeight: '600',
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
  },
  forgotButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  forgotText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  toggleButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  toggleText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
  },
  message: {
    color: '#22c55e',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default AuthScreen;
