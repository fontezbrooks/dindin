import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { Heart, X, User, Search, Flame, Star } from 'lucide-react-native';
import { Link } from 'expo-router';

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
    <View style={styles.container}>
        <View style={styles.mainContainer}>

        {/* Header */}
        <View style={styles.header}>
            <View style={styles.headerContent}>
            <TouchableOpacity style={styles.headerButton}>
                <User color="white" size={24} />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
                <Flame color="white" size={24} />
                <Text style={styles.logoText}>DinDin</Text>
            </View>

            <TouchableOpacity style={styles.headerButton}>
                <Search color="white" size={24} />
            </TouchableOpacity>
            </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
            {currentIndex < recipes.length ? (
            <View style={styles.recipeContainer}>
                {/* Recipe Card */}
                <View
                style={[
                    styles.recipeCard,
                    swipeDirection === 'left' && styles.swipeLeft,
                    swipeDirection === 'right' && styles.swipeRight
                ]}
                >
                <Image
                    source={{ uri: currentRecipe.image }}
                    style={styles.recipeImage}
                    resizeMode="cover"
                />

                <View style={styles.recipeInfo}>
                    <View style={styles.recipeHeader}>
                    <Text style={styles.recipeTitle}>{currentRecipe.title}</Text>
                    <View style={styles.ratingContainer}>
                        <Star color="#f59e0b" fill="#f59e0b" size={16} />
                        <Text style={styles.ratingText}>{currentRecipe.rating}</Text>
                    </View>
                    </View>

                    <Text style={styles.recipeDescription}>{currentRecipe.description}</Text>

                    <View style={styles.recipeMeta}>
                    <Text style={styles.cookTime}>{currentRecipe.cookTime}</Text>
                    <Text style={styles.metaSeparator}>•</Text>
                    <Text style={styles.difficulty}>{currentRecipe.difficulty}</Text>
                    <Text style={styles.metaSeparator}>•</Text>
                    <Text style={styles.matches}>{currentRecipe.matches} matches</Text>
                    </View>
                </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSwipe('left')}
                >
                    <X color="#ef4444" size={32} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSwipe('right')}
                >
                    <Heart color="#10b981" fill="#10b981" size={32} />
                </TouchableOpacity>
                </View>
            </View>
            ) : (
            // Match Summary Screen
            <View style={styles.summaryContainer}>
                <View style={styles.summaryCard}>
                <Flame color="#f97316" size={48} />
                <Text style={styles.summaryTitle}>Your Matches</Text>
                <Text style={styles.summarySubtitle}>
                    You&apos;ve matched with {matches.length} delicious recipes!
                </Text>

                <View style={styles.matchesList}>
                    {matches.map((id) => {
                    const recipe = recipes.find(r => r.id === id);
                    return recipe ? (
                        <View key={id} style={styles.matchItem}>
                        <Image
                            source={{ uri: recipe.image }}
                            style={styles.matchImage}
                        />
                        <Text style={styles.matchTitle}>{recipe.title}</Text>
                        </View>
                    ) : null;
                    })}
                </View>

                <TouchableOpacity
                    style={styles.resetButton}
                    onPress={resetSwipes}
                >
                    <Text style={styles.resetButtonText}>Swipe Again</Text>
                </TouchableOpacity>
                </View>
            </View>
            )}
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem}>
            <Flame color="#f97316" fill="#f97316" size={24} />
            <Text style={styles.navTextActive}>Discover</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem}>
            <Heart color="#9ca3af" size={24} />
            <Text style={styles.navText}>Matches</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem}>
            <Link href="/profile" style={styles.profileLink}>
                <Text style={styles.button}>Profile</Text>
            </Link>
            </TouchableOpacity>
        </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fef3c7', // orange-50 equivalent
  },
  profileLink: {
    position: 'absolute',
    top: 16,
    right: 16,
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
  headerButton: {
    padding: 8,
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
  mainContent: {
    flex: 1,
  },
  recipeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  recipeCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    height: width * 1.2,
  },
  swipeLeft: {
    transform: [
      { rotate: '-30deg' },
      { translateX: -200 }
    ],
  },
  swipeRight: {
    transform: [
      { rotate: '30deg' },
      { translateX: 200 }
    ],
  },
  recipeImage: {
    width: '100%',
    height: '66.67%',
  },
  recipeInfo: {
    padding: 16,
    height: '33.33%',
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937', // gray-800
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#374151', // gray-700
    marginLeft: 4,
  },
  recipeDescription: {
    color: '#4b5563', // gray-600
    marginTop: 4,
  },
  recipeMeta: {
    flexDirection: 'row',
    marginTop: 8,
  },
  cookTime: {
    color: '#f97316', // orange-500
    fontWeight: '500',
  },
  metaSeparator: {
    color: '#9ca3af', // gray-400
    marginHorizontal: 8,
  },
  difficulty: {
    color: '#4b5563', // gray-600
  },
  matches: {
    color: '#4b5563', // gray-600
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    gap: 32,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '100%',
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937', // gray-800
    marginTop: 16,
  },
  summarySubtitle: {
    color: '#4b5563', // gray-600
    marginTop: 8,
    textAlign: 'center',
  },
  matchesList: {
    marginTop: 24,
    width: '100%',
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // gray-100
  },
  matchImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  matchTitle: {
    marginLeft: 12,
    fontWeight: '500',
    color: '#1f2937', // gray-800
  },
  resetButton: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f97316', // orange-500
    borderRadius: 24,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb', // gray-200
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: '#9ca3af', // gray-400
    marginTop: 4,
  },
  navTextActive: {
    color: '#f97316', // orange-500
    marginTop: 4,
  },
  text: {
    color: '#fff',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#f97316',
  }
});
