import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-800 mb-6">
            Profile
          </Text>
          
          {/* User Info */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center">
                <Ionicons name="person" size={32} color="#6b7280" />
              </View>
              <View className="ml-4">
                <Text className="text-lg font-semibold text-gray-800">Guest User</Text>
                <Text className="text-gray-600">Not signed in</Text>
              </View>
            </View>
          </View>
          
          {/* Partner Connection */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Partner Connection</Text>
            <TouchableOpacity className="bg-pink-500 rounded-lg p-3 items-center">
              <Text className="text-white font-semibold">Connect with Partner</Text>
            </TouchableOpacity>
          </View>
          
          {/* Preferences */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Preferences</Text>
            <TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-gray-700">Dietary Restrictions</Text>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-gray-700">Cooking Skill Level</Text>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row justify-between items-center py-3">
              <Text className="text-gray-700">Favorite Cuisines</Text>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          {/* Stats */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Your Stats</Text>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-2xl font-bold text-pink-500">0</Text>
                <Text className="text-gray-600 text-sm">Swipes</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-pink-500">0</Text>
                <Text className="text-gray-600 text-sm">Matches</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-pink-500">0</Text>
                <Text className="text-gray-600 text-sm">Cooked</Text>
              </View>
            </View>
          </View>
          
          {/* Sign Out */}
          <TouchableOpacity className="bg-gray-200 rounded-lg p-3 items-center">
            <Text className="text-gray-700 font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}