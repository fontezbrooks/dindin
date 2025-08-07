import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    dietary_restrictions: user?.dietary_restrictions || [],
    cuisine_preferences: user?.cuisine_preferences || []
  });

  const dietaryOptions = [
    'vegetarian',
    'vegan',
    'gluten-free',
    'dairy-free',
    'nut-free',
    'low-carb',
    'keto',
    'paleo'
  ];

  const cuisineOptions = [
    'Italian',
    'Chinese',
    'Mexican',
    'Indian',
    'Thai',
    'Japanese',
    'Mediterranean',
    'American',
    'French',
    'Korean'
  ];

  const handleSave = async () => {
    try {
      updateUserProfile({
        name: editForm.name,
        dietary_restrictions: editForm.dietary_restrictions,
        cuisine_preferences: editForm.cuisine_preferences
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: user?.name || '',
      dietary_restrictions: user?.dietary_restrictions || [],
      cuisine_preferences: user?.cuisine_preferences || []
    });
    setIsEditing(false);
  };

  const toggleDietaryRestriction = (restriction) => {
    setEditForm({
      ...editForm,
      dietary_restrictions: editForm.dietary_restrictions.includes(restriction)
        ? editForm.dietary_restrictions.filter(r => r !== restriction)
        : [...editForm.dietary_restrictions, restriction]
    });
  };

  const toggleCuisinePreference = (cuisine) => {
    setEditForm({
      ...editForm,
      cuisine_preferences: editForm.cuisine_preferences.includes(cuisine)
        ? editForm.cuisine_preferences.filter(c => c !== cuisine)
        : [...editForm.cuisine_preferences, cuisine]
    });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 hero-gradient">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#2C3E35] mb-4">Profile</h1>
          <p className="text-[#6B7B63] text-lg">Manage your account and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="card rounded-3xl medium-shadow p-8 mb-8">
          {/* Avatar and Basic Info */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <img
                src={user?.avatar || `https://via.placeholder.com/150/87A96B/FFFFFF?text=${user?.name?.[0] || 'U'}`}
                alt={user?.name}
                className="w-28 h-28 rounded-full border-4 border-[#87A96B] mx-auto mb-4 shadow-lg"
              />
              <div className="absolute bottom-2 right-2 w-10 h-10 bg-[#87A96B] rounded-full flex items-center justify-center border-3 border-white shadow-lg">
                <span className="text-white text-lg">📷</span>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-xl font-bold text-[#2C3E35] text-center bg-[#F0F4EC] border-2 border-[#87A96B] rounded-xl px-4 py-3 w-full max-w-xs mx-auto block"
                  placeholder="Your name"
                />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-[#2C3E35] mb-2">{user?.name}</h2>
                <p className="text-[#6B7B63] mb-2">{user?.email}</p>
                {user?.auth_method && (
                  <span className="text-sm bg-[#87A96B] bg-opacity-15 text-[#87A96B] px-3 py-1 rounded-full font-medium">
                    {user.auth_method === 'email' ? '📧 Email' : '🌐 Google'} Authentication
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mb-10">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="btn-primary px-8">
                  Save Changes
                </button>
                <button onClick={handleCancel} className="btn-secondary px-8">
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="btn-primary px-8">
                Edit Profile
              </button>
            )}
          </div>

          {/* Preferences Section */}
          <div className="space-y-8">
            {/* Dietary Restrictions */}
            <div>
              <h3 className="text-xl font-semibold text-[#2C3E35] mb-4">Dietary Restrictions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {dietaryOptions.map((restriction) => (
                  <label
                    key={restriction}
                    className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      (isEditing ? editForm.dietary_restrictions : user?.dietary_restrictions || []).includes(restriction)
                        ? 'bg-[#87A96B] border-[#87A96B] text-white shadow-md'
                        : 'bg-[#F0F4EC] border-[#C7D3BC] text-[#2C3E35] hover:border-[#87A96B]'
                    } ${!isEditing && 'pointer-events-none'}`}
                  >
                    <input
                      type="checkbox"
                      checked={(isEditing ? editForm.dietary_restrictions : user?.dietary_restrictions || []).includes(restriction)}
                      onChange={() => isEditing && toggleDietaryRestriction(restriction)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium capitalize">{restriction}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Cuisine Preferences */}
            <div>
              <h3 className="text-xl font-semibold text-[#2C3E35] mb-4">Favorite Cuisines</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {cuisineOptions.map((cuisine) => (
                  <label
                    key={cuisine}
                    className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      (isEditing ? editForm.cuisine_preferences : user?.cuisine_preferences || []).includes(cuisine)
                        ? 'bg-[#E07A5F] border-[#E07A5F] text-white shadow-md'
                        : 'bg-[#F0F4EC] border-[#C7D3BC] text-[#2C3E35] hover:border-[#E07A5F]'
                    } ${!isEditing && 'pointer-events-none'}`}
                  >
                    <input
                      type="checkbox"
                      checked={(isEditing ? editForm.cuisine_preferences : user?.cuisine_preferences || []).includes(cuisine)}
                      onChange={() => isEditing && toggleCuisinePreference(cuisine)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{cuisine}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="card rounded-3xl medium-shadow p-8 mb-8">
          <h3 className="text-xl font-semibold text-[#2C3E35] mb-6">Your Stats</h3>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-[#87A96B] bg-opacity-10 rounded-xl">
              <div className="text-3xl font-bold text-[#87A96B]">42</div>
              <div className="text-sm text-[#6B7B63] font-medium">Recipes Liked</div>
            </div>
            <div className="p-4 bg-[#E07A5F] bg-opacity-10 rounded-xl">
              <div className="text-3xl font-bold text-[#E07A5F]">8</div>
              <div className="text-sm text-[#6B7B63] font-medium">Matches</div>
            </div>
            <div className="p-4 bg-[#87A96B] bg-opacity-10 rounded-xl">
              <div className="text-3xl font-bold text-[#87A96B]">5</div>
              <div className="text-sm text-[#6B7B63] font-medium">Cooked Together</div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="card rounded-3xl medium-shadow p-8">
          <h3 className="text-xl font-semibold text-[#2C3E35] mb-6">Account</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-4 rounded-xl hover:bg-[#87A96B] hover:bg-opacity-10 text-[#2C3E35] transition-colors">
              <span className="mr-4">🔔</span>
              Notification Settings
            </button>
            <button className="w-full text-left p-4 rounded-xl hover:bg-[#87A96B] hover:bg-opacity-10 text-[#2C3E35] transition-colors">
              <span className="mr-4">🔒</span>
              Privacy Settings
            </button>
            <button className="w-full text-left p-4 rounded-xl hover:bg-[#87A96B] hover:bg-opacity-10 text-[#2C3E35] transition-colors">
              <span className="mr-4">❓</span>
              Help & Support
            </button>
            <hr className="my-4 border-[#C7D3BC]" />
            <button 
              onClick={handleLogout}
              className="w-full text-left p-4 rounded-xl hover:bg-[#E07A5F] hover:bg-opacity-10 text-[#E07A5F] transition-colors"
            >
              <span className="mr-4">🚪</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;