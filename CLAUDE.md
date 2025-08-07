# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DinDin is a Tinder-style recipe matching app for couples and individuals to decide what's for dinner. Users swipe through recipes, match with partners on shared preferences, and plan meals together.

## Development Commands

### Frontend (React Native with Expo)
Working directory: `app/frontend/`
- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run web version
- `npm run lint` - Run ESLint checks

### Troubleshooting
- `npm run reset-project` - Reset to clean state (moves code to app-example/)

## Architecture

### Tech Stack
- **Frontend**: React Native with Expo (SDK 53), TypeScript
- **State Management**: Zustand stores for auth and recipes
- **Navigation**: Expo Router with file-based routing
- **Styling**: StyleSheet objects with Tailwind-inspired colors
- **Animations**: react-native-reanimated + gesture-handler for swipe mechanics
- **Backend**: Node.js/Express (planned)
- **Database**: MongoDB (localhost:27017/dindin)

### Project Structure
```
app/frontend/          # React Native mobile app
├── app/              # Expo Router screens
│   ├── (tabs)/      # Tab navigation screens (index, matches, profile)
│   └── auth/        # Authentication flow (login, signup)
├── stores/          # Zustand state management
│   ├── authStore.ts # User authentication
│   └── recipeStore.ts # Recipe data and swipes
└── babel.config.js  # Reanimated plugin configuration

app/OldPythonBackend/  # Legacy Python backend
app/OldReactFrontend/  # Legacy React web app
```

### Key Navigation Flow
1. **Entry**: `app/index.tsx` redirects to auth or tabs
2. **Auth**: `app/auth/` handles login/signup
3. **Main App**: `app/(tabs)/` with 3 screens:
   - `index.tsx` - Recipe swipe interface
   - `matches.tsx` - Matched recipes list
   - `profile.tsx` - User preferences

### State Management Patterns
- **authStore**: User session, login/signup, authentication state
- **recipeStore**: Recipe data, swipe history, matches, current card index
- Mock authentication returns success for any credentials (development)
- Simulated 30% match rate on right swipes

### Gesture & Animation System
- Swipe threshold: 25% of screen width
- Pan gesture with spring animations
- Visual feedback overlays ("LIKE"/"NOPE")
- Card rotation based on swipe direction
- Action buttons as fallback to gestures

## Database Schema

MongoDB collections:
- **users**: User profiles with Google auth integration
- **recipes**: Recipe data matching imported JSON structure
- **matches**: User-to-user recipe matches
- **swipe_history**: Individual swipe records

## Current Implementation Status

### Completed
✅ Swipe card interface with animations
✅ Tab navigation structure
✅ Authentication flow UI
✅ Zustand state management
✅ Match detection system
✅ Responsive layouts

### Pending Integration
- Backend API connections (currently using mock data)
- MongoDB database integration
- Google OAuth implementation
- Real-time WebSocket for live matching
- User preference persistence

## Important Development Notes

1. **Babel Config**: The `babel.config.js` must include `react-native-reanimated/plugin` for animations to work

2. **Gesture Handler**: All gesture-enabled components must be wrapped in `GestureHandlerRootView`

3. **Mock Data**: Recipe data is hardcoded in `stores/recipeStore.ts` - replace with API calls when backend ready

4. **Platform-specific code**: Some components have `.ios.tsx` variants (IconSymbol, TabBarBackground)

5. **TypeScript Paths**: Use `@/*` for root imports (configured in tsconfig.json)

6. **Color Scheme**: Uses Tailwind-inspired color names (orange-500, gray-800) in inline styles


## Constants Over Magic Numbers
- Replace hard-coded values with named constants
- Use descriptive constant names that explain the value's purpose
- Keep constants at the top of the file or in a dedicated constants file

## Meaningful Names
- Variables, functions, and classes should reveal their purpose
- Names should explain why something exists and how it's used
- Avoid abbreviations unless they're universally understood

## Smart Comments
- Don't comment on what the code does - make the code self-documenting
- Use comments to explain why something is done a certain way
- Document APIs, complex algorithms, and non-obvious side effects

## Single Responsibility
- Each function should do exactly one thing
- Functions should be small and focused
- If a function needs a comment to explain what it does, it should be split

## DRY (Don't Repeat Yourself)
- Extract repeated code into reusable functions
- Share common logic through proper abstraction
- Maintain single sources of truth

## Clean Structure
- Keep related code together
- Organize code in a logical hierarchy
- Use consistent file and folder naming conventions

## Encapsulation
- Hide implementation details
- Expose clear interfaces
- Move nested conditionals into well-named functions

## Code Quality Maintenance
- Refactor continuously
- Fix technical debt early
- Leave code cleaner than you found it

## Testing
- Write tests before fixing bugs
- Keep tests readable and maintainable
- Test edge cases and error conditions

## Version Control
- Write clear commit messages
- Make small, focused commits
- Use meaningful branch names


## Verify Information
Always verify information before presenting it. Do not make assumptions or speculate without clear evidence.

## File-by-File Changes
Make changes file by file and give me a chance to spot mistakes.

## No Apologies
Never use apologies.

## No Understanding Feedback
Avoid giving feedback about understanding in comments or documentation.

## No Whitespace Suggestions
Don't suggest whitespace changes.

## No Summaries
Don't summarize changes made.

## No Inventions
Don't invent changes other than what's explicitly requested.

## No Unnecessary Confirmations
Don't ask for confirmation of information already provided in the context.

## Preserve Existing Code
Don't remove unrelated code or functionalities. Pay attention to preserving existing structures.

## Single Chunk Edits
Provide all edits in a single chunk instead of multiple-step instructions or explanations for the same file.

## No Implementation Checks
Don't ask the user to verify implementations that are visible in the provided context.

## No Unnecessary Updates
Don't suggest updates or changes to files when there are no actual modifications needed.

## Provide Real File Links
Always provide links to the real files, not x.md.

## No Current Implementation
Don't show or discuss the current implementation unless specifically requested.
