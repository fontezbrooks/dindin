# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native food tracking and recipe matching app called "DinDin" built with Expo. The app features a Tinder-style swipe interface for discovering recipes and matching with other users based on shared food preferences.

## Development Commands

### Running the App
- `npm start` - Start the Expo development server
- `npm run ios` - Start the app on iOS simulator
- `npm run android` - Start the app on Android emulator
- `npm run web` - Start the app for web

### Code Quality
- `npm run lint` - Run ESLint to check code quality

### Troubleshooting
- `npm run reset-project` - Reset the project to a clean state (moves current code to app-example)

## Architecture

### Navigation Structure
- **Expo Router** file-based routing with TypeScript
- Root layout at `app/_layout.tsx` manages theme and font loading
- Authentication flow: `app/auth/` (login, signup screens)
- Tab navigation: `app/(tabs)/` with 3 main screens:
  - `index.tsx` - Recipe discovery with swipe cards
  - `matches.tsx` - Matched recipes list
  - `profile.tsx` - User profile and preferences

### State Management
- **Zustand** for global state management
- `stores/authStore.ts` - Authentication state and user management
- `stores/recipeStore.ts` - Recipe data, swipe history, and matches

### Key Technical Patterns
- **Gesture Handling**: Uses react-native-gesture-handler and react-native-reanimated for swipe animations
- **Authentication Flow**: Mock authentication with Zustand store (ready for API integration)
- **Responsive Design**: Uses Dimensions API for screen-aware layouts
- **Theme Support**: Automatic dark/light mode with React Navigation themes

### Styling Approach
- Inline StyleSheet objects in each component
- Color palette based on Tailwind CSS colors (orange-500, gray-800, etc.)
- Consistent spacing and typography patterns

## Project Dependencies

### Core Dependencies
- React Native 0.79.5 with React 19
- Expo SDK 53
- TypeScript with strict mode enabled

### Navigation & UI
- expo-router for file-based routing
- @react-navigation for theme support
- lucide-react-native for icons
- react-native-gesture-handler for swipe interactions
- react-native-reanimated for animations

### Path Aliases
- `@/*` maps to the project root for cleaner imports

## Current Implementation Status

### Completed Features
- User authentication flow (login/signup)
- Recipe card swipe interface with animations
- Match detection and notifications
- Tab navigation structure
- Responsive layouts

### Mock Data & Pending Integration
- Authentication currently uses mock data
- Recipe data is hardcoded in `stores/recipeStore.ts`
- API endpoints need to be connected when backend is ready
- Real-time matching logic needs WebSocket integration

## Notes for Future Development

When implementing new features:
1. Follow the existing pattern of using Zustand stores for state management
2. Keep components in their respective route folders for Expo Router
3. Use the established color scheme and styling patterns
4. Ensure gesture handlers are properly configured within GestureHandlerRootView
5. Test on both iOS and Android simulators as platform-specific code exists (e.g., IconSymbol, TabBarBackground)