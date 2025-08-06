import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
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
    <ScrollView className="flex-1 bg-orange-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-6 px-6 rounded-b-3xl shadow-sm">
        <Text className="text-2xl font-bold text-gray-800 text-center mb-6">My Profile</Text>

        {/* User Info */}
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-orange-100 items-center justify-center mb-4">
            <User size={48} color="#f97316" />
          </View>
          <Text className="text-2xl font-bold text-gray-800">{user.name}</Text>
          <Text className="text-gray-500 mt-1">Food Explorer</Text>
        </View>

        {/* Stats */}
        <View className="flex-row justify-around bg-orange-100 rounded-2xl py-4 mb-6">
          <View className="items-center">
            <Text className="text-2xl font-bold text-orange-600">{user.matches}</Text>
            <Text className="text-gray-600">Matches</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-orange-600">{user.favorites}</Text>
            <Text className="text-gray-600">Favorites</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-orange-600">{user.preferences}</Text>
            <Text className="text-gray-600">Prefs</Text>
          </View>
        </View>
      </View>

      {/* Preferences Section */}
      <View className="px-6 mt-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">Dietary Preferences</Text>

        <View className="bg-white rounded-2xl p-4 shadow-sm">
          {Object.entries(dietaryPreferences).map(([key, value], index) => (
            <TouchableOpacity
              key={key}
              className={`flex-row items-center justify-between py-3 ${index < Object.entries(dietaryPreferences).length - 1 ? 'border-b border-gray-100' : ''}`}
              onPress={() => toggleDietaryPreference(key as keyof typeof dietaryPreferences)}
            >
              <View className="flex-row items-center">
                {key === 'vegetarian' && <Leaf size={20} color="#10b981" className="mr-3" />}
                {key === 'vegan' && <Leaf size={20} color="#10b981" className="mr-3" />}
                {key === 'glutenFree' && <Wheat size={20} color="#f97316" className="mr-3" />}
                {key === 'dairyFree' && <Milk size={20} color="#3b82f6" className="mr-3" />}
                {key === 'nutFree' && <AlertCircle size={20} color="#ef4444" className="mr-3" />}
                <Text className="text-gray-700 capitalize">
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
      <View className="px-6 mt-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">Notifications</Text>

        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Bell size={20} color="#f97316" className="mr-3" />
              <Text className="text-gray-700">Match Alerts</Text>
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
      <View className="px-6 mt-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">Account Settings</Text>

        <View className="bg-white rounded-2xl shadow-sm">
          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <Edit3 size={20} color="#6b7280" className="mr-3" />
              <Text className="text-gray-700">Edit Profile</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between p-4 border-b border-gray-100"
            onPress={handleLogout}
          >
            <View className="flex-row items-center">
              <LogOut size={20} color="#10b981" className="mr-3" />
              <Text className="text-gray-700">Logout</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between p-4"
            onPress={handleDeleteAccount}
          >
            <View className="flex-row items-center">
              <Trash2 size={20} color="#ef4444" className="mr-3" />
              <Text className="text-gray-700">Delete Account</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Personalized Stats */}
      <View className="px-6 mt-6 mb-8">
        <Text className="text-xl font-bold text-gray-800 mb-4">Your Stats</Text>

        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-600">Top Cuisine</Text>
            <Text className="font-semibold text-orange-600">Italian</Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-600">Match Rate</Text>
            <Text className="font-semibold text-orange-600">72%</Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-600">Favorite Time</Text>
            <Text className="font-semibold text-orange-600">Evening</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600">Discovery Streak</Text>
            <Text className="font-semibold text-orange-600">12 days</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
