import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import {
  User,
  Bell,
  LogOut,
  Trash2,
  Edit3,
  Leaf,
  Wheat,
  Milk,
  AlertCircle,
  Heart,
  Clock,
  Star,
  TrendingUp
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dietaryPreferences, setDietaryPreferences] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    nutFree: false,
  });

  const { user, logout } = useAuthStore();

  const toggleDietaryPreference = (preference: keyof typeof dietaryPreferences) => {
    setDietaryPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }));
  };

  const handleLogout = () => {
    console.log('Logout pressed');
    logout();
    router.replace('/auth/login');
  };

  const handleDeleteAccount = () => {
    console.log('Delete account pressed');
    logout();
    router.replace('/auth/login');
  };

  // Mock user data
  const userStats = {
    matches: 42,
    favorites: 18,
    preferences: 5,
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>

          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <User size={48} color="#f97316" />
            </View>
            <Text style={styles.userName}>{user?.name || "Alex Morgan"}</Text>
            <Text style={styles.userSubtitle}>Food Explorer</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.matches}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.favorites}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.preferences}</Text>
              <Text style={styles.statLabel}>Prefs</Text>
            </View>
          </View>
        </View>

        {/* 2x2 Grid Layout */}
        <View style={styles.gridContainer}>
          {/* Dietary Preferences - Top Left */}
          <View style={styles.gridCard}>
            <View style={styles.cardHeader}>
              <Leaf size={20} color="#10b981" />
              <Text style={styles.cardTitle}>Dietary</Text>
            </View>
            <View style={styles.preferencesGrid}>
              {Object.entries(dietaryPreferences).slice(0, 4).map(([key, value], index) => (
                <TouchableOpacity
                  key={key}
                  style={styles.preferenceItem}
                  onPress={() => toggleDietaryPreference(key as keyof typeof dietaryPreferences)}
                >
                  <View style={styles.preferenceContent}>
                    {key === 'vegetarian' && <Leaf size={16} color="#10b981" />}
                    {key === 'vegan' && <Leaf size={16} color="#10b981" />}
                    {key === 'glutenFree' && <Wheat size={16} color="#f97316" />}
                    {key === 'dairyFree' && <Milk size={16} color="#3b82f6" />}
                    <Text style={styles.preferenceText}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Text>
                  </View>
                  <Switch
                    trackColor={{ false: "#d1d5db", true: "#f97316" }}
                    thumbColor={value ? "#ffffff" : "#f4f4f5"}
                    ios_backgroundColor="#d1d5db"
                    onValueChange={() => toggleDietaryPreference(key as keyof typeof dietaryPreferences)}
                    value={value}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quick Stats - Top Right */}
          <View style={styles.gridCard}>
            <View style={styles.cardHeader}>
              <TrendingUp size={20} color="#f97316" />
              <Text style={styles.cardTitle}>Quick Stats</Text>
            </View>
            <View style={styles.quickStats}>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatLabel}>Top Cuisine</Text>
                <Text style={styles.quickStatValue}>Italian</Text>
              </View>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatLabel}>Match Rate</Text>
                <Text style={styles.quickStatValue}>72%</Text>
              </View>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatLabel}>Favorite Time</Text>
                <Text style={styles.quickStatValue}>Evening</Text>
              </View>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatLabel}>Discovery Streak</Text>
                <Text style={styles.quickStatValue}>12 days</Text>
              </View>
            </View>
          </View>

          {/* Notifications - Bottom Left */}
          <View style={styles.gridCard}>
            <View style={styles.cardHeader}>
              <Bell size={20} color="#f97316" />
              <Text style={styles.cardTitle}>Notifications</Text>
            </View>
            <View style={styles.notificationSettings}>
              <View style={styles.settingItem}>
                <View style={styles.settingContent}>
                  <Bell size={16} color="#f97316" style={styles.settingIcon} />
                  <Text style={styles.settingText}>Match Alerts</Text>
                </View>
                <Switch
                  trackColor={{ false: "#d1d5db", true: "#f97316" }}
                  thumbColor={notificationsEnabled ? "#ffffff" : "#f4f4f5"}
                  ios_backgroundColor="#d1d5db"
                  onValueChange={setNotificationsEnabled}
                  value={notificationsEnabled}
                />
              </View>
              <View style={styles.settingItem}>
                <View style={styles.settingContent}>
                  <Heart size={16} color="#10b981" style={styles.settingIcon} />
                  <Text style={styles.settingText}>Like Notifications</Text>
                </View>
                <Switch
                  trackColor={{ false: "#d1d5db", true: "#f97316" }}
                  thumbColor={notificationsEnabled ? "#ffffff" : "#f4f4f5"}
                  ios_backgroundColor="#d1d5db"
                  value={true}
                />
              </View>
            </View>
          </View>

          {/* Account Actions - Bottom Right */}
          <View style={styles.gridCard}>
            <View style={styles.cardHeader}>
              <User size={20} color="#6b7280" />
              <Text style={styles.cardTitle}>Account</Text>
            </View>
            <View style={styles.accountActions}>
              <TouchableOpacity style={styles.actionItem}>
                <View style={styles.actionContent}>
                  <Edit3 size={16} color="#6b7280" style={styles.actionIcon} />
                  <Text style={styles.actionText}>Edit Profile</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionItem}
                onPress={handleLogout}
              >
                <View style={styles.actionContent}>
                  <LogOut size={16} color="#10b981" style={styles.actionIcon} />
                  <Text style={styles.actionText}>Logout</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionItem}
                onPress={handleDeleteAccount}
              >
                <View style={styles.actionContent}>
                  <Trash2 size={16} color="#ef4444" style={styles.actionIcon} />
                  <Text style={styles.actionText}>Delete Account</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Additional Dietary Preferences (if more than 4) */}
        {Object.entries(dietaryPreferences).length > 4 && (
          <View style={styles.additionalSection}>
            <Text style={styles.sectionTitle}>Additional Preferences</Text>
            <View style={styles.card}>
              {Object.entries(dietaryPreferences).slice(4).map(([key, value], index) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.preferenceItem,
                    index < Object.entries(dietaryPreferences).slice(4).length - 1 && styles.preferenceItemBorder
                  ]}
                  onPress={() => toggleDietaryPreference(key as keyof typeof dietaryPreferences)}
                >
                  <View style={styles.preferenceContent}>
                    {key === 'nutFree' && <AlertCircle size={20} color="#ef4444" style={styles.preferenceIcon} />}
                    <Text style={styles.preferenceText}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Text>
                  </View>
                  <Switch
                    trackColor={{ false: "#d1d5db", true: "#f97316" }}
                    thumbColor={value ? "#ffffff" : "#f4f4f5"}
                    ios_backgroundColor="#d1d5db"
                    onValueChange={() => toggleDietaryPreference(key as keyof typeof dietaryPreferences)}
                    value={value}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef3c7',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fef3c7',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fed7aa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  userSubtitle: {
    color: '#6b7280',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fed7aa',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ea580c',
  },
  statLabel: {
    color: '#4b5563',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  gridCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
    minHeight: 200,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  preferencesGrid: {
    gap: 8,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  preferenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceText: {
    color: '#374151',
    fontSize: 12,
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  preferenceIcon: {
    marginRight: 6,
  },
  quickStats: {
    gap: 8,
  },
  quickStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  quickStatLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  quickStatValue: {
    fontWeight: '600',
    color: '#ea580c',
    fontSize: 12,
  },
  notificationSettings: {
    gap: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 6,
  },
  settingText: {
    color: '#374151',
    fontSize: 12,
  },
  accountActions: {
    gap: 8,
  },
  actionItem: {
    paddingVertical: 6,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginRight: 6,
  },
  actionText: {
    color: '#374151',
    fontSize: 12,
  },
  additionalSection: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  preferenceItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
});
