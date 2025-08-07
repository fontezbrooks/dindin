import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart, Clock, Star, Flame } from 'lucide-react-native';

// Mock matched recipes data
const matchedRecipes = [
  {
    id: 1,
    title: "Creamy Mushroom Pasta",
    cookTime: "25 mins",
    difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1515516970627-3f00c6f75f5a?w=800&h=600&fit=crop",
    description: "Rich and creamy pasta with wild mushrooms and parmesan cheese",
    rating: 4.8,
    matchedAt: "2 hours ago"
  },
  {
    id: 2,
    title: "Spicy Tuna Poke Bowl",
    cookTime: "15 mins",
    difficulty: "Medium",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop",
    description: "Fresh ahi tuna with spicy mayo, avocado, and cucumber",
    rating: 4.9,
    matchedAt: "1 day ago"
  },
  {
    id: 3,
    title: "BBQ Chicken Pizza",
    cookTime: "30 mins",
    difficulty: "Medium",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop",
    description: "Homemade pizza with smoky BBQ chicken and melted cheese",
    rating: 4.7,
    matchedAt: "3 days ago"
  },
  {
    id: 4,
    title: "Vegetable Stir Fry",
    cookTime: "20 mins",
    difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
    description: "Colorful vegetables in a savory sauce served over rice",
    rating: 4.6,
    matchedAt: "1 week ago"
  }
];

export default function MatchesScreen() {
  const handleRecipePress = (recipeId: number) => {
    console.log('Recipe pressed:', recipeId);
    // Navigate to recipe details
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Flame color="white" size={24} />
              <Text style={styles.logoText}>DinDin</Text>
            </View>
            <Text style={styles.headerTitle}>My Matches</Text>
            <View style={styles.placeholder} />
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          {matchedRecipes.length > 0 ? (
            <View style={styles.recipesList}>
              {matchedRecipes.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.recipeCard}
                  onPress={() => handleRecipePress(recipe.id)}
                >
                  <Image
                    source={{ uri: recipe.image }}
                    style={styles.recipeImage}
                    resizeMode="cover"
                  />
                  <View style={styles.recipeInfo}>
                    <View style={styles.recipeHeader}>
                      <Text style={styles.recipeTitle}>{recipe.title}</Text>
                      <View style={styles.ratingContainer}>
                        <Star color="#f59e0b" fill="#f59e0b" size={16} />
                        <Text style={styles.ratingText}>{recipe.rating}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.recipeDescription}>{recipe.description}</Text>
                    
                    <View style={styles.recipeMeta}>
                      <View style={styles.metaItem}>
                        <Clock color="#6b7280" size={14} />
                        <Text style={styles.metaText}>{recipe.cookTime}</Text>
                      </View>
                      <Text style={styles.metaSeparator}>•</Text>
                      <Text style={styles.metaText}>{recipe.difficulty}</Text>
                    </View>
                    
                    <View style={styles.matchInfo}>
                      <Heart color="#f97316" size={14} />
                      <Text style={styles.matchText}>Matched {recipe.matchedAt}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Heart color="#9ca3af" size={48} />
              <Text style={styles.emptyTitle}>No Matches Yet</Text>
              <Text style={styles.emptySubtitle}>
                Start swiping to discover delicious recipes!
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fef3c7', // orange-50 equivalent
  },
  header: {
    backgroundColor: '#f97316', // orange-500
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  recipesList: {
    paddingVertical: 16,
  },
  recipeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  recipeImage: {
    width: '100%',
    height: 200,
  },
  recipeInfo: {
    padding: 16,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937', // gray-800
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#374151', // gray-700
    marginLeft: 4,
    fontSize: 14,
  },
  recipeDescription: {
    color: '#4b5563', // gray-600
    fontSize: 14,
    marginBottom: 12,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#6b7280', // gray-500
    fontSize: 14,
    marginLeft: 4,
  },
  metaSeparator: {
    color: '#9ca3af', // gray-400
    marginHorizontal: 8,
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchText: {
    color: '#f97316', // orange-500
    fontSize: 12,
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937', // gray-800
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#6b7280', // gray-500
    textAlign: 'center',
    fontSize: 16,
  },
});
