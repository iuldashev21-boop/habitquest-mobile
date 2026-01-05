import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import useGameStore from '../context/useGameStore';
import { CLASSES } from '../data/gameData';

// Auth Screens
import AuthScreen from '../screens/AuthScreen';

// Onboarding Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import LifestyleScreen from '../screens/LifestyleScreen';
import CommitmentScreen from '../screens/CommitmentScreen';
import ArchetypeScreen from '../screens/ArchetypeScreen';
import DifficultyScreen from '../screens/DifficultyScreen';
import HabitCustomizeScreen from '../screens/HabitCustomizeScreen';

// Main App Screens
import DashboardScreen from '../screens/DashboardScreen';
import BattleMapScreen from '../screens/BattleMapScreen';
import ArsenalScreen from '../screens/ArsenalScreen';
import RecordsScreen from '../screens/RecordsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const OnboardingStack = createNativeStackNavigator();

// Loading Screen
const LoadingScreen = ({ message = 'Loading...' }) => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingTitle}>HABITQUEST</Text>
    <ActivityIndicator size="large" color="#8a8a8a" style={styles.spinner} />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

// Tab icons as text
const TAB_ICONS = {
  Command: '[#]',
  BattleMap: '[=]',
  Arsenal: '[@]',
  Records: '[/]',
};

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const archetype = useGameStore((s) => s.archetype);
  const archetypeData = CLASSES[archetype] || CLASSES.SPECTER;
  const accentColor = archetypeData?.colors?.accent || '#8a8a8a';

  return (
    <View style={styles.tabBar}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              onPress={onPress}
              activeOpacity={0.7}
            >
              {/* Active indicator dot */}
              {isFocused && (
                <View
                  style={[styles.activeIndicator, { backgroundColor: accentColor }]}
                />
              )}

              {/* Icon */}
              <Text
                style={[
                  styles.tabIcon,
                  { color: isFocused ? accentColor : '#666666' },
                ]}
              >
                {TAB_ICONS[route.name] || '[?]'}
              </Text>

              {/* Label */}
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? accentColor : '#666666' },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Main Tab Navigator (after onboarding)
const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Command"
        component={DashboardScreen}
        options={{ tabBarLabel: 'COMMAND' }}
      />
      <Tab.Screen
        name="BattleMap"
        component={BattleMapScreen}
        options={{ tabBarLabel: 'BATTLE MAP' }}
      />
      <Tab.Screen
        name="Arsenal"
        component={ArsenalScreen}
        options={{ tabBarLabel: 'ARSENAL' }}
      />
      <Tab.Screen
        name="Records"
        component={RecordsScreen}
        options={{ tabBarLabel: 'RECORDS' }}
      />
    </Tab.Navigator>
  );
};

// Onboarding Flow Navigator
const OnboardingNavigator = () => (
  <OnboardingStack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} />
    <OnboardingStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    <OnboardingStack.Screen name="Lifestyle" component={LifestyleScreen} />
    <OnboardingStack.Screen name="Commitment" component={CommitmentScreen} />
    <OnboardingStack.Screen name="Archetype" component={ArchetypeScreen} />
    <OnboardingStack.Screen name="Difficulty" component={DifficultyScreen} />
    <OnboardingStack.Screen name="HabitCustomize" component={HabitCustomizeScreen} />
  </OnboardingStack.Navigator>
);

// Root Navigator
const AppNavigator = () => {
  const { loading, initialized, isAuthenticated } = useAuth();
  const habits = useGameStore((state) => state.habits);

  // Show loading while auth initializes
  if (loading || !initialized) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // Determine if onboarding is complete
  const hasCompletedOnboarding = habits && habits.length > 0;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth Flow
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : !hasCompletedOnboarding ? (
          // Onboarding Flow
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          // Main App
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 4,
    opacity: 0.5,
  },
  spinner: {
    marginTop: 24,
  },
  loadingText: {
    color: '#666666',
    fontSize: 14,
    marginTop: 12,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
    paddingTop: 8,
    paddingBottom: 28,
  },
  tab: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 4,
    height: 4,
  },
  tabIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default AppNavigator;
