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
  AlertCircle
} from 'lucide-react-native';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dietaryPreferences, setDietaryPreferences] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    nutFree: false,
  });

  const toggleDietaryPreference = (preference: keyof typeof dietaryPreferences) => {
    setDietaryPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }));
  };

  const handleLogout = () => {
    console.log('Logout pressed');
    // Implement logout logic here
  };

  const handleDeleteAccount = () => {
    console.log('Delete account pressed');
    // Implement delete account logic here
  };

  // Mock user data
  const user = {
    name: "Alex Morgan",
    matches: 42,
    favorites: 18,
    preferences: 5,
  };

  return (
    <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
            <Text style={styles.headerTitle}>My Profile</Text>

            {/* User Info */}
            <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
                <User size={48} color="#f97316" />
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userSubtitle}>Food Explorer</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
            <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user.matches}</Text>
                <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user.favorites}</Text>
                <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user.preferences}</Text>
                <Text style={styles.statLabel}>Prefs</Text>
            </View>
            </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dietary Preferences</Text>

            <View style={styles.card}>
            {Object.entries(dietaryPreferences).map(([key, value], index) => (
                <TouchableOpacity
                key={key}
                style={[
                    styles.preferenceItem,
                    index < Object.entries(dietaryPreferences).length - 1 && styles.preferenceItemBorder
                ]}
                onPress={() => toggleDietaryPreference(key as keyof typeof dietaryPreferences)}
                >
                <View style={styles.preferenceContent}>
                    {key === 'vegetarian' && <Leaf size={20} color="#10b981" style={styles.preferenceIcon} />}
                    {key === 'vegan' && <Leaf size={20} color="#10b981" style={styles.preferenceIcon} />}
                    {key === 'glutenFree' && <Wheat size={20} color="#f97316" style={styles.preferenceIcon} />}
                    {key === 'dairyFree' && <Milk size={20} color="#3b82f6" style={styles.preferenceIcon} />}
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

        {/* Notification Settings */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>

            <View style={styles.card}>
            <View style={styles.settingItem}>
                <View style={styles.settingContent}>
                <Bell size={20} color="#f97316" style={styles.settingIcon} />
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
            </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Settings</Text>

            <View style={styles.card}>
            <TouchableOpacity style={[styles.settingItem, styles.settingItemBorder]}>
                <View style={styles.settingContent}>
                <Edit3 size={20} color="#6b7280" style={styles.settingIcon} />
                <Text style={styles.settingText}>Edit Profile</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.settingItem, styles.settingItemBorder]}
                onPress={handleLogout}
            >
                <View style={styles.settingContent}>
                <LogOut size={20} color="#10b981" style={styles.settingIcon} />
                <Text style={styles.settingText}>Logout</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.settingItem}
                onPress={handleDeleteAccount}
            >
                <View style={styles.settingContent}>
                <Trash2 size={20} color="#ef4444" style={styles.settingIcon} />
                <Text style={styles.settingText}>Delete Account</Text>
                </View>
            </TouchableOpacity>
            </View>
        </View>

        {/* Personalized Stats */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Stats</Text>

            <View style={styles.card}>
            <View style={styles.statRow}>
                <Text style={styles.statLabel}>Top Cuisine</Text>
                <Text style={styles.statValue}>Italian</Text>
            </View>

            <View style={styles.statRow}>
                <Text style={styles.statLabel}>Match Rate</Text>
                <Text style={styles.statValue}>72%</Text>
            </View>

            <View style={styles.statRow}>
                <Text style={styles.statLabel}>Favorite Time</Text>
                <Text style={styles.statValue}>Evening</Text>
            </View>

            <View style={styles.statRow}>
                <Text style={styles.statLabel}>Discovery Streak</Text>
                <Text style={styles.statValue}>12 days</Text>
            </View>
            </View>
        </View>
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#fef3c7', // orange-50 equivalent
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
        color: '#1f2937', // gray-800
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
        backgroundColor: '#fed7aa', // orange-100
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937', // gray-800
    },
    userSubtitle: {
        color: '#6b7280', // gray-500
        marginTop: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fed7aa', // orange-100
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
        color: '#ea580c', // orange-600
    },
    statLabel: {
        color: '#4b5563', // gray-600
    },
    section: {
        paddingHorizontal: 24,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937', // gray-800
        marginBottom: 16,
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
    preferenceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    preferenceItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6', // gray-100
    },
    preferenceContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    preferenceIcon: {
        marginRight: 12,
    },
    preferenceText: {
        color: '#374151', // gray-700
        textTransform: 'capitalize',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    settingItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6', // gray-100
    },
    settingContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingIcon: {
        marginRight: 12,
    },
    settingText: {
        color: '#374151', // gray-700
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statValue: {
        fontWeight: '600',
        color: '#ea580c', // orange-600
    },
    text: {
        color: '#374151',
    }
});
