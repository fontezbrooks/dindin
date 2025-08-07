import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MatchCard from '../components/MatchCard';
import { matchesAPI } from '../services/api';

const Matches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load matches from API
    loadMatches();
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const matchesData = await matchesAPI.getMatches();
      setMatches(matchesData);
    } catch (error) {
      console.error('Error loading matches:', error);
      setError('Failed to load matches. Please try again.');
      
      // Fallback to mock data for development
      setMatches([
        {
          id: '1',
          recipe: {
            id: '1',
            title: 'Classic Chicken Parmesan',
            description: 'Crispy breaded chicken breast topped with marinara sauce and melted mozzarella cheese.',
            image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
            prep_time: 20,
            cook_time: 25,
            difficulty: 'medium',
            cuisine_type: 'Italian'
          },
          matched_with: {
            id: '2',
            name: 'Sarah Johnson',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b772b9f0?w=150&h=150&fit=crop&crop=face'
          },
          matched_at: '2024-03-10T18:30:00Z',
          status: 'new'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMatch = async (matchId) => {
    try {
      // In a real app, you'd call an API to confirm the match
      setMatches(matches.map(match => 
        match.id === matchId 
          ? { ...match, status: 'confirmed' }
          : match
      ));
    } catch (error) {
      console.error('Error confirming match:', error);
    }
  };

  const handleStartCooking = async (matchId) => {
    try {
      // In a real app, you'd call an API to update cooking status
      setMatches(matches.map(match => 
        match.id === matchId 
          ? { ...match, status: 'cooking' }
          : match
      ));
    } catch (error) {
      console.error('Error updating cooking status:', error);
    }
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    return match.status === filter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-[#87A96B] mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-[#2C3E35]">Loading your matches...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="text-center p-8 card rounded-3xl medium-shadow max-w-md mx-4">
          <div className="text-5xl mb-4">😞</div>
          <h2 className="text-xl font-bold text-[#2C3E35] mb-2">Unable to load matches</h2>
          <p className="text-[#6B7B63] mb-6">{error}</p>
          <button 
            onClick={loadMatches} 
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8 hero-gradient">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#2C3E35] mb-4">Your Matches</h1>
          <p className="text-[#6B7B63] text-lg">Recipes you and your partners both loved</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-10">
          <div className="card rounded-2xl p-2 flex space-x-1">
            {[
              { key: 'all', label: 'All Matches', count: matches.length },
              { key: 'new', label: 'New', count: matches.filter(m => m.status === 'new').length },
              { key: 'confirmed', label: 'Confirmed', count: matches.filter(m => m.status === 'confirmed').length },
              { key: 'cooking', label: 'Cooking', count: matches.filter(m => m.status === 'cooking').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === tab.key
                    ? 'bg-[#87A96B] text-white shadow-md'
                    : 'text-[#6B7B63] hover:text-[#87A96B] hover:bg-[#87A96B] hover:bg-opacity-10'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    filter === tab.key 
                      ? 'bg-white text-[#87A96B]'
                      : 'bg-[#C7D3BC] text-[#6B7B63]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Matches Grid */}
        {filteredMatches.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-7xl mb-6">🍽️</div>
            <h3 className="text-2xl font-semibold text-[#2C3E35] mb-4">
              {filter === 'all' ? 'No matches yet' : `No ${filter} matches`}
            </h3>
            <p className="text-[#6B7B63] mb-8 text-lg leading-relaxed max-w-md mx-auto">
              {filter === 'all' 
                ? 'Start swiping to find recipes you and your partner both love!'
                : `No matches with status "${filter}" found.`
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => window.location.href = '/discover'}
                className="btn-primary text-lg px-8 py-4"
              >
                Start Discovering Recipes
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                formatDate={formatDate}
                onConfirm={() => handleConfirmMatch(match.id)}
                onStartCooking={() => handleStartCooking(match.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;