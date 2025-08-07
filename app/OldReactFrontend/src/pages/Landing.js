import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Landing = () => {
  const { user, loginWithGoogle, signupWithEmail, loginWithEmail, loading } = useAuth();
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(false); // true for login, false for signup
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Redirect if already logged in
  if (user && !loading) {
    return <Navigate to="/discover" replace />;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-[#87A96B]"></div>
      </div>
    );
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (isLogin) {
        await loginWithEmail(formData.email, formData.password);
      } else {
        if (!formData.name.trim()) {
          throw new Error('Name is required');
        }
        await signupWithEmail(formData.email, formData.password, formData.name);
      }
    } catch (error) {
      console.error('Auth error:', error);
      
      if (error.response?.data?.detail) {
        setFormError(error.response.data.detail);
      } else if (error.message) {
        setFormError(error.message);
      } else {
        setFormError(isLogin ? 'Login failed. Please try again.' : 'Signup failed. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', name: '' });
    setFormError('');
    setShowEmailAuth(false);
    setIsLogin(false);
  };

  if (showEmailAuth) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
        <div className="card-gradient rounded-3xl soft-shadow p-8 w-full max-w-md border-2 border-[#87A96B] border-opacity-20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#87A96B] mb-3">DinDin</h1>
            <h2 className="text-xl font-semibold text-[#2C3E35] mb-2">
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </h2>
            <p className="text-[#6B7B63]">
              {isLogin 
                ? 'Sign in to continue discovering recipes'
                : 'Join thousands of couples making mealtime magical'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#2C3E35] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#C7D3BC] focus:border-[#87A96B] focus:ring-0 transition-all"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2C3E35] mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#C7D3BC] focus:border-[#87A96B] focus:ring-0 transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#2C3E35] mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#C7D3BC] focus:border-[#87A96B] focus:ring-0 transition-all"
                placeholder={isLogin ? "Enter your password" : "Create a password (min. 6 characters)"}
                minLength={6}
                required
              />
            </div>

            {formError && (
              <div className="bg-[#FDF2F2] border-2 border-[#E07A5F] text-[#8B0000] px-4 py-3 rounded-xl text-sm">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={formLoading}
              className="btn-primary w-full py-4 text-lg font-semibold"
            >
              {formLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Toggle login/signup */}
          <div className="mt-6 text-center">
            <p className="text-[#6B7B63]">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormError('');
                }}
                className="text-[#87A96B] font-semibold hover:text-[#759458] transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Alternative auth option */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#C7D3BC]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-[#F0F4EC] text-[#6B7B63]">Or</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="btn-secondary w-full mt-4 flex items-center justify-center space-x-3 py-4 font-semibold"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Back button */}
          <div className="mt-6 text-center">
            <button
              onClick={resetForm}
              className="text-[#6B7B63] hover:text-[#87A96B] text-sm transition-colors"
            >
              ← Back to main page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      {/* Header */}
      <header className="text-center py-12 md:py-16">
        <h1 className="text-7xl md:text-9xl font-bold text-[#87A96B] mb-6 drop-shadow-sm">
          DinDin
        </h1>
        <p className="text-xl md:text-2xl text-[#2C3E35] max-w-3xl mx-auto px-4 leading-relaxed">
          Discover dinner together. Swipe, match, and cook amazing meals with your loved ones.
        </p>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-16 items-center">
          {/* Left side - Features */}
          <div className="space-y-10">
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-bold text-[#2C3E35] mb-8 leading-tight">
                Never wonder <span className="text-[#E07A5F]">"what's for dinner?"</span> again
              </h2>
              <p className="text-lg text-[#6B7B63] mb-8 leading-relaxed">
                DinDin makes meal planning fun and easy. Swipe through delicious recipes, 
                match with your partner's preferences, and discover your next favorite dish together.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#87A96B] rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C3E35] text-lg">Swipe & Discover</h3>
                  <p className="text-[#6B7B63] leading-relaxed">Browse through curated recipes with a fun, Tinder-like interface</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#87A96B] rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C3E35] text-lg">Match with Partners</h3>
                  <p className="text-[#6B7B63] leading-relaxed">Find recipes you both love and plan meals together</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#87A96B] rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C3E35] text-lg">Cook & Enjoy</h3>
                  <p className="text-[#6B7B63] leading-relaxed">Get detailed instructions and create amazing meals</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Call to Action */}
          <div className="card-gradient rounded-3xl medium-shadow p-10 text-center border-2 border-[#87A96B] border-opacity-20">
            <div className="mb-10">
              <div className="text-8xl mb-6">🌿🍽️</div>
              <h3 className="text-3xl font-bold text-[#2C3E35] mb-4">Ready to get started?</h3>
              <p className="text-[#6B7B63] text-lg leading-relaxed">
                Join thousands of couples making mealtime magical
              </p>
            </div>

            {/* Auth Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowEmailAuth(true);
                  setIsLogin(false);
                }}
                className="btn-primary w-full py-5 text-lg font-semibold"
              >
                Sign up with Email
              </button>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="btn-secondary w-full flex items-center justify-center space-x-3 py-5 text-lg font-semibold"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2C3E35]"></div>
                ) : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Already have account */}
            <div className="mt-6">
              <p className="text-sm text-[#6B7B63]">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setShowEmailAuth(true);
                    setIsLogin(true);
                  }}
                  className="text-[#87A96B] font-semibold hover:text-[#759458] transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>

            <p className="text-sm text-[#6B7B63] mt-6">
              Free to start • No credit card required
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-[#6B7B63]">
        <p>&copy; 2024 DinDin. Made with 🌿 for food lovers everywhere.</p>
      </footer>
    </div>
  );
};

export default Landing;