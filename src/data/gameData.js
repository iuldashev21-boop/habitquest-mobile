// ============================================
// CHARACTER ARCHETYPES
// ============================================
// Character images: Located in public/characters/
// - specter.png, ascendant.png, wrath.png, sovereign.png

export const CLASSES = {
  SPECTER: {
    id: 'SPECTER',
    name: 'Specter',
    emoji: '🖤',
    image: '/characters/specter.png',
    motto: 'Move in silence. Let results speak.',
    colors: {
      primary: '#0a0a0a',
      accent: '#8a8a8a'
    },
    ranks: ['Shadow', 'Phantom', 'Specter', 'Wraith', 'Ghost'],
    habitTerm: 'Missions',
    submitButton: 'Vanish'
  },
  ASCENDANT: {
    id: 'ASCENDANT',
    name: 'Ascendant',
    emoji: '🔥',
    image: '/characters/ascendant.png',
    motto: 'Sacrifice now. Transcend later.',
    colors: {
      primary: '#1a1207',
      accent: '#f97316'
    },
    ranks: ['Novice', 'Disciple', 'Ascetic', 'Sage', 'Ascendant'],
    habitTerm: 'Rituals',
    submitButton: 'Transcend'
  },
  WRATH: {
    id: 'WRATH',
    name: 'Wrath',
    emoji: '⚔️',
    image: '/characters/wrath.png',
    motto: 'No mercy for weakness. No excuses.',
    colors: {
      primary: '#0f0f0f',
      accent: '#dc2626'
    },
    ranks: ['Recruit', 'Warrior', 'Ravager', 'Warlord', 'Wrath'],
    habitTerm: 'Battles',
    submitButton: 'Conquer'
  },
  SOVEREIGN: {
    id: 'SOVEREIGN',
    name: 'Sovereign',
    emoji: '👑',
    image: '/characters/sovereign.png',
    motto: 'I rule myself. I build my empire.',
    colors: {
      primary: '#0a0a0a',
      accent: '#fbbf24'
    },
    ranks: ['Peasant', 'Knight', 'Lord', 'King', 'Sovereign'],
    habitTerm: 'Conquests',
    submitButton: 'Claim Victory'
  }
};

// ============================================
// MISSION CARDS
// Each card is balanced with:
// - Demon 1: Addiction (porn, vape, alcohol, weed)
// - Demon 2: Digital/Impulse (social media, gaming, impulse buying)
// - Demon 3: Body Harm (junk food, energy drinks, bad sleep)
// - Power 1: Physical (walking, gym, pushups)
// - Power 2: Mind (reading, meditation, learning)
// - Power 3: Fuel/Recovery (water, clean eating, sleep)
// ============================================

export const MISSION_CARDS = {
  // ==========================================
  // SPECTER - Digital Detox Focus
  // ==========================================
  SPECTER: {
    easy: {
      name: 'Going Dark',
      totalXP: 120,
      demons: [
        {
          id: 'sp-e-d1',
          name: 'No Porn',
          xp: 35,
          description: 'Reclaim your dopamine system',
          frequency: 'daily'
        },
        {
          id: 'sp-e-d2',
          name: 'No TikTok/Reels Until 6pm',
          xp: 20,
          description: 'Morning focus is sacred',
          frequency: 'daily'
        },
        {
          id: 'sp-e-d3',
          name: 'No Fast Food',
          xp: 15,
          description: 'Fuel yourself properly',
          frequency: 'daily'
        }
      ],
      powers: [
        {
          id: 'sp-e-p1',
          name: 'Walk 20 Minutes',
          xp: 15,
          description: 'Movement clears the mind',
          frequency: 'daily'
        },
        {
          id: 'sp-e-p2',
          name: 'Read 20 Minutes',
          xp: 15,
          description: 'Feed your brain real content',
          frequency: 'daily'
        },
        {
          id: 'sp-e-p3',
          name: 'Drink 2L Water',
          xp: 20,
          description: 'Hydration is foundation',
          frequency: 'daily'
        }
      ]
    },
    medium: {
      name: 'Shadow Protocol',
      totalXP: 180,
      demons: [
        {
          id: 'sp-m-d1',
          name: 'No Porn/OnlyFans',
          xp: 35,
          description: 'Your brain deserves better',
          frequency: 'daily'
        },
        {
          id: 'sp-m-d2',
          name: 'No Social Media 9am-6pm',
          xp: 35,
          description: 'Own your productive hours',
          frequency: 'weekdays'
        },
        {
          id: 'sp-m-d3',
          name: 'No Energy Drinks/Soda',
          xp: 20,
          description: 'Natural energy only',
          frequency: 'daily'
        }
      ],
      powers: [
        {
          id: 'sp-m-p1',
          name: 'Walk 30 Minutes',
          xp: 25,
          description: 'Build the walking habit',
          frequency: 'daily'
        },
        {
          id: 'sp-m-p2',
          name: 'Read 45 Minutes',
          xp: 30,
          description: 'Deep reading, deep thinking',
          frequency: 'daily'
        },
        {
          id: 'sp-m-p3',
          name: 'Meal Prep + 3L Water',
          xp: 35,
          description: 'Plan your fuel',
          frequency: 'daily'
        }
      ]
    },
    extreme: {
      name: 'Ghost',
      totalXP: 285,
      demons: [
        {
          id: 'sp-x-d1',
          name: 'No PMO - Full NoFap',
          xp: 50,
          description: 'Complete retention',
          frequency: 'daily'
        },
        {
          id: 'sp-x-d2',
          name: 'Delete Social Apps + Max 30min Screen',
          xp: 50,
          description: 'Disappear from the matrix',
          frequency: 'daily'
        },
        {
          id: 'sp-x-d3',
          name: 'No Alcohol/Substances',
          xp: 45,
          description: 'Crystal clear mind',
          frequency: 'daily'
        }
      ],
      powers: [
        {
          id: 'sp-x-p1',
          name: 'Walk 60min or 10K Steps',
          xp: 40,
          description: 'Move like a ghost',
          frequency: 'daily'
        },
        {
          id: 'sp-x-p2',
          name: 'Read 90min + Learn Skill 30min',
          xp: 50,
          description: 'Become dangerous',
          frequency: 'daily'
        },
        {
          id: 'sp-x-p3',
          name: 'Whole Foods Only + 4L Water',
          xp: 50,
          description: 'Elite fuel only',
          frequency: 'daily'
        }
      ]
    }
  },

  // ==========================================
  // ASCENDANT - Body & Mind Purification
  // ==========================================
  ASCENDANT: {
    easy: {
      name: 'Awakening',
      totalXP: 120,
      demons: [
        {
          id: 'as-e-d1',
          name: 'No Porn',
          xp: 35,
          description: 'Begin the purification',
          frequency: 'daily'
        },
        {
          id: 'as-e-d2',
          name: 'No Phone First 30min of Day',
          xp: 15,
          description: 'Own your morning',
          frequency: 'daily'
        },
        {
          id: 'as-e-d3',
          name: 'No Junk Food/Candy',
          xp: 20,
          description: 'Respect your temple',
          frequency: 'daily'
        }
      ],
      powers: [
        {
          id: 'as-e-p1',
          name: 'Meditate 5 Minutes',
          xp: 10,
          description: 'Still the mind',
          frequency: 'daily'
        },
        {
          id: 'as-e-p2',
          name: 'Drink 2L Water',
          xp: 15,
          description: 'Cleanse from within',
          frequency: 'daily'
        },
        {
          id: 'as-e-p3',
          name: 'Sleep 7hrs + Bed by Midnight',
          xp: 25,
          description: 'Recovery is growth',
          frequency: 'daily'
        }
      ]
    },
    medium: {
      name: 'The Purge',
      totalXP: 180,
      demons: [
        {
          id: 'as-m-d1',
          name: 'No Porn/Masturbation',
          xp: 40,
          description: 'Transmute your energy',
          frequency: 'daily'
        },
        {
          id: 'as-m-d2',
          name: 'Max 1hr Social Media Total',
          xp: 25,
          description: 'Limit the poison',
          frequency: 'daily'
        },
        {
          id: 'as-m-d3',
          name: 'No Alcohol/Weed',
          xp: 35,
          description: 'Clarity over comfort',
          frequency: 'daily'
        }
      ],
      powers: [
        {
          id: 'as-m-p1',
          name: 'Meditate 15 Minutes',
          xp: 25,
          description: 'Deepen the practice',
          frequency: 'daily'
        },
        {
          id: 'as-m-p2',
          name: 'Cold Shower 2+ Minutes',
          xp: 30,
          description: 'Embrace discomfort',
          frequency: 'daily'
        },
        {
          id: 'as-m-p3',
          name: 'Clean Eating + 3L Water',
          xp: 25,
          description: 'Purify the vessel',
          frequency: 'daily'
        }
      ]
    },
    extreme: {
      name: 'Transcendence',
      totalXP: 285,
      demons: [
        {
          id: 'as-x-d1',
          name: 'No PMO - Full Retention',
          xp: 50,
          description: 'Master your energy',
          frequency: 'daily'
        },
        {
          id: 'as-x-d2',
          name: 'No Nicotine/Caffeine After Noon',
          xp: 45,
          description: 'Natural energy mastery',
          frequency: 'daily'
        },
        {
          id: 'as-x-d3',
          name: 'No Processed Food/Sugar',
          xp: 45,
          description: 'Only real food',
          frequency: 'daily'
        }
      ],
      powers: [
        {
          id: 'as-x-p1',
          name: 'Meditate 30 Minutes',
          xp: 40,
          description: 'Enter the void',
          frequency: 'daily'
        },
        {
          id: 'as-x-p2',
          name: 'Cold Shower 5min',
          xp: 45,
          description: 'Ice in your veins',
          frequency: 'daily'
        },
        {
          id: 'as-x-p3',
          name: 'Intermittent Fast 16hrs + Supplements',
          xp: 60,
          description: 'Optimize everything',
          frequency: 'daily'
        }
      ]
    }
  },

  // ==========================================
  // WRATH - Physical Dominance
  // ==========================================
  WRATH: {
    easy: {
      name: 'Basic Training',
      totalXP: 120,
      demons: [
        {
          id: 'wr-e-d1',
          name: 'No Porn',
          xp: 35,
          description: 'Channel that energy',
          frequency: 'daily'
        },
        {
          id: 'wr-e-d2',
          name: 'No Skipping Planned Workout',
          xp: 20,
          description: 'Show up or shut up',
          frequency: '3x_week'
        },
        {
          id: 'wr-e-d3',
          name: 'No Energy Drinks',
          xp: 15,
          description: 'Earn your energy',
          frequency: 'daily'
        }
      ],
      powers: [
        {
          id: 'wr-e-p1',
          name: '30 Pushups + 30 Squats',
          xp: 15,
          description: 'Daily minimum',
          frequency: 'daily'
        },
        {
          id: 'wr-e-p2',
          name: 'Walk 20min or 5K Steps',
          xp: 15,
          description: 'Active recovery',
          frequency: 'daily'
        },
        {
          id: 'wr-e-p3',
          name: 'Protein 80g + 2L Water',
          xp: 20,
          description: 'Feed the machine',
          frequency: 'daily'
        }
      ]
    },
    medium: {
      name: 'War Mode',
      totalXP: 180,
      demons: [
        {
          id: 'wr-m-d1',
          name: 'No Porn/Masturbation',
          xp: 40,
          description: 'Aggression in the gym only',
          frequency: 'daily'
        },
        {
          id: 'wr-m-d2',
          name: 'No Junk Food/Fast Food',
          xp: 30,
          description: 'Warriors eat clean',
          frequency: 'daily'
        },
        {
          id: 'wr-m-d3',
          name: 'No Alcohol',
          xp: 30,
          description: 'Stay sharp',
          frequency: 'daily'
        }
      ],
      powers: [
        {
          id: 'wr-m-p1',
          name: 'Gym 45-60 Minutes',
          xp: 35,
          description: 'Forge your body',
          frequency: '3x_week'
        },
        {
          id: 'wr-m-p2',
          name: '100 Pushups Throughout Day',
          xp: 25,
          description: 'No excuses',
          frequency: '3x_week'
        },
        {
          id: 'wr-m-p3',
          name: 'Protein 120g + 3L Water',
          xp: 20,
          description: 'Fuel for war',
          frequency: 'daily'
        }
      ]
    },
    extreme: {
      name: 'Berserker',
      totalXP: 285,
      demons: [
        {
          id: 'wr-x-d1',
          name: 'No PMO',
          xp: 50,
          description: 'Ultimate discipline',
          frequency: 'daily'
        },
        {
          id: 'wr-x-d2',
          name: 'No Alcohol/Substances',
          xp: 45,
          description: 'Peak performance only',
          frequency: 'daily'
        },
        {
          id: 'wr-x-d3',
          name: 'No Rest Days - Active Recovery Min',
          xp: 40,
          description: 'Never stop moving',
          frequency: 'daily'
        }
      ],
      powers: [
        {
          id: 'wr-x-p1',
          name: 'Train 90min or 2x Sessions',
          xp: 50,
          description: 'Become a weapon',
          frequency: '4x_week'
        },
        {
          id: 'wr-x-p2',
          name: 'Run 5K + Gym',
          xp: 50,
          description: 'Cardio AND strength',
          frequency: '3x_week'
        },
        {
          id: 'wr-x-p3',
          name: 'Protein 150g + Meal Prep All',
          xp: 50,
          description: 'Elite nutrition',
          frequency: 'daily'
        }
      ]
    }
  },

  // ==========================================
  // SOVEREIGN - Productivity & Wealth
  // ==========================================
  SOVEREIGN: {
    easy: {
      name: 'Foundation',
      totalXP: 115,
      demons: [
        {
          id: 'sv-e-d1',
          name: 'No Porn',
          xp: 35,
          description: 'Protect your focus',
          frequency: 'daily'
        },
        {
          id: 'sv-e-d2',
          name: 'No Impulse Buys Over $10',
          xp: 15,
          description: 'Control the money',
          frequency: 'daily'
        },
        {
          id: 'sv-e-d3',
          name: 'No Social Media 9am-5pm',
          xp: 20,
          description: 'Work hours are sacred',
          frequency: 'weekdays'
        }
      ],
      powers: [
        {
          id: 'sv-e-p1',
          name: 'Read 20min Business/Self-Help',
          xp: 15,
          description: 'Learn from the best',
          frequency: 'daily'
        },
        {
          id: 'sv-e-p2',
          name: 'Track All Spending',
          xp: 10,
          description: 'What gets measured grows',
          frequency: 'daily'
        },
        {
          id: 'sv-e-p3',
          name: 'Learn Skill 20 Minutes',
          xp: 20,
          description: 'Stack skills daily',
          frequency: 'weekdays'
        }
      ]
    },
    medium: {
      name: 'The Climb',
      totalXP: 180,
      demons: [
        {
          id: 'sv-m-d1',
          name: 'No Porn/Time-Wasting Sites',
          xp: 35,
          description: 'Time is money',
          frequency: 'daily'
        },
        {
          id: 'sv-m-d2',
          name: 'No Video Games Weekdays',
          xp: 30,
          description: 'Build real empires',
          frequency: 'weekdays'
        },
        {
          id: 'sv-m-d3',
          name: 'No Eating Out - Cook All Meals',
          xp: 25,
          description: 'Save and invest the difference',
          frequency: 'daily'
        }
      ],
      powers: [
        {
          id: 'sv-m-p1',
          name: 'Deep Work 2 Hours',
          xp: 35,
          description: 'Focused execution',
          frequency: 'weekdays'
        },
        {
          id: 'sv-m-p2',
          name: 'Side Hustle 1 Hour',
          xp: 30,
          description: 'Build your empire',
          frequency: 'daily'
        },
        {
          id: 'sv-m-p3',
          name: 'Save/Invest $10+ Today',
          xp: 25,
          description: 'Pay yourself first',
          frequency: 'daily'
        }
      ]
    },
    extreme: {
      name: 'Ruler',
      totalXP: 285,
      demons: [
        {
          id: 'sv-x-d1',
          name: 'No PMO',
          xp: 50,
          description: 'Complete mental clarity',
          frequency: 'daily'
        },
        {
          id: 'sv-x-d2',
          name: 'No Entertainment Weekdays',
          xp: 50,
          description: 'Sacrifice for success',
          frequency: 'weekdays'
        },
        {
          id: 'sv-x-d3',
          name: 'No Spending on Wants',
          xp: 45,
          description: 'Invest everything',
          frequency: 'daily'
        }
      ],
      powers: [
        {
          id: 'sv-x-p1',
          name: 'Deep Work 4 Hours',
          xp: 50,
          description: 'CEO-level output',
          frequency: 'weekdays'
        },
        {
          id: 'sv-x-p2',
          name: 'Side Hustle 2 Hours',
          xp: 45,
          description: 'Multiple income streams',
          frequency: 'daily'
        },
        {
          id: 'sv-x-p3',
          name: 'Wake 5am + Morning Routine',
          xp: 45,
          description: 'Win before others wake',
          frequency: 'daily'
        }
      ]
    }
  }
};

// ============================================
// HABIT FREQUENCY TYPES
// ============================================

export const FREQUENCY_TYPES = {
  daily: {
    id: 'daily',
    name: 'Every Day',
    shortName: 'Daily',
    description: 'Complete every day',
    targetPerWeek: 7
  },
  '3x_week': {
    id: '3x_week',
    name: '3× Per Week',
    shortName: '3×/wk',
    description: 'Complete any 3 days per week',
    targetPerWeek: 3
  },
  '4x_week': {
    id: '4x_week',
    name: '4× Per Week',
    shortName: '4×/wk',
    description: 'Complete any 4 days per week',
    targetPerWeek: 4
  },
  weekdays: {
    id: 'weekdays',
    name: 'Weekdays Only',
    shortName: 'Mon-Fri',
    description: 'Complete Monday through Friday',
    targetPerWeek: 5
  }
};

// Helper to get the Monday of the current week
export const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper to get the Sunday of the current week
export const getWeekEnd = (date = new Date()) => {
  const monday = getWeekStart(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
};

// Helper to check if today is a "scheduled" day for a frequency
export const isScheduledDay = (frequency, date = new Date()) => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

  switch (frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Mon-Fri
    case '3x_week':
    case '4x_week':
      // These frequencies allow any day
      return true;
    default:
      return true;
  }
};

// Helper to count completions in current week
export const getWeekCompletions = (completedDates = [], date = new Date()) => {
  if (!Array.isArray(completedDates)) {
    return 0;
  }
  const weekStart = getWeekStart(date);
  const weekEnd = getWeekEnd(date);

  return completedDates.filter(dateStr => {
    if (!dateStr || typeof dateStr !== 'string') return false;
    // Parse YYYY-MM-DD in local timezone to avoid off-by-one errors
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return false;
    const [, year, month, day] = match;
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return d >= weekStart && d <= weekEnd;
  }).length;
};

// Helper to check if a week was successful for a frequency
export const isWeekSuccessful = (frequency, completedDates = [], weekDate = new Date()) => {
  const completions = getWeekCompletions(completedDates, weekDate);
  const target = FREQUENCY_TYPES[frequency]?.targetPerWeek || 7;

  if (frequency === 'weekdays') {
    // For weekdays, we need to check if they completed all weekdays that have passed
    return completions >= 5;
  }

  return completions >= target;
};

// ============================================
// XP & LEVELING SYSTEM
// ============================================

export const XP_PER_LEVEL = 100;
export const PERFECT_DAY_BONUS = 50;

// Day lock-in: Minimum hours before day resets after completion
export const DAY_LOCK_HOURS = 12;

// ============================================
// SIDE QUESTS - Bonus activities for extra XP
// ============================================

export const SIDE_QUESTS = [
  // Mindfulness & Mental
  { id: 'sq-1', name: 'Take 10 deep breaths', xp: 5, category: 'mind', emoji: '🧘' },
  { id: 'sq-2', name: 'Write 3 things you\'re grateful for', xp: 8, category: 'mind', emoji: '📝' },
  { id: 'sq-3', name: 'No phone for 1 hour', xp: 10, category: 'mind', emoji: '📵' },
  { id: 'sq-4', name: 'Listen to a podcast/audiobook', xp: 8, category: 'mind', emoji: '🎧' },
  { id: 'sq-5', name: 'Journal for 5 minutes', xp: 8, category: 'mind', emoji: '✍️' },

  // Physical & Health
  { id: 'sq-6', name: 'Do 10 squats right now', xp: 5, category: 'body', emoji: '🏋️' },
  { id: 'sq-7', name: 'Drink a glass of water', xp: 3, category: 'body', emoji: '💧' },
  { id: 'sq-8', name: 'Stretch for 5 minutes', xp: 5, category: 'body', emoji: '🤸' },
  { id: 'sq-9', name: 'Eat a piece of fruit', xp: 5, category: 'body', emoji: '🍎' },
  { id: 'sq-10', name: 'Go outside for 10 minutes', xp: 8, category: 'body', emoji: '🌳' },
  { id: 'sq-11', name: 'Take the stairs instead of elevator', xp: 5, category: 'body', emoji: '🪜' },
  { id: 'sq-12', name: 'Do 20 jumping jacks', xp: 5, category: 'body', emoji: '⭐' },

  // Social & Connection
  { id: 'sq-13', name: 'Text/call a friend or family', xp: 8, category: 'social', emoji: '📱' },
  { id: 'sq-14', name: 'Compliment someone genuinely', xp: 5, category: 'social', emoji: '💬' },
  { id: 'sq-15', name: 'Help someone with something', xp: 10, category: 'social', emoji: '🤝' },

  // Productivity & Growth
  { id: 'sq-16', name: 'Clean your desk/workspace', xp: 8, category: 'productivity', emoji: '🧹' },
  { id: 'sq-17', name: 'Make your bed', xp: 3, category: 'productivity', emoji: '🛏️' },
  { id: 'sq-18', name: 'Plan tomorrow\'s top 3 tasks', xp: 8, category: 'productivity', emoji: '📋' },
  { id: 'sq-19', name: 'Delete 10 unused apps/files', xp: 5, category: 'productivity', emoji: '🗑️' },
  { id: 'sq-20', name: 'Learn one new word/fact', xp: 5, category: 'productivity', emoji: '🧠' },

  // Self-care
  { id: 'sq-21', name: 'Take a cold shower', xp: 15, category: 'challenge', emoji: '🥶' },
  { id: 'sq-22', name: 'No complaining for 3 hours', xp: 10, category: 'challenge', emoji: '🤐' },
  { id: 'sq-23', name: 'Sit in silence for 5 minutes', xp: 8, category: 'mind', emoji: '🔇' },
  { id: 'sq-24', name: 'Fix something you\'ve been avoiding', xp: 12, category: 'productivity', emoji: '🔧' }
];

// Number of side quests to show per day
export const SIDE_QUESTS_PER_DAY = 4;

export const STREAK_MULTIPLIERS = {
  7: 1.3,   // 7-day streak: 30% bonus
  30: 1.5,  // 30-day streak: 50% bonus
  66: 2.0   // 66-day streak: 100% bonus
};

// ============================================
// 66-DAY PHASE SYSTEM
// ============================================

export const PHASES = {
  FRAGILE: {
    id: 'FRAGILE',
    name: 'Fragile',
    startDay: 1,
    endDay: 22,
    description: 'The habit is new and easily broken. Stay vigilant.'
  },
  BUILDING: {
    id: 'BUILDING',
    name: 'Building',
    startDay: 23,
    endDay: 44,
    description: 'Neural pathways are forming. Keep pushing.'
  },
  LOCKED_IN: {
    id: 'LOCKED_IN',
    name: 'Locked In',
    startDay: 45,
    endDay: 66,
    description: 'The habit is becoming automatic. Almost there.'
  },
  FORGED: {
    id: 'FORGED',
    name: 'Forged',
    startDay: 67,
    endDay: Infinity,
    description: 'The habit is now part of who you are.'
  }
};

// Helper function to get current phase based on day
export const getPhase = (day) => {
  // Input validation
  if (typeof day !== 'number' || isNaN(day) || day < 1) {
    return PHASES.FRAGILE;
  }
  if (day <= 22) return PHASES.FRAGILE;
  if (day <= 44) return PHASES.BUILDING;
  if (day <= 66) return PHASES.LOCKED_IN;
  return PHASES.FORGED;
};

// Helper function to get streak multiplier
export const getStreakMultiplier = (streak) => {
  // Input validation
  if (typeof streak !== 'number' || isNaN(streak) || streak < 0) {
    return 1.0;
  }
  if (streak >= 66) return STREAK_MULTIPLIERS[66];
  if (streak >= 30) return STREAK_MULTIPLIERS[30];
  if (streak >= 7) return STREAK_MULTIPLIERS[7];
  return 1.0;
};

// Helper function to calculate level from XP
export const calculateLevel = (xp) => {
  // Input validation
  if (typeof xp !== 'number' || isNaN(xp) || xp < 0) {
    return 1;
  }
  return Math.floor(xp / XP_PER_LEVEL) + 1;
};

// Helper function to get XP progress within current level
export const getLevelProgress = (xp) => {
  // Input validation
  if (typeof xp !== 'number' || isNaN(xp) || xp < 0) {
    return 0;
  }
  return xp % XP_PER_LEVEL;
};

// Helper function to get rank based on level and class
export const getRank = (classId, level) => {
  // Input validation
  if (!classId || typeof classId !== 'string') {
    return null;
  }
  if (typeof level !== 'number' || isNaN(level) || level < 1) {
    level = 1;
  }
  const classData = CLASSES[classId];
  if (!classData) return null;

  const rankIndex = Math.min(Math.floor((level - 1) / 5), classData.ranks.length - 1);
  return classData.ranks[rankIndex];
};
