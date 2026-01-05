// ============================================
// PERSONALIZED HABIT GENERATION
// Maps user onboarding selections to relevant habits
// Habits scale with difficulty based on user's current level
// ============================================

// DEMON habits based on user's selected struggles
// Each struggle has easy/medium/hard variants
const DEMON_HABITS = {
  porn: {
    easy: { id: 'demon-porn-e', name: 'No Porn', xp: 30, description: 'Start breaking the cycle', frequency: 'daily' },
    medium: { id: 'demon-porn-m', name: 'No Porn or NSFW', xp: 40, description: 'Clean digital environment', frequency: 'daily' },
    hard: { id: 'demon-porn-h', name: 'Full NoFap/PMO', xp: 50, description: 'Complete retention mode', frequency: 'daily' },
  },
  'social-media': {
    easy: { id: 'demon-social-e', name: 'No Social Before 12pm', xp: 20, description: 'Protect your morning', frequency: 'daily' },
    medium: { id: 'demon-social-m', name: 'Max 1hr Social Media', xp: 30, description: 'Set strict boundaries', frequency: 'daily' },
    hard: { id: 'demon-social-h', name: 'No Social Media', xp: 45, description: 'Full digital detox', frequency: 'daily' },
  },
  gaming: {
    easy: { id: 'demon-gaming-e', name: 'No Gaming Until Evening', xp: 20, description: 'Earn your entertainment', frequency: 'daily' },
    medium: { id: 'demon-gaming-m', name: 'No Gaming Weekdays', xp: 30, description: 'Build real things instead', frequency: 'weekdays' },
    hard: { id: 'demon-gaming-h', name: 'No Gaming At All', xp: 40, description: 'Cold turkey gaming detox', frequency: 'daily' },
  },
  substances: {
    easy: { id: 'demon-sub-e', name: 'No Alcohol Weekdays', xp: 25, description: 'Stay sharp for work', frequency: 'weekdays' },
    medium: { id: 'demon-sub-m', name: 'No Alcohol or Weed', xp: 35, description: 'Complete sobriety', frequency: 'daily' },
    hard: { id: 'demon-sub-h', name: 'No Substances + No Caffeine After 2pm', xp: 45, description: 'Pure natural state', frequency: 'daily' },
  },
  laziness: {
    easy: { id: 'demon-lazy-e', name: 'No Sleeping Past 9am', xp: 15, description: 'Reclaim your mornings', frequency: 'daily' },
    medium: { id: 'demon-lazy-m', name: 'No Sleeping Past 7am', xp: 25, description: 'Early bird advantage', frequency: 'daily' },
    hard: { id: 'demon-lazy-h', name: 'Wake at 5am', xp: 40, description: 'Join the 5am club', frequency: 'daily' },
  },
  'no-discipline': {
    easy: { id: 'demon-disc-e', name: 'No Phone First 30min', xp: 15, description: 'Own your morning mindset', frequency: 'daily' },
    medium: { id: 'demon-disc-m', name: 'No Phone First Hour', xp: 25, description: 'Deep morning focus', frequency: 'daily' },
    hard: { id: 'demon-disc-h', name: 'No Phone Until Noon', xp: 40, description: 'Monk mode mornings', frequency: 'daily' },
  },
};

// POWER habits based on user's lifestyle scores
// Each category has tiered habits based on difficulty AND current user level
const POWER_HABITS = {
  sleep: {
    // User sleeps poorly (score 1-2)
    poor: {
      easy: { id: 'power-sleep-pe', name: 'Bed by Midnight', xp: 15, description: 'Start with a consistent bedtime', frequency: 'daily' },
      medium: { id: 'power-sleep-pm', name: 'Sleep 7hrs + Bed by 11pm', xp: 25, description: 'Quality sleep routine', frequency: 'daily' },
      hard: { id: 'power-sleep-ph', name: 'Sleep 8hrs + Bed by 10pm', xp: 35, description: 'Optimal recovery', frequency: 'daily' },
    },
    // User sleeps okay (score 3)
    okay: {
      easy: { id: 'power-sleep-oe', name: 'No Screens 30min Before Bed', xp: 15, description: 'Better sleep quality', frequency: 'daily' },
      medium: { id: 'power-sleep-om', name: 'No Screens 1hr Before Bed', xp: 20, description: 'Wind down properly', frequency: 'daily' },
      hard: { id: 'power-sleep-oh', name: 'Sleep Routine + No Screens 2hrs', xp: 30, description: 'Elite sleep protocol', frequency: 'daily' },
    },
    // User sleeps well (score 4-5) - focus on optimization
    good: {
      easy: { id: 'power-sleep-ge', name: 'Track Sleep Quality', xp: 10, description: 'Monitor your patterns', frequency: 'daily' },
      medium: { id: 'power-sleep-gm', name: 'Wake Same Time Daily', xp: 20, description: 'Circadian consistency', frequency: 'daily' },
      hard: { id: 'power-sleep-gh', name: '5am Wake + Sleep Tracking', xp: 35, description: 'Master your sleep', frequency: 'daily' },
    },
  },
  screen: {
    poor: {
      easy: { id: 'power-screen-pe', name: 'Screen Time Under 6hrs', xp: 15, description: 'Start reducing dependency', frequency: 'daily' },
      medium: { id: 'power-screen-pm', name: 'Screen Time Under 4hrs', xp: 25, description: 'Significant reduction', frequency: 'daily' },
      hard: { id: 'power-screen-ph', name: 'Screen Time Under 2hrs', xp: 40, description: 'Minimal screen life', frequency: 'daily' },
    },
    okay: {
      easy: { id: 'power-screen-oe', name: 'Phone-Free Meals', xp: 15, description: 'Mindful eating', frequency: 'daily' },
      medium: { id: 'power-screen-om', name: 'Phone-Free Morning (1hr)', xp: 20, description: 'Own your first hour', frequency: 'daily' },
      hard: { id: 'power-screen-oh', name: 'Phone-Free Until Noon', xp: 35, description: 'Deep focus mornings', frequency: 'daily' },
    },
    good: {
      easy: { id: 'power-screen-ge', name: 'Grayscale Phone Mode', xp: 10, description: 'Make phone boring', frequency: 'daily' },
      medium: { id: 'power-screen-gm', name: 'Digital Sunset 9pm', xp: 20, description: 'End screens early', frequency: 'daily' },
      hard: { id: 'power-screen-gh', name: 'Phone-Free Weekends', xp: 40, description: 'True digital detox', frequency: 'daily' },
    },
  },
  exercise: {
    poor: { // User never exercises
      easy: { id: 'power-exercise-pe', name: 'Walk 15min', xp: 15, description: 'Just start moving', frequency: '3x_week' },
      medium: { id: 'power-exercise-pm', name: 'Walk 20min', xp: 20, description: 'Build the habit', frequency: 'daily' },
      hard: { id: 'power-exercise-ph', name: 'Walk 30min + Stretch', xp: 30, description: 'Daily movement practice', frequency: 'daily' },
    },
    okay: { // User exercises sometimes
      easy: { id: 'power-exercise-oe', name: '20 Pushups', xp: 15, description: 'Daily bodyweight minimum', frequency: 'daily' },
      medium: { id: 'power-exercise-om', name: 'Workout 30min', xp: 25, description: 'Consistent training', frequency: '3x_week' },
      hard: { id: 'power-exercise-oh', name: 'Workout 45min', xp: 35, description: 'Serious training', frequency: '4x_week' },
    },
    good: { // User exercises regularly
      easy: { id: 'power-exercise-ge', name: 'Active Recovery Day', xp: 15, description: 'Never fully rest', frequency: 'daily' },
      medium: { id: 'power-exercise-gm', name: 'Gym 1hr', xp: 30, description: 'Dedicated sessions', frequency: '4x_week' },
      hard: { id: 'power-exercise-gh', name: 'Gym 1.5hr or 2x Daily', xp: 45, description: 'Elite athlete mode', frequency: 'daily' },
    },
  },
  water: {
    poor: {
      easy: { id: 'power-water-pe', name: 'Drink 4 Glasses Water', xp: 10, description: 'Start hydrating', frequency: 'daily' },
      medium: { id: 'power-water-pm', name: 'Drink 2L Water', xp: 20, description: 'Proper hydration', frequency: 'daily' },
      hard: { id: 'power-water-ph', name: 'Drink 3L Water', xp: 25, description: 'Optimal hydration', frequency: 'daily' },
    },
    okay: {
      easy: { id: 'power-water-oe', name: 'Water First Thing AM', xp: 10, description: 'Kickstart your system', frequency: 'daily' },
      medium: { id: 'power-water-om', name: 'No Sugary Drinks', xp: 20, description: 'Clean fuel only', frequency: 'daily' },
      hard: { id: 'power-water-oh', name: '3L Water + No Caffeine', xp: 30, description: 'Pure hydration', frequency: 'daily' },
    },
    good: {
      easy: { id: 'power-water-ge', name: 'Track Water Intake', xp: 10, description: 'Monitor hydration', frequency: 'daily' },
      medium: { id: 'power-water-gm', name: 'Electrolytes Daily', xp: 15, description: 'Optimize absorption', frequency: 'daily' },
      hard: { id: 'power-water-gh', name: 'Water Only (No Other Drinks)', xp: 25, description: 'Pure water lifestyle', frequency: 'daily' },
    },
  },
  mindset: {
    poor: {
      easy: { id: 'power-mind-pe', name: 'Journal 3 Things Grateful', xp: 10, description: 'Shift your focus', frequency: 'daily' },
      medium: { id: 'power-mind-pm', name: 'Meditate 5min + Journal', xp: 20, description: 'Daily mindfulness', frequency: 'daily' },
      hard: { id: 'power-mind-ph', name: 'Meditate 15min + Journal', xp: 30, description: 'Deep inner work', frequency: 'daily' },
    },
    okay: {
      easy: { id: 'power-mind-oe', name: 'Meditate 5min', xp: 15, description: 'Train your focus', frequency: 'daily' },
      medium: { id: 'power-mind-om', name: 'Meditate 10min', xp: 20, description: 'Deepen the practice', frequency: 'daily' },
      hard: { id: 'power-mind-oh', name: 'Meditate 20min', xp: 30, description: 'Serious meditation', frequency: 'daily' },
    },
    good: {
      easy: { id: 'power-mind-ge', name: 'Read 15min', xp: 15, description: 'Feed your mind', frequency: 'daily' },
      medium: { id: 'power-mind-gm', name: 'Read 30min', xp: 20, description: 'Deep reading habit', frequency: 'daily' },
      hard: { id: 'power-mind-gh', name: 'Read 1hr + Learn Skill', xp: 35, description: 'Constant growth', frequency: 'daily' },
    },
  },
};

// Difficulty config
const DIFFICULTY_CONFIG = {
  easy: {
    demonCount: 2,
    powerCount: 3,
    name: 'Initiate',
    description: 'Start with the basics. Build momentum.',
  },
  medium: {
    demonCount: 3,
    powerCount: 4,
    name: 'Warrior',
    description: 'Balanced challenge. Real commitment required.',
  },
  hard: {
    demonCount: 4,
    powerCount: 5,
    name: 'Legend',
    description: 'Maximum intensity. Transform completely.',
  },
};

// Map option IDs to score levels
const getScoreFromOption = (optionId) => {
  const scoreMap = {
    // Sleep options
    'less-5': 1, '5-6': 2, '6-7': 3, '7-8': 4, '8-plus': 5,
    // Screen options (reversed - more = worse)
    // Exercise options
    'never': 1, 'rarely': 2, 'sometimes': 3, 'often': 4, 'daily': 5,
    // Water options
    '1-2': 2, '3-4': 3, '5-6': 4,
    // Mindset options
    'struggling': 1, 'foggy': 2, 'neutral': 3, 'good': 4, 'excellent': 5,
    // Less than options
    'less-2': 5, // For screen time, less is better
  };
  return scoreMap[optionId] || 3;
};

// Get user level for a category: 'poor', 'okay', or 'good'
const getUserLevel = (score) => {
  if (score <= 2) return 'poor';
  if (score <= 3) return 'okay';
  return 'good';
};

/**
 * Generate personalized demons based on user's selected struggles
 */
export const generateDemons = (struggles = [], difficulty = 'medium') => {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
  const demons = [];
  const usedCategories = new Set();

  // Get demons for each selected struggle
  for (const struggle of struggles) {
    if (demons.length >= config.demonCount) break;
    if (struggle === 'all') continue; // Handle 'all' separately
    if (usedCategories.has(struggle)) continue;

    const demonSet = DEMON_HABITS[struggle];
    if (demonSet && demonSet[difficulty]) {
      demons.push({
        ...demonSet[difficulty],
        type: 'demon',
        source: struggle,
      });
      usedCategories.add(struggle);
    }
  }

  // If "all" is selected, fill from all categories
  if (struggles.includes('all')) {
    const allCategories = ['porn', 'social-media', 'gaming', 'substances', 'laziness', 'no-discipline'];
    for (const category of allCategories) {
      if (demons.length >= config.demonCount) break;
      if (usedCategories.has(category)) continue;

      const demonSet = DEMON_HABITS[category];
      if (demonSet && demonSet[difficulty]) {
        demons.push({
          ...demonSet[difficulty],
          type: 'demon',
          source: category,
        });
        usedCategories.add(category);
      }
    }
  }

  return demons;
};

/**
 * Generate personalized powers based on user's lifestyle + difficulty
 */
export const generatePowers = (lifestyleAnswers = {}, difficulty = 'medium') => {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
  const powers = [];
  const categories = ['sleep', 'screen', 'exercise', 'water', 'mindset'];

  // Get answers object
  const answers = lifestyleAnswers.answers || lifestyleAnswers;

  // Calculate scores and sort by priority (lowest score = most need)
  const scoredCategories = categories.map(cat => {
    const answer = answers[cat];
    let score = 3; // Default
    if (answer && answer.optionId) {
      score = getScoreFromOption(answer.optionId);
    }
    return { category: cat, score, level: getUserLevel(score) };
  });

  // Sort by score (lowest first = needs most help)
  scoredCategories.sort((a, b) => a.score - b.score);

  // Add powers based on user's level in each category
  for (const { category, level } of scoredCategories) {
    if (powers.length >= config.powerCount) break;

    const powerSet = POWER_HABITS[category];
    if (powerSet && powerSet[level] && powerSet[level][difficulty]) {
      powers.push({
        ...powerSet[level][difficulty],
        type: 'power',
        source: category,
        userLevel: level,
      });
    }
  }

  // If we still need more, add from remaining categories
  if (powers.length < config.powerCount) {
    for (const { category, level } of scoredCategories) {
      if (powers.length >= config.powerCount) break;

      // Check if we already added from this category
      const alreadyAdded = powers.some(p => p.source === category);
      if (alreadyAdded) continue;

      const powerSet = POWER_HABITS[category];
      if (powerSet && powerSet[level] && powerSet[level][difficulty]) {
        powers.push({
          ...powerSet[level][difficulty],
          type: 'power',
          source: category,
          userLevel: level,
        });
      }
    }
  }

  return powers;
};

/**
 * Get the full personalized habit plan
 */
export const getPersonalizedPlan = ({ struggles = [], lifestyleAnswers = {}, difficulty = 'medium' }) => {
  const demons = generateDemons(struggles, difficulty);
  const powers = generatePowers(lifestyleAnswers, difficulty);

  const totalDemonXP = demons.reduce((sum, d) => sum + d.xp, 0);
  const totalPowerXP = powers.reduce((sum, p) => sum + p.xp, 0);

  return {
    demons,
    powers,
    totalXP: totalDemonXP + totalPowerXP,
    dailyPotential: totalDemonXP + totalPowerXP,
    difficultyConfig: DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium,
  };
};

/**
 * Get difficulty options with personalized previews
 */
export const getDifficultyOptions = (struggles = [], lifestyleAnswers = {}) => {
  return ['easy', 'medium', 'hard'].map(diff => {
    const plan = getPersonalizedPlan({ struggles, lifestyleAnswers, difficulty: diff });
    return {
      id: diff,
      ...plan.difficultyConfig,
      demons: plan.demons,
      powers: plan.powers,
      totalXP: plan.totalXP,
      preview: {
        demonNames: plan.demons.slice(0, 2).map(d => d.name),
        powerNames: plan.powers.slice(0, 2).map(p => p.name),
      },
    };
  });
};

export { DIFFICULTY_CONFIG, DEMON_HABITS, POWER_HABITS };
