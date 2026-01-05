import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Session marker key
const SESSION_MARKER = 'habitquest-session-active';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

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

        // Mark this session as active
        await AsyncStorage.setItem(SESSION_MARKER, 'true');
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (isMounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          setInitialized(true);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  const signOut = async () => {
    // Clear session marker on sign out
    await AsyncStorage.removeItem(SESSION_MARKER);
    const { error: signOutError } = await supabase.auth.signOut();
    return { error: signOutError };
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
