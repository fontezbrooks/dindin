import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LibraryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-800 mb-4">
            Recipe Library 📚
          </Text>
          
          <View className="mb-4">
            <Text className="text-lg font-semibold text-gray-700 mb-2">Your Favorites</Text>
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-gray-600">
                Your liked recipes will appear here
              </Text>
            </View>
          </View>
          
          <View className="mb-4">
            <Text className="text-lg font-semibold text-gray-700 mb-2">Recently Cooked</Text>
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-gray-600">
                Track recipes you've made
              </Text>
            </View>
          </View>
          
          <View className="mb-4">
            <Text className="text-lg font-semibold text-gray-700 mb-2">Browse All</Text>
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-gray-600">
                Explore all available recipes
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}