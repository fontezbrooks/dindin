import React, { useState } from 'react';
import { View, Text, Image, Dimensions, ScrollView, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  SharedValue,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface RecipeCardProps {
  recipe: {
    _id: string;
    title: string;
    description?: string;
    image_url: string;
    cook_time: number;
    prep_time?: number;
    difficulty: string;
    cuisine: string[];
    cuisine_type?: string;
    dietary_tags?: string[];
    servings: number;
    ingredients: Array<{ name: string; amount: string; unit?: string }>;
    instructions?: Array<{ step: number; description: string }>;
    nutrition?: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
      sugar?: number;
    };
    tags?: string[];
  };
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  isTop: boolean;
}

export function RecipeCard({ recipe, translateX, translateY, isTop }: RecipeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandAnimation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-screenWidth / 2, 0, screenWidth / 2],
      [-15, 0, 15]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateX.value,
        [0, screenWidth / 4],
        [0, 1]
      ),
    };
  });

  const nopeOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateX.value,
        [-screenWidth / 4, 0],
        [1, 0]
      ),
    };
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const toggleExpanded = () => {
    expandAnimation.value = withSpring(isExpanded ? 0 : 1);
    setIsExpanded(!isExpanded);
  };

  // Collapsed Card View
  const CollapsedView = () => (
    <>
      {/* Image Section - 45% height */}
      <View className="h-[45%] relative">
        <Image
          source={{ uri: recipe.image_url }}
          className="w-full h-full rounded-t-3xl"
          resizeMode="cover"
        />
        
        {/* Like/Nope Indicators */}
        {isTop && !isExpanded && (
          <>
            <Animated.View
              style={[likeOpacityStyle]}
              className="absolute top-8 left-8 px-6 py-3 bg-green-500 rounded-full"
            >
              <Text className="text-white text-2xl font-bold">LIKE</Text>
            </Animated.View>
            
            <Animated.View
              style={[nopeOpacityStyle]}
              className="absolute top-8 right-8 px-6 py-3 bg-red-500 rounded-full"
            >
              <Text className="text-white text-2xl font-bold">NOPE</Text>
            </Animated.View>
          </>
        )}

        {/* Info Button */}
        <Pressable
          onPress={toggleExpanded}
          className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name="information-circle-outline" size={24} color="#374151" />
        </Pressable>
      </View>

      {/* Content Section - 55% height */}
      <View className="flex-1 p-5">
        {/* Title */}
        <Text className="text-xl font-bold text-gray-900 mb-2" numberOfLines={2}>
          {recipe.title}
        </Text>

        {/* Cook Time and Difficulty Row */}
        <View className="flex-row gap-2 mb-3">
          <View className="px-3 py-1.5 bg-gray-100 rounded-full">
            <Text className="text-gray-700 font-medium text-sm">
              ⏱ {recipe.cook_time + (recipe.prep_time || 0)} min
            </Text>
          </View>
          
          <View className={`px-3 py-1.5 rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
            <Text className="font-medium capitalize text-sm">
              {recipe.difficulty}
            </Text>
          </View>
        </View>

        {/* Description */}
        {recipe.description && (
          <Text className="text-gray-600 text-sm mb-3" numberOfLines={3}>
            {recipe.description}
          </Text>
        )}

        {/* Nutrition Info - Only Calories, Protein, Fat */}
        {recipe.nutrition && (
          <View className="bg-gray-50 rounded-xl p-3">
            <Text className="text-gray-700 font-semibold text-sm mb-2">Nutrition per serving</Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-lg font-bold text-gray-900">
                  {recipe.nutrition.calories || '--'}
                </Text>
                <Text className="text-xs text-gray-600">Calories</Text>
              </View>
              <View className="w-px bg-gray-300" />
              <View className="items-center">
                <Text className="text-lg font-bold text-gray-900">
                  {recipe.nutrition.protein || '--'}g
                </Text>
                <Text className="text-xs text-gray-600">Protein</Text>
              </View>
              <View className="w-px bg-gray-300" />
              <View className="items-center">
                <Text className="text-lg font-bold text-gray-900">
                  {recipe.nutrition.fat || '--'}g
                </Text>
                <Text className="text-xs text-gray-600">Fat</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </>
  );

  // Expanded Details View
  const ExpandedView = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Header with Image */}
      <View className="h-[250px] relative">
        <Image
          source={{ uri: recipe.image_url }}
          className="w-full h-full"
          resizeMode="cover"
        />
        
        {/* Back Button */}
        <Pressable
          onPress={toggleExpanded}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </Pressable>
      </View>

      {/* Content */}
      <View className="p-5">
        {/* Title */}
        <Text className="text-2xl font-bold text-gray-900 mb-3">
          {recipe.title}
        </Text>

        {/* Basic Info */}
        <View className="flex-row flex-wrap gap-2 mb-4">
          <View className="px-3 py-1.5 bg-gray-100 rounded-full">
            <Text className="text-gray-700 font-medium text-sm">
              ⏱ Total: {recipe.cook_time + (recipe.prep_time || 0)} min
            </Text>
          </View>
          
          {recipe.prep_time && recipe.prep_time > 0 && (
            <View className="px-3 py-1.5 bg-gray-100 rounded-full">
              <Text className="text-gray-700 font-medium text-sm">
                Prep: {recipe.prep_time} min
              </Text>
            </View>
          )}
          
          <View className={`px-3 py-1.5 rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
            <Text className="font-medium capitalize text-sm">
              {recipe.difficulty}
            </Text>
          </View>
          
          <View className="px-3 py-1.5 bg-gray-100 rounded-full">
            <Text className="text-gray-700 font-medium text-sm">
              👥 {recipe.servings} servings
            </Text>
          </View>
        </View>

        {/* Cuisine and Type */}
        {(recipe.cuisine.length > 0 || recipe.cuisine_type) && (
          <View className="flex-row flex-wrap gap-2 mb-4">
            {recipe.cuisine.map((c, i) => (
              <View key={i} className="px-3 py-1.5 bg-blue-100 rounded-full">
                <Text className="text-blue-700 font-medium text-sm">{c}</Text>
              </View>
            ))}
            {recipe.cuisine_type && (
              <View className="px-3 py-1.5 bg-purple-100 rounded-full">
                <Text className="text-purple-700 font-medium text-sm">{recipe.cuisine_type}</Text>
              </View>
            )}
          </View>
        )}

        {/* Dietary Tags */}
        {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-4">
            {recipe.dietary_tags.map((tag, index) => (
              <View key={index} className="px-3 py-1.5 bg-green-100 rounded-full">
                <Text className="text-green-700 text-sm font-medium capitalize">
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Description */}
        {recipe.description && (
          <View className="mb-4">
            <Text className="text-gray-600 text-sm leading-5">
              {recipe.description}
            </Text>
          </View>
        )}

        {/* Full Nutrition Info */}
        {recipe.nutrition && (
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <Text className="text-gray-700 font-semibold text-base mb-3">Nutrition per serving</Text>
            <View className="flex-row flex-wrap">
              <View className="w-1/3 mb-3">
                <Text className="text-lg font-bold text-gray-900">
                  {recipe.nutrition.calories || '--'}
                </Text>
                <Text className="text-xs text-gray-600">Calories</Text>
              </View>
              <View className="w-1/3 mb-3">
                <Text className="text-lg font-bold text-gray-900">
                  {recipe.nutrition.protein || '--'}g
                </Text>
                <Text className="text-xs text-gray-600">Protein</Text>
              </View>
              <View className="w-1/3 mb-3">
                <Text className="text-lg font-bold text-gray-900">
                  {recipe.nutrition.fat || '--'}g
                </Text>
                <Text className="text-xs text-gray-600">Fat</Text>
              </View>
              <View className="w-1/3">
                <Text className="text-lg font-bold text-gray-900">
                  {recipe.nutrition.carbs || '--'}g
                </Text>
                <Text className="text-xs text-gray-600">Carbs</Text>
              </View>
              <View className="w-1/3">
                <Text className="text-lg font-bold text-gray-900">
                  {recipe.nutrition.fiber || '--'}g
                </Text>
                <Text className="text-xs text-gray-600">Fiber</Text>
              </View>
              <View className="w-1/3">
                <Text className="text-lg font-bold text-gray-900">
                  {recipe.nutrition.sugar || '--'}g
                </Text>
                <Text className="text-xs text-gray-600">Sugar</Text>
              </View>
            </View>
          </View>
        )}

        {/* Ingredients */}
        <View className="mb-4">
          <Text className="text-gray-900 font-semibold text-lg mb-3">
            Ingredients ({recipe.ingredients.length})
          </Text>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} className="flex-row items-start mb-2">
              <Text className="text-gray-400 mr-2">•</Text>
              <Text className="text-gray-700 flex-1">
                <Text className="font-medium">{ingredient.amount}</Text>
                {ingredient.unit && ` ${ingredient.unit}`} {ingredient.name}
              </Text>
            </View>
          ))}
        </View>

        {/* Instructions */}
        {recipe.instructions && recipe.instructions.length > 0 && (
          <View className="mb-4">
            <Text className="text-gray-900 font-semibold text-lg mb-3">
              Instructions
            </Text>
            {recipe.instructions.map((instruction, index) => (
              <View key={index} className="flex-row items-start mb-3">
                <View className="w-7 h-7 bg-pink-500 rounded-full items-center justify-center mr-3">
                  <Text className="text-white font-bold text-sm">{instruction.step}</Text>
                </View>
                <Text className="text-gray-700 flex-1 leading-5">
                  {instruction.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <View className="mb-4">
            <Text className="text-gray-900 font-semibold text-base mb-2">Tags</Text>
            <View className="flex-row flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <View key={index} className="px-2 py-1 bg-gray-100 rounded-md">
                  <Text className="text-gray-600 text-xs">{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <Animated.View
      style={[animatedStyle]}
      className="absolute w-[90vw] h-[70vh] bg-white rounded-3xl shadow-2xl"
    >
      {isExpanded ? <ExpandedView /> : <CollapsedView />}
    </Animated.View>
  );
}