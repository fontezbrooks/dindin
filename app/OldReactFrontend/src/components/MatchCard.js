import React, { useState } from 'react';

const MatchCard = ({ match, formatDate, onConfirm, onStartCooking }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusStyles = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-[#87A96B] bg-opacity-15 text-[#87A96B] border-[#87A96B]';
      case 'cooking': return 'bg-[#E07A5F] bg-opacity-15 text-[#E07A5F] border-[#E07A5F]';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return '🆕';
      case 'confirmed': return '✅';
      case 'cooking': return '👨‍🍳';
      default: return '📝';
    }
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
      case 'easy': return 'bg-[#E8F5E8] text-[#2D5A2D] border-[#87A96B]';
      case 'medium': return 'bg-[#FFF5E6] text-[#8B4513] border-[#E07A5F]'; 
      case 'hard': return 'bg-[#FDF2F2] text-[#8B0000] border-[#D73527]';
      default: return 'bg-[#F0F4EC] text-[#6B7B63] border-[#C7D3BC]';
    }
  };

  return (
    <div className="card rounded-3xl medium-shadow hover:strong-shadow transition-all duration-300 overflow-hidden">
      {/* Recipe Image with Match Badge */}
      <div className="relative h-48">
        <img
          src={match.recipe.image_url}
          alt={match.recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-2 rounded-full text-sm font-semibold border-2 ${getStatusStyles(match.status)} shadow-sm`}>
            {getStatusIcon(match.status)} {match.status}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 flex items-center space-x-2">
          <img
            src={match.matched_with.avatar}
            alt={match.matched_with.name}
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
          />
          <span className="text-white text-sm font-medium bg-[#2C3E35] bg-opacity-80 px-3 py-1 rounded-full">
            Matched with {match.matched_with.name}
          </span>
        </div>
      </div>

      {/* Recipe Info */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-[#2C3E35] flex-1 leading-tight">{match.recipe.title}</h3>
          <span className="text-sm text-[#6B7B63] ml-3 flex-shrink-0">{formatDate(match.matched_at)}</span>
        </div>

        <p className="text-[#6B7B63] text-sm mb-4 leading-relaxed">
          {match.recipe.description}
        </p>

        {/* Recipe Details */}
        <div className="flex items-center justify-between text-sm text-[#6B7B63] mb-6">
          <div className="flex items-center space-x-4">
            {match.recipe.prep_time && (
              <span className="flex items-center bg-[#87A96B] bg-opacity-10 px-2 py-1 rounded-lg">
                🕐 {formatTime(match.recipe.prep_time)}
              </span>
            )}
            {match.recipe.cook_time && (
              <span className="flex items-center bg-[#87A96B] bg-opacity-10 px-2 py-1 rounded-lg">
                🔥 {formatTime(match.recipe.cook_time)}
              </span>
            )}
            <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getDifficultyStyles(match.recipe.difficulty)}`}>
              {match.recipe.difficulty}
            </span>
          </div>
          {match.recipe.cuisine_type && (
            <span className="text-[#87A96B] font-semibold bg-[#87A96B] bg-opacity-10 px-2 py-1 rounded-lg text-xs">
              {match.recipe.cuisine_type}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {match.status === 'new' && (
            <div className="flex space-x-3">
              <button
                onClick={onConfirm}
                className="btn-primary flex-1 py-3 text-sm font-semibold"
              >
                Confirm Match
              </button>
              <button className="btn-secondary px-4 py-3 text-sm">
                💬
              </button>
            </div>
          )}
          
          {match.status === 'confirmed' && (
            <div className="flex space-x-3">
              <button
                onClick={onStartCooking}
                className="btn-primary flex-1 py-3 text-sm font-semibold"
              >
                Start Cooking Together
              </button>
              <button className="btn-secondary px-4 py-3 text-sm">
                📋
              </button>
            </div>
          )}
          
          {match.status === 'cooking' && (
            <div className="flex space-x-3">
              <button className="btn-secondary flex-1 py-3 text-sm font-semibold">
                View Recipe
              </button>
              <button className="btn-tertiary px-4 py-3 text-sm font-semibold">
                📷 Share
              </button>
            </div>
          )}
        </div>

        {/* Expandable Recipe Details */}
        <div className="mt-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-left flex items-center justify-between py-3 text-sm text-[#6B7B63] hover:text-[#87A96B] border-t border-[#C7D3BC] mt-4 pt-4 transition-colors"
          >
            <span className="font-medium">Recipe Details</span>
            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''} text-[#87A96B]`}>
              ⌄
            </span>
          </button>

          {isExpanded && (
            <div className="mt-4 space-y-6 text-sm">
              {/* Ingredients */}
              <div>
                <h4 className="font-semibold text-[#2C3E35] mb-3">Ingredients</h4>
                <div className="space-y-2">
                  {match.recipe.ingredients?.map((ingredient, index) => (
                    <div key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-[#87A96B] rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span className="text-[#6B7B63] leading-relaxed">
                        {ingredient.amount && ingredient.unit 
                          ? `${ingredient.amount} ${ingredient.unit} `
                          : ingredient.amount 
                            ? `${ingredient.amount} `
                            : ''
                        }{ingredient.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="font-semibold text-[#2C3E35] mb-3">Instructions</h4>
                <div className="space-y-3">
                  {match.recipe.instructions?.map((instruction, index) => (
                    <div key={index} className="flex items-start">
                      <span className="bg-[#87A96B] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 font-semibold">
                        {instruction.step}
                      </span>
                      <span className="text-[#6B7B63] leading-relaxed">{instruction.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;