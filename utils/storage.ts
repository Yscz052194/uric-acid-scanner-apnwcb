
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodLog, UserProfile, DailyStats } from '../types/FoodData';

const KEYS = {
  USER_PROFILE: 'user_profile',
  FOOD_LOGS: 'food_logs',
  DAILY_STATS: 'daily_stats',
  SETTINGS: 'app_settings',
};

export const StorageService = {
  // User Profile
  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
      console.log('User profile saved successfully');
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  },

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
      if (data) {
        const profile = JSON.parse(data);
        // Convert date strings back to Date objects
        profile.createdAt = new Date(profile.createdAt);
        profile.updatedAt = new Date(profile.updatedAt);
        return profile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  // Food Logs
  async saveFoodLog(log: FoodLog): Promise<void> {
    try {
      const existingLogs = await this.getFoodLogs();
      const updatedLogs = [...existingLogs, log];
      await AsyncStorage.setItem(KEYS.FOOD_LOGS, JSON.stringify(updatedLogs));
      console.log('Food log saved successfully');
    } catch (error) {
      console.error('Error saving food log:', error);
      throw error;
    }
  },

  async getFoodLogs(): Promise<FoodLog[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.FOOD_LOGS);
      if (data) {
        const logs = JSON.parse(data);
        // Convert date strings back to Date objects
        return logs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting food logs:', error);
      return [];
    }
  },

  async deleteFoodLog(logId: string): Promise<void> {
    try {
      const existingLogs = await this.getFoodLogs();
      const updatedLogs = existingLogs.filter(log => log.id !== logId);
      await AsyncStorage.setItem(KEYS.FOOD_LOGS, JSON.stringify(updatedLogs));
      console.log('Food log deleted successfully');
    } catch (error) {
      console.error('Error deleting food log:', error);
      throw error;
    }
  },

  // Daily Stats
  async getDailyStats(date: string): Promise<DailyStats | null> {
    try {
      const data = await AsyncStorage.getItem(`${KEYS.DAILY_STATS}_${date}`);
      if (data) {
        const stats = JSON.parse(data);
        // Convert date strings back to Date objects
        stats.logs = stats.logs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
        return stats;
      }
      return null;
    } catch (error) {
      console.error('Error getting daily stats:', error);
      return null;
    }
  },

  async saveDailyStats(stats: DailyStats): Promise<void> {
    try {
      await AsyncStorage.setItem(`${KEYS.DAILY_STATS}_${stats.date}`, JSON.stringify(stats));
      console.log('Daily stats saved successfully');
    } catch (error) {
      console.error('Error saving daily stats:', error);
      throw error;
    }
  },

  // Utility functions
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  },

  async getStorageSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      return totalSize;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }
};

// Helper function to format date for storage keys
export const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Helper function to get today's date key
export const getTodayKey = (): string => {
  return formatDateKey(new Date());
};
