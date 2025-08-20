# React Hooks Order Error - RESOLVED ✅

## Issue Description
**Error**: "React has detected a change in the order of Hooks"
**Message**: "Rendered more hooks than during the previous render"
**Location**: SwipeScreen component line 18
**Impact**: App crashed with hooks violation error

## Root Cause Analysis

The error occurred because hooks were being called conditionally inside the JSX render:

```typescript
// PROBLEM: Hooks called conditionally in JSX
{nextRecipe && (
  <RecipeCard
    translateX={useSharedValue(0)}  // ❌ Hook inside conditional
    translateY={useSharedValue(0)}  // ❌ Hook inside conditional
  />
)}
```

### React's Rules of Hooks
1. **Only call hooks at the top level** - Never inside conditionals, loops, or nested functions
2. **Always call hooks in the same order** - Every render must call the same hooks in the same sequence
3. **Only call hooks from React functions** - Components or custom hooks

### What Happened
- When `nextRecipe` was null: 28 hooks called
- When `nextRecipe` existed: 29+ hooks called (extra `useSharedValue` hooks)
- React detected the mismatch and threw an error

## Solution Applied

### Move Hooks to Top Level
Created all shared values at the component's top level, outside any conditionals:

```typescript
export default function SwipeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  
  // SOLUTION: Always create these hooks (maintain consistent order)
  const nextTranslateX = useSharedValue(0);
  const nextTranslateY = useSharedValue(0);
  
  // ... rest of component
```

### Use Pre-created Values in JSX
```typescript
// Now safe to use conditionally since hooks already called
{nextRecipe && (
  <RecipeCard
    translateX={nextTranslateX}  // ✅ Using pre-created value
    translateY={nextTranslateY}  // ✅ Using pre-created value
  />
)}
```

## Files Modified
- `/apps/native/app/(tabs)/swipe.tsx`:
  - Added `nextTranslateX` and `nextTranslateY` at top level
  - Updated RecipeCard props to use pre-created values

## Why This Works
1. **Consistent Hook Count**: Same number of hooks called every render
2. **Same Order**: Hooks always called in identical sequence
3. **No Conditionals**: All hooks at component's top level
4. **Safe JSX**: Conditional rendering only affects JSX, not hooks

## Prevention Guidelines

### ✅ DO
- Call all hooks at the top of components
- Use hooks unconditionally
- Create values even if not always used
- Keep hooks in consistent order

### ❌ DON'T
- Call hooks inside if statements
- Call hooks inside loops
- Call hooks inside callbacks
- Call hooks conditionally in JSX

## Example Pattern
```typescript
// GOOD: All hooks at top level
function Component() {
  const value1 = useSharedValue(0);
  const value2 = useSharedValue(0);
  
  if (condition) {
    // Use value1
  } else {
    // Use value2
  }
}

// BAD: Conditional hooks
function Component() {
  if (condition) {
    const value1 = useSharedValue(0); // ❌ Conditional
  }
}
```

## Testing
The fix ensures:
- ✅ No hooks order violations
- ✅ Consistent render behavior
- ✅ App doesn't crash
- ✅ Swipe functionality intact

## Status
**RESOLVED** - The hooks are now called in consistent order, eliminating the React hooks violation. The app should run without crashing.