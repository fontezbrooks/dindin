import React, { useState, useRef, useEffect } from 'react';

const RecipeCard = ({ recipe, isInteractive = true, onSwipeLeft, onSwipeRight, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const cardRef = useRef(null);

  const handleMouseDown = (e) => {
    if (!isInteractive || isLoading) return;
    
    setIsDragging(true);
    const rect = cardRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left - rect.width / 2;
    const startY = e.clientY - rect.top - rect.height / 2;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    setDragOffset({ x, y });
    setRotation(x * 0.1); // Slight rotation based on horizontal movement
    
    // Determine swipe direction
    if (Math.abs(x) > 50) {
      setSwipeDirection(x > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Check if swipe threshold was met
    if (Math.abs(dragOffset.x) > 100) {
      if (dragOffset.x > 0) {
        onSwipeRight && onSwipeRight();
      } else {
        onSwipeLeft && onSwipeLeft();
      }
    }
    
    // Reset position
    setDragOffset({ x: 0, y: 0 });
    setRotation(0);
    setSwipeDirection(null);
  };

  const formatTime = (minutes) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
  };

  const getDifficultyStyles = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'badge-easy';
      case 'medium': return 'badge-medium'; 
      case 'hard': return 'badge-hard';
      default: return 'bg-[#F0F4EC] text-[#6B7B63] border-[#C7D3BC]';
    }
  };

  return (
    <div
      ref={cardRef}
      className={`w-full max-w-sm mx-auto recipe-card ${isDragging ? 'dragging' : ''} ${
        swipeDirection === 'right' ? 'swipe-like' : swipeDirection === 'left' ? 'swipe-dislike' : ''
      }`}
      style={{
        transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
        '--rotation': `${rotation}deg`,
        cursor: isInteractive ? 'grab' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Recipe Image */}
      <div className="relative h-64 overflow-hidden rounded-t-2xl">
        <img
          src={recipe.image_url}
          alt={recipe.title}
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* Difficulty Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-2 rounded-full text-sm font-semibold ${getDifficultyStyles(recipe.difficulty)} shadow-sm`}>
            {recipe.difficulty}
          </span>
        </div>
        
        {/* Time Info */}
        <div className="absolute bottom-4 left-4 flex space-x-2">
          {recipe.prep_time && (
            <span className="bg-[#2C3E35] bg-opacity-80 text-white px-3 py-1 rounded-full text-sm font-medium">
              🕐 Prep: {formatTime(recipe.prep_time)}
            </span>
          )}
          {recipe.cook_time && (
            <span className="bg-[#2C3E35] bg-opacity-80 text-white px-3 py-1 rounded-full text-sm font-medium">
              🔥 Cook: {formatTime(recipe.cook_time)}
            </span>
          )}
        </div>
      </div>

      {/* Recipe Info */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-[#2C3E35] mb-2 leading-tight">{recipe.title}</h3>
          {recipe.cuisine_type && (
            <span className="text-sm text-[#87A96B] font-semibold bg-[#87A96B] bg-opacity-10 px-2 py-1 rounded-full">
              {recipe.cuisine_type} Cuisine
            </span>
          )}
        </div>

        <p className="text-[#6B7B63] text-sm mb-4 line-clamp-3 leading-relaxed">
          {recipe.description}
        </p>

        {/* Dietary Tags */}
        {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.dietary_tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-[#E07A5F] bg-opacity-15 text-[#8B4513] rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Ingredients Preview */}
        <div className="mb-4">
          <h4 className="font-semibold text-[#2C3E35] mb-3">Key Ingredients</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-[#6B7B63]">
            {recipe.ingredients.slice(0, 4).map((ingredient, index) => (
              <div key={index} className="flex items-center">
                <span className="w-2 h-2 bg-[#87A96B] rounded-full mr-3 flex-shrink-0"></span>
                <span className="truncate">{ingredient.name}</span>
              </div>
            ))}
            {recipe.ingredients.length > 4 && (
              <div className="text-[#E07A5F] font-semibold text-sm">
                +{recipe.ingredients.length - 4} more
              </div>
            )}
          </div>
        </div>

        {/* Swipe Hints */}
        {isInteractive && (
          <div className="flex justify-between items-center text-sm text-[#6B7B63] pt-2 border-t border-[#C7D3BC]">
            <span className="flex items-center">
              <span className="text-[#E07A5F] mr-2">👈</span>
              Not for me
            </span>
            <span className="flex items-center">
              Love it!
              <span className="text-[#87A96B] ml-2">👉</span>
            </span>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#F0F4EC] bg-opacity-90 flex items-center justify-center rounded-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-3 border-[#87A96B]"></div>
        </div>
      )}

      {/* Swipe Direction Indicator */}
      {swipeDirection && (
        <div className={`absolute inset-0 flex items-center justify-center text-6xl font-bold ${
          swipeDirection === 'right' ? 'text-[#87A96B]' : 'text-[#E07A5F]'
        }`}>
          {swipeDirection === 'right' ? '💚' : '✕'}
        </div>
      )}
    </div>
  );
};

export default RecipeCard;