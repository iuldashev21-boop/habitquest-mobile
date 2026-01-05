import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, AppState } from 'react-native';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Session marker key
const SESSION_MARKER = 'habitquest-session-active';
const LAST_ACTIVITY_KEY = 'habitquest-last-activity';
const SESSION_TIMEOUT_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Flags to prevent concurrent operations
  const isSigningIn = useRef(false);
  const isSigningOut = useRef(false);
  const signOutInProgress = useRef(false);

  // Update last activity timestamp
  const updateLastActivity = useCallback(async () => {
    try {
      await AsyncStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    } catch (err) {
      // Silently fail - not critical
    }
  }, []);

  // Check if session has timed out
  const checkSessionTimeout = useCallback(async () => {
    try {
      const lastActivity = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
      if (lastActivity) {
        const elapsed = Date.now() - parseInt(lastActivity, 10);
        if (elapsed > SESSION_TIMEOUT_MS) {
          // Session timed out
          if (__DEV__) {
            console.log('[Auth] Session timed out after', Math.floor(elapsed / (24 * 60 * 60 * 1000)), 'days');
          }
          return true;
        }
      }
      return false;
    } catch (err) {
      return false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Handle "Remember me" - check if this is a new app session
    const checkRememberMe = async () => {
      try {
        const shouldRemember = await AsyncStorage.getItem('habitquest-remember-me');
        const isExistingSession = await AsyncStorage.getItem(SESSION_MARKER);

        // If remember me is false and this is a new session, sign out
        if (shouldRemember === 'false' && !isExistingSession) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await supabase.auth.signOut();
          }
        }

        // Check session timeout
        const timedOut = await checkSessionTimeout();
        if (timedOut) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await supabase.auth.signOut();
            if (isMounted) {
              Alert.alert(
                'Session Expired',
                'Your session has expired due to inactivity. Please sign in again.'
              );
            }
          }
        }

        // Mark this session as active
        await AsyncStorage.setItem(SESSION_MARKER, 'true');
        await updateLastActivity();
      } catch (err) {
        console.warn('Remember-me check failed:', err);
      }
    };

    // Get initial session
    const initializeAuth = async () => {
      try {
        await checkRememberMe();

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Auth session error:', sessionError);
          if (isMounted) {
            setError(sessionError.message);
          }
        }

        if (isMounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          setInitialized(true);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted) {
          setUser(null);
          setError(err.message || 'Authentication failed');
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes with enhanced event handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        if (__DEV__) {
          console.log('[Auth] Auth state changed:', event);
        }

        switch (event) {
          case 'SIGNED_IN':
            setUser(session?.user ?? null);
            updateLastActivity();
            break;

          case 'SIGNED_OUT':
            setUser(null);
            // Check if this was unexpected (not initiated by us)
            if (!signOutInProgress.current) {
              Alert.alert(
                'Signed Out',
                'You have been signed out. Please sign in again to continue.'
              );
            }
            break;

          case 'TOKEN_REFRESHED':
            if (__DEV__) {
              console.log('[Auth] Token refreshed successfully');
            }
            setUser(session?.user ?? null);
            updateLastActivity();
            break;

          case 'USER_UPDATED':
            setUser(session?.user ?? null);
            break;

          case 'PASSWORD_RECOVERY':
            // Handle password recovery if needed
            break;

          default:
            setUser(session?.user ?? null);
        }

        setLoading(false);
        setInitialized(true);
      }
    );

    // Update activity on app foreground
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        updateLastActivity();
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      appStateSubscription?.remove();
    };
  }, [checkSessionTimeout, updateLastActivity]);

  const signUp = async (email, password, username) => {
    // Prevent concurrent sign-in attempts
    if (isSigningIn.current) {
      return { data: null, error: { message: 'Sign up already in progress' } };
    }

    isSigningIn.current = true;
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        await updateLastActivity();
      }

      return { data, error: signUpError };
    } catch (err) {
      const errorMessage = err.message || 'Network error. Please check your connection.';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    } finally {
      isSigningIn.current = false;
    }
  };

  const signIn = async (email, password) => {
    // Prevent concurrent sign-in attempts
    if (isSigningIn.current) {
      return { data: null, error: { message: 'Sign in already in progress' } };
    }

    isSigningIn.current = true;
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        await updateLastActivity();
      }

      return { data, error: signInError };
    } catch (err) {
      const errorMessage = err.message || 'Network error. Please check your connection.';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    } finally {
      isSigningIn.current = false;
    }
  };

  const signOut = async () => {
    // Prevent concurrent sign-out attempts
    if (isSigningOut.current) {
      return { error: { message: 'Sign out already in progress' } };
    }

    isSigningOut.current = true;
    signOutInProgress.current = true;

    try {
      // Clear session marker on sign out
      await AsyncStorage.removeItem(SESSION_MARKER);
      await AsyncStorage.removeItem(LAST_ACTIVITY_KEY);

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        setError(signOutError.message);
      }

      return { error: signOutError };
    } catch (err) {
      const errorMessage = err.message || 'Failed to sign out. Please try again.';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      isSigningOut.current = false;
      // Small delay before resetting to allow auth state change to be processed
      setTimeout(() => {
        signOutInProgress.current = false;
      }, 100);
    }
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user,
    loading,
    initialized,
    error,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    resetPassword,
    clearError
  };
};

export default useAuth;
