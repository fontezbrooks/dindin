import React from 'react';

const SwipeButtons = ({ onDislike, onLike, disabled = false }) => {
  return (
    <div className="flex justify-center items-center space-x-12">
      {/* Dislike Button */}
      <button
        onClick={onDislike}
        disabled={disabled}
        className={`w-16 h-16 rounded-full border-3 flex items-center justify-center text-2xl transition-all duration-300 ${
          disabled
            ? 'border-[#C7D3BC] text-[#C7D3BC] cursor-not-allowed'
            : 'border-[#E07A5F] text-[#E07A5F] hover:bg-[#E07A5F] hover:text-white hover:scale-110 hover:shadow-lg active:scale-95 bg-[#FFF5F3]'
        }`}
        aria-label="Dislike recipe"
      >
        {disabled ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C7D3BC]"></div>
        ) : (
          '✕'
        )}
      </button>

      {/* Info Button */}
      <button
        className="w-12 h-12 rounded-full border-2 border-[#87A96B] text-[#87A96B] flex items-center justify-center text-lg hover:bg-[#87A96B] hover:text-white transition-all duration-300 bg-[#F0F4EC]"
        aria-label="Recipe details"
        title="View recipe details"
      >
        ℹ️
      </button>

      {/* Like Button */}
      <button
        onClick={onLike}
        disabled={disabled}
        className={`w-16 h-16 rounded-full border-3 flex items-center justify-center text-2xl transition-all duration-300 ${
          disabled
            ? 'border-[#C7D3BC] text-[#C7D3BC] cursor-not-allowed'
            : 'border-[#87A96B] text-[#87A96B] hover:bg-[#87A96B] hover:text-white hover:scale-110 hover:shadow-lg active:scale-95 bg-[#F0F4EC]'
        }`}
        aria-label="Like recipe"
      >
        {disabled ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C7D3BC]"></div>
        ) : (
          '💚'
        )}
      </button>
    </div>
  );
};

export default SwipeButtons;