import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Heart, X, User, Search, Flame, Star } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Mock recipe data
const recipes = [
  {
    id: 1,
    title: "Creamy Mushroom Pasta",
    cookTime: "25 mins",
    difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1515516970627-3f00c6f75f5a?w=800&h=600&fit=crop",
    description: "Rich and creamy pasta with wild mushrooms and parmesan cheese",
    rating: 4.8,
    matches: 1240
  },
  {
    id: 2,
    title: "Spicy Tuna Poke Bowl",
    cookTime: "15 mins",
    difficulty: "Medium",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop",
    description: "Fresh ahi tuna with spicy mayo, avocado, and cucumber",
    rating: 4.9,
    matches: 980
  },
  {
    id: 3,
    title: "BBQ Chicken Pizza",
    cookTime: "30 mins",
    difficulty: "Medium",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop",
    description: "Homemade pizza with smoky BBQ chicken and melted cheese",
    rating: 4.7,
    matches: 1560
  },
  {
    id: 4,
    title: "Vegetable Stir Fry",
    cookTime: "20 mins",
    difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
    description: "Colorful vegetables in a savory sauce served over rice",
    rating: 4.6,
    matches: 870
  },
  {
    id: 5,
    title: "Beef Tacos",
    cookTime: "35 mins",
    difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop",
    description: "Authentic Mexican tacos with seasoned beef and fresh toppings",
    rating: 4.9,
    matches: 2100
  }
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [matches, setMatches] = useState<number[]>([]);

  const handleSwipe = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);

    if (direction === 'right') {
      setMatches(prev => [...prev, recipes[currentIndex].id]);
    }

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };

  const resetSwipes = () => {
    setCurrentIndex(0);
    setMatches([]);
  };

  const currentRecipe = recipes[currentIndex];

  return (
    <View className="flex-1 bg-orange-50">
      {/* Header */}
      <View className="bg-orange-500 pt-12 pb-6 px-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity className="p-2">
            <User color="white" size={24} />
          </TouchableOpacity>

          <View className="flex-row items-center">
            <Flame color="white" size={24} />
            <Text className="text-white text-xl font-bold ml-2">DinDin</Text>
          </View>

          <TouchableOpacity className="p-2">
            <Search color="white" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1">
        {currentIndex < recipes.length ? (
          <View className="flex-1 items-center justify-center px-4">
            {/* Recipe Card */}
            <View
              className={`w-full rounded-3xl overflow-hidden bg-white shadow-lg ${
                swipeDirection === 'left' ? 'rotate-[-30deg] translate-x-[-200px]' :
                swipeDirection === 'right' ? 'rotate-[30deg] translate-x-[200px]' : ''
              } transition-all duration-300 ease-in-out`}
              style={{ height: width * 1.2 }}
            >
              <Image
                source={{ uri: currentRecipe.image }}
                className="w-full h-2/3"
                resizeMode="cover"
              />

              <View className="p-4 h-1/3">
                <View className="flex-row justify-between items-start">
                  <Text className="text-xl font-bold text-gray-800">{currentRecipe.title}</Text>
                  <View className="flex-row items-center">
                    <Star color="#f59e0b" fill="#f59e0b" size={16} />
                    <Text className="text-gray-700 ml-1">{currentRecipe.rating}</Text>
                  </View>
                </View>

                <Text className="text-gray-600 mt-1">{currentRecipe.description}</Text>

                <View className="flex-row mt-2">
                  <Text className="text-orange-500 font-medium">{currentRecipe.cookTime}</Text>
                  <Text className="text-gray-400 mx-2">•</Text>
                  <Text className="text-gray-600">{currentRecipe.difficulty}</Text>
                  <Text className="text-gray-400 mx-2">•</Text>
                  <Text className="text-gray-600">{currentRecipe.matches} matches</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-center mt-8 space-x-8">
              <TouchableOpacity
                className="w-16 h-16 rounded-full bg-white shadow-lg items-center justify-center"
                onPress={() => handleSwipe('left')}
              >
                <X color="#ef4444" size={32} />
              </TouchableOpacity>

              <TouchableOpacity
                className="w-16 h-16 rounded-full bg-white shadow-lg items-center justify-center"
                onPress={() => handleSwipe('right')}
              >
                <Heart color="#10b981" fill="#10b981" size={32} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Match Summary Screen
          <View className="flex-1 items-center justify-center px-8">
            <View className="bg-white rounded-3xl p-8 items-center shadow-lg w-full">
              <Flame color="#f97316" size={48} />
              <Text className="text-2xl font-bold text-gray-800 mt-4">Your Matches</Text>
              <Text className="text-gray-600 mt-2 text-center">
                You&apos;ve matched with {matches.length} delicious recipes!
              </Text>

              <View className="mt-6 w-full">
                {matches.map((id) => {
                  const recipe = recipes.find(r => r.id === id);
                  return recipe ? (
                    <View key={id} className="flex-row items-center p-3 border-b border-gray-100">
                      <Image
                        source={{ uri: recipe.image }}
                        className="w-12 h-12 rounded-lg"
                      />
                      <Text className="ml-3 font-medium text-gray-800">{recipe.title}</Text>
                    </View>
                  ) : null;
                })}
              </View>

              <TouchableOpacity
                className="mt-8 py-3 px-6 bg-orange-500 rounded-full"
                onPress={resetSwipes}
              >
                <Text className="text-white font-bold">Swipe Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Navigation */}
      <View className="flex-row justify-around bg-white py-4 border-t border-gray-200">
        <TouchableOpacity className="items-center">
          <Flame color="#f97316" fill="#f97316" size={24} />
          <Text className="text-orange-500 mt-1">Discover</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <Heart color="#9ca3af" size={24} />
          <Text className="text-gray-400 mt-1">Matches</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <User color="#9ca3af" size={24} />
          <Text className="text-gray-400 mt-1">Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
