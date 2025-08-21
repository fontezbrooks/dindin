import { CookedRecipe } from '../models/cooked-recipe.model';
import { Recipe } from '../db/models/recipe.model';
import { DindinUser } from '../db/models/user.model';
import mongoose from 'mongoose';

export interface CookingInsights {
  favoriteTimeOfDay: string;
  averageCookingTime: number;
  mostProductiveDay: string;
  cookingStreak: number;
  improvementAreas: string[];
  personalBests: {
    longestStreak: number;
    mostCookedInADay: number;
    favoriteCuisine: string;
    topRatedRecipe: string;
  };
}

export interface CookingTrends {
  weeklyActivity: { day: string; count: number }[];
  monthlyActivity: { month: string; count: number }[];
  ratingTrends: { period: string; avgRating: number }[];
  cuisinePreferences: { cuisine: string; count: number; avgRating: number }[];
  difficultyProgression: { period: string; avgDifficulty: number }[];
}

export class CookingAnalyticsService {
  /**
   * Generate personalized cooking insights for a user
   */
  static async generateCookingInsights(userId: string): Promise<CookingInsights> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get all cooking sessions for the user
    const cookingSessions = await CookedRecipe.find({ userId: userObjectId })
      .populate('recipeId')
      .sort({ cookedAt: -1 })
      .lean();

    if (cookingSessions.length === 0) {
      return this.getEmptyInsights();
    }

    // Calculate favorite time of day
    const timeSlots = this.categorizeByTimeOfDay(cookingSessions);
    const favoriteTimeOfDay = this.getMostFrequent(timeSlots);

    // Calculate average cooking time
    const totalTime = cookingSessions
      .filter(session => session.timeSpent)
      .reduce((sum, session) => sum + (session.timeSpent || 0), 0);
    const averageCookingTime = totalTime / cookingSessions.length;

    // Find most productive day of week
    const dayOfWeekCounts = this.categorizeByDayOfWeek(cookingSessions);
    const mostProductiveDay = this.getMostFrequent(dayOfWeekCounts);

    // Calculate current cooking streak
    const cookingStreak = this.calculateCookingStreak(cookingSessions);

    // Identify improvement areas
    const improvementAreas = this.identifyImprovementAreas(cookingSessions);

    // Calculate personal bests
    const personalBests = await this.calculatePersonalBests(userObjectId, cookingSessions);

    return {
      favoriteTimeOfDay,
      averageCookingTime,
      mostProductiveDay,
      cookingStreak,
      improvementAreas,
      personalBests,
    };
  }

  /**
   * Generate cooking trends and analytics over time
   */
  static async generateCookingTrends(userId: string, months: number = 6): Promise<CookingTrends> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    // Get cooking sessions within the time period
    const cookingSessions = await CookedRecipe.find({
      userId: userObjectId,
      cookedAt: { $gte: cutoffDate }
    })
      .populate('recipeId')
      .sort({ cookedAt: -1 })
      .lean();

    // Weekly activity analysis
    const weeklyActivity = this.analyzeWeeklyActivity(cookingSessions);

    // Monthly activity analysis
    const monthlyActivity = this.analyzeMonthlyActivity(cookingSessions, months);

    // Rating trends over time
    const ratingTrends = this.analyzeRatingTrends(cookingSessions);

    // Cuisine preferences with ratings
    const cuisinePreferences = await this.analyzeCuisinePreferences(cookingSessions);

    // Difficulty progression over time
    const difficultyProgression = this.analyzeDifficultyProgression(cookingSessions);

    return {
      weeklyActivity,
      monthlyActivity,
      ratingTrends,
      cuisinePreferences,
      difficultyProgression,
    };
  }

  /**
   * Get cooking recommendations based on user history
   */
  static async getPersonalizedRecommendations(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Get user's cooking history and preferences
    const user = await DindinUser.findById(userObjectId);
    const cookingSessions = await CookedRecipe.find({ userId: userObjectId })
      .populate('recipeId')
      .sort({ cookedAt: -1 })
      .limit(50) // Recent sessions for analysis
      .lean();

    if (!user || cookingSessions.length === 0) {
      return this.getDefaultRecommendations();
    }

    // Analyze preferences
    const preferredCuisines = this.extractPreferredCuisines(cookingSessions);
    const preferredDifficulty = this.extractPreferredDifficulty(cookingSessions);
    const averageRating = cookingSessions
      .filter(s => s.rating)
      .reduce((sum, s) => sum + (s.rating || 0), 0) / cookingSessions.length;

    // Get recipes user hasn't cooked
    const cookedRecipeIds = cookingSessions.map(s => s.recipeId);
    const recommendations = await Recipe.find({
      _id: { $nin: cookedRecipeIds },
      cuisine: { $in: preferredCuisines },
      difficulty: preferredDifficulty,
      cook_time: { $lte: user.preferences.maxCookTime || 60 },
      isActive: true,
    })
      .limit(10)
      .lean();

    return {
      recommendations,
      reasoning: {
        preferredCuisines,
        preferredDifficulty,
        averageRating,
        cookingHistory: cookingSessions.length,
      },
    };
  }

  /**
   * Calculate cooking goals and achievements
   */
  static async calculateCookingGoals(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const cookingSessions = await CookedRecipe.find({ userId: userObjectId });
    
    const goals = {
      totalRecipes: {
        current: cookingSessions.length,
        targets: [10, 25, 50, 100, 200],
        nextTarget: this.getNextTarget(cookingSessions.length, [10, 25, 50, 100, 200]),
      },
      cookingStreak: {
        current: this.calculateCookingStreak(cookingSessions),
        targets: [3, 7, 14, 30, 60],
        nextTarget: this.getNextTarget(
          this.calculateCookingStreak(cookingSessions), 
          [3, 7, 14, 30, 60]
        ),
      },
      cuisineExplorer: {
        current: this.countUniqueCuisines(cookingSessions),
        targets: [3, 5, 10, 15, 20],
        nextTarget: this.getNextTarget(
          this.countUniqueCuisines(cookingSessions), 
          [3, 5, 10, 15, 20]
        ),
      },
      masterChef: {
        current: cookingSessions.filter(s => s.rating && s.rating >= 5).length,
        targets: [1, 5, 10, 25, 50],
        nextTarget: this.getNextTarget(
          cookingSessions.filter(s => s.rating && s.rating >= 5).length,
          [1, 5, 10, 25, 50]
        ),
      },
    };

    return goals;
  }

  // Private helper methods

  private static getEmptyInsights(): CookingInsights {
    return {
      favoriteTimeOfDay: 'evening',
      averageCookingTime: 0,
      mostProductiveDay: 'Sunday',
      cookingStreak: 0,
      improvementAreas: ['Start cooking to get insights!'],
      personalBests: {
        longestStreak: 0,
        mostCookedInADay: 0,
        favoriteCuisine: 'Unknown',
        topRatedRecipe: 'None yet',
      },
    };
  }

  private static categorizeByTimeOfDay(sessions: any[]): Record<string, number> {
    const timeSlots = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    
    sessions.forEach(session => {
      const hour = new Date(session.cookedAt).getHours();
      if (hour >= 6 && hour < 12) timeSlots.morning++;
      else if (hour >= 12 && hour < 17) timeSlots.afternoon++;
      else if (hour >= 17 && hour < 22) timeSlots.evening++;
      else timeSlots.night++;
    });

    return timeSlots;
  }

  private static categorizeByDayOfWeek(sessions: any[]): Record<string, number> {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts: Record<string, number> = {};
    days.forEach(day => dayCounts[day] = 0);

    sessions.forEach(session => {
      const dayIndex = new Date(session.cookedAt).getDay();
      dayCounts[days[dayIndex]]++;
    });

    return dayCounts;
  }

  private static getMostFrequent(counts: Record<string, number>): string {
    return Object.entries(counts).reduce((max, [key, value]) => 
      value > counts[max] ? key : max, 
      Object.keys(counts)[0]
    );
  }

  private static calculateCookingStreak(sessions: any[]): number {
    if (sessions.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);

    // Group sessions by date
    const sessionsByDate = new Map();
    sessions.forEach(session => {
      const date = new Date(session.cookedAt);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];
      if (!sessionsByDate.has(dateStr)) {
        sessionsByDate.set(dateStr, 0);
      }
      sessionsByDate.set(dateStr, sessionsByDate.get(dateStr) + 1);
    });

    // Calculate streak backwards from today
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (sessionsByDate.has(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  private static identifyImprovementAreas(sessions: any[]): string[] {
    const areas: string[] = [];
    
    // Check rating consistency
    const ratedSessions = sessions.filter(s => s.rating);
    if (ratedSessions.length > 0) {
      const avgRating = ratedSessions.reduce((sum, s) => sum + s.rating, 0) / ratedSessions.length;
      if (avgRating < 3.5) {
        areas.push('Focus on easier recipes to build confidence');
      }
    }

    // Check cooking frequency
    if (sessions.length > 0) {
      const daysSinceFirst = Math.floor(
        (Date.now() - new Date(sessions[sessions.length - 1].cookedAt).getTime()) 
        / (1000 * 60 * 60 * 24)
      );
      const frequency = sessions.length / Math.max(daysSinceFirst, 1);
      if (frequency < 0.2) { // Less than once every 5 days
        areas.push('Try to cook more regularly');
      }
    }

    // Check cuisine diversity
    const uniqueCuisines = new Set(
      sessions
        .filter(s => s.recipeId?.cuisine)
        .flatMap(s => s.recipeId.cuisine)
    );
    if (uniqueCuisines.size < 3 && sessions.length > 10) {
      areas.push('Explore different cuisines');
    }

    return areas.length > 0 ? areas : ['Keep up the great cooking!'];
  }

  private static async calculatePersonalBests(userId: mongoose.Types.ObjectId, sessions: any[]) {
    // Longest streak calculation (simplified)
    const longestStreak = this.calculateCookingStreak(sessions);
    
    // Most cooked in a day
    const dailyCounts = new Map();
    sessions.forEach(session => {
      const date = new Date(session.cookedAt).toISOString().split('T')[0];
      dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
    });
    const mostCookedInADay = Math.max(...Array.from(dailyCounts.values()), 0);

    // Favorite cuisine
    const cuisineCounts = new Map();
    sessions.forEach(session => {
      if (session.recipeId?.cuisine) {
        session.recipeId.cuisine.forEach((cuisine: string) => {
          cuisineCounts.set(cuisine, (cuisineCounts.get(cuisine) || 0) + 1);
        });
      }
    });
    const favoriteCuisine = cuisineCounts.size > 0 
      ? Array.from(cuisineCounts.entries()).reduce((max, [cuisine, count]) =>
          count > (cuisineCounts.get(max) || 0) ? cuisine : max
        )
      : 'None';

    // Top rated recipe
    const topRatedSession = sessions
      .filter(s => s.rating && s.recipeId?.title)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
    const topRatedRecipe = topRatedSession?.recipeId?.title || 'None yet';

    return {
      longestStreak,
      mostCookedInADay,
      favoriteCuisine,
      topRatedRecipe,
    };
  }

  private static analyzeWeeklyActivity(sessions: any[]) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyCounts = days.map(day => ({ day, count: 0 }));

    sessions.forEach(session => {
      const dayIndex = new Date(session.cookedAt).getDay();
      weeklyCounts[dayIndex].count++;
    });

    return weeklyCounts;
  }

  private static analyzeMonthlyActivity(sessions: any[], months: number) {
    const monthlyData = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const count = sessions.filter(session => {
        const sessionMonth = new Date(session.cookedAt);
        return sessionMonth.getMonth() === month.getMonth() && 
               sessionMonth.getFullYear() === month.getFullYear();
      }).length;

      monthlyData.push({ month: monthStr, count });
    }

    return monthlyData;
  }

  private static analyzeRatingTrends(sessions: any[]) {
    const ratedSessions = sessions.filter(s => s.rating);
    const periods = [];
    
    // Group by month and calculate average rating
    const monthlyRatings = new Map();
    ratedSessions.forEach(session => {
      const monthKey = new Date(session.cookedAt).toISOString().slice(0, 7);
      if (!monthlyRatings.has(monthKey)) {
        monthlyRatings.set(monthKey, []);
      }
      monthlyRatings.get(monthKey).push(session.rating);
    });

    Array.from(monthlyRatings.entries()).forEach(([period, ratings]) => {
      const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      periods.push({ period, avgRating: Math.round(avgRating * 10) / 10 });
    });

    return periods.sort((a, b) => a.period.localeCompare(b.period));
  }

  private static async analyzeCuisinePreferences(sessions: any[]) {
    const cuisineData = new Map();

    sessions.forEach(session => {
      if (session.recipeId?.cuisine) {
        session.recipeId.cuisine.forEach((cuisine: string) => {
          if (!cuisineData.has(cuisine)) {
            cuisineData.set(cuisine, { count: 0, totalRating: 0, ratingCount: 0 });
          }
          const data = cuisineData.get(cuisine);
          data.count++;
          if (session.rating) {
            data.totalRating += session.rating;
            data.ratingCount++;
          }
        });
      }
    });

    return Array.from(cuisineData.entries()).map(([cuisine, data]) => ({
      cuisine,
      count: data.count,
      avgRating: data.ratingCount > 0 ? data.totalRating / data.ratingCount : 0,
    })).sort((a, b) => b.count - a.count);
  }

  private static analyzeDifficultyProgression(sessions: any[]) {
    const difficultyValues = { easy: 1, medium: 2, hard: 3 };
    const periods = new Map();

    sessions.forEach(session => {
      if (session.recipeId?.difficulty) {
        const monthKey = new Date(session.cookedAt).toISOString().slice(0, 7);
        if (!periods.has(monthKey)) {
          periods.set(monthKey, []);
        }
        const difficultyValue = difficultyValues[session.recipeId.difficulty.toLowerCase()] || 1;
        periods.get(monthKey).push(difficultyValue);
      }
    });

    return Array.from(periods.entries()).map(([period, difficulties]) => {
      const avgDifficulty = difficulties.reduce((sum, d) => sum + d, 0) / difficulties.length;
      return { period, avgDifficulty: Math.round(avgDifficulty * 10) / 10 };
    }).sort((a, b) => a.period.localeCompare(b.period));
  }

  private static getDefaultRecommendations() {
    return {
      recommendations: [],
      reasoning: {
        preferredCuisines: [],
        preferredDifficulty: 'easy',
        averageRating: 0,
        cookingHistory: 0,
      },
    };
  }

  private static extractPreferredCuisines(sessions: any[]): string[] {
    const cuisineCounts = new Map();
    sessions.forEach(session => {
      if (session.recipeId?.cuisine) {
        session.recipeId.cuisine.forEach((cuisine: string) => {
          cuisineCounts.set(cuisine, (cuisineCounts.get(cuisine) || 0) + 1);
        });
      }
    });

    return Array.from(cuisineCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cuisine]) => cuisine);
  }

  private static extractPreferredDifficulty(sessions: any[]): string {
    const difficultyCounts = new Map();
    sessions.forEach(session => {
      if (session.recipeId?.difficulty) {
        const diff = session.recipeId.difficulty.toLowerCase();
        difficultyCounts.set(diff, (difficultyCounts.get(diff) || 0) + 1);
      }
    });

    return Array.from(difficultyCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'easy';
  }

  private static getNextTarget(current: number, targets: number[]): number | null {
    return targets.find(target => target > current) || null;
  }

  private static countUniqueCuisines(sessions: any[]): number {
    const uniqueCuisines = new Set();
    sessions.forEach(session => {
      if (session.recipeId?.cuisine) {
        session.recipeId.cuisine.forEach((cuisine: string) => {
          uniqueCuisines.add(cuisine);
        });
      }
    });
    return uniqueCuisines.size;
  }
}