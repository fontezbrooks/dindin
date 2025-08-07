import React, { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import SwipeButtons from '../components/SwipeButtons';
import { useAuth } from '../context/AuthContext';
import { recipesAPI } from '../services/api';

const Discover = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentRecipe = recipes[currentRecipeIndex];

  // Load recipes from API
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setIsLoading(true);
        const recipesData = await recipesAPI.getRecipes({ limit: 10 });
        setRecipes(recipesData);
        setError(null);
      } catch (error) {
        console.error('Error loading recipes:', error);
        setError('Failed to load recipes. Please try again.');
        
        // Fallback to mock data for development
        setRecipes([
          {
            id: '1',
            title: 'Classic Chicken Parmesan',
            description: 'Crispy breaded chicken breast topped with marinara sauce and melted mozzarella cheese.',
            image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
            prep_time: 20,
            cook_time: 25,
            difficulty: 'medium',
            cuisine_type: 'Italian',
            dietary_tags: [],
            ingredients: [
              { name: 'chicken breast', amount: '4', unit: 'pieces' },
              { name: 'breadcrumbs', amount: '1', unit: 'cup' },
              { name: 'marinara sauce', amount: '2', unit: 'cups' },
              { name: 'mozzarella cheese', amount: '1', unit: 'cup' }
            ],
            instructions: [
              { step: 1, description: 'Preheat oven to 400°F' },
              { step: 2, description: 'Bread the chicken breasts' },
              { step: 3, description: 'Bake for 20 minutes' },
              { step: 4, description: 'Top with sauce and cheese, bake 5 more minutes' }
            ]
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadRecipes();
    }
  }, [user]);

  const handleSwipe = async (direction) => {
    if (!currentRecipe || isLoading) return;

    setIsLoading(true);
    
    try {
      // Call API to record swipe
      const result = await recipesAPI.swipeRecipe(currentRecipe.id, direction);
      
      console.log(`Swiped ${direction} on recipe:`, currentRecipe.title);
      if (result.matches && result.matches.length > 0) {
        console.log('New matches found!', result.matches);
        // You could show a match notification here
      }
      
      // Move to next recipe
      if (currentRecipeIndex < recipes.length - 1) {
        setCurrentRecipeIndex(currentRecipeIndex + 1);
      } else {
        // Load more recipes or show end message
        setCurrentRecipeIndex(0); // For demo, restart the stack
      }
      
    } catch (error) {
      console.error('Error recording swipe:', error);
      // Still move to next recipe even if API call fails
      if (currentRecipeIndex < recipes.length - 1) {
        setCurrentRecipeIndex(currentRecipeIndex + 1);
      } else {
        setCurrentRecipeIndex(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = () => handleSwipe('right');
  const handleDislike = () => handleSwipe('left');

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="text-center p-8 card rounded-3xl medium-shadow max-w-md mx-4">
          <div className="text-5xl mb-4">😞</div>
          <h2 className="text-xl font-bold text-[#2C3E35] mb-2">Oops! Something went wrong</h2>
          <p className="text-[#6B7B63] mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && recipes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-[#87A96B] mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-[#2C3E35]">Loading delicious recipes...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8 hero-gradient">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2C3E35] mb-3">Discover Recipes</h1>
          <p className="text-[#6B7B63] text-lg">Swipe right for recipes you love 💚</p>
          <p className="text-sm text-[#87A96B] mt-3 font-medium">
            Recipe {currentRecipeIndex + 1} of {recipes.length} | Current: {currentRecipe?.title || 'None'}
          </p>
        </div>

        {/* Recipe Card Stack */}
        {currentRecipe ? (
          <div className="relative">
            {/* Background cards for stack effect */}
            {recipes.slice(currentRecipeIndex + 1, currentRecipeIndex + 3).map((recipe, index) => (
              <div
                key={recipe.id}
                className="absolute top-0 left-0 w-full recipe-card"
                style={{
                  transform: `scale(${0.96 - index * 0.02}) translateY(${(index + 1) * 6}px)`,
                  zIndex: -index - 1,
                  opacity: 0.6 - index * 0.2
                }}
              >
                <RecipeCard recipe={recipe} isInteractive={false} />
              </div>
            ))}

            {/* Current active card */}
            <RecipeCard
              recipe={currentRecipe}
              isInteractive={true}
              onSwipeLeft={handleDislike}
              onSwipeRight={handleLike}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-7xl mb-6">🍽️</div>
            <h2 className="text-2xl font-bold text-[#2C3E35] mb-4">No more recipes!</h2>
            <p className="text-[#6B7B63] leading-relaxed">Check back later for more delicious options.</p>
          </div>
        )}

        {/* Swipe Buttons */}
        {currentRecipe && (
          <div className="mt-10">
            <SwipeButtons
              onDislike={handleDislike}
              onLike={handleLike}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Progress indicator */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-3 mb-3">
            {[...Array(Math.min(5, recipes.length))].map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index <= (currentRecipeIndex % 5) ? 'progress-active' : 'progress-inactive'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-[#6B7B63]">
            Recipe {currentRecipeIndex + 1} of {recipes.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Discover;