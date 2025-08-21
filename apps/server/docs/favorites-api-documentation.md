# Favorites API Documentation

## Overview

The Favorites API provides comprehensive functionality for managing user recipe favorites in the DinDin recipe app. This implementation includes remove from favorites, add to favorites, and check favorite status mutations with full error handling, atomic database operations, and comprehensive testing.

## Implementation Summary

### ✅ Completed Features

1. **removeFromFavorites tRPC Mutation** - Safely remove recipes from user favorites
2. **addToFavorites tRPC Mutation** - Add recipes to user favorites with duplicate prevention
3. **isFavorite Query** - Check if a recipe is in user's favorites
4. **Atomic Database Operations** - All operations use MongoDB transactions for consistency
5. **Comprehensive Error Handling** - Proper validation and meaningful error messages
6. **TypeScript Types** - Full type safety with detailed interfaces
7. **Business Logic Service** - Encapsulated favorites service with helper methods
8. **Unit Tests** - Complete test coverage for all service methods
9. **Integration Tests** - End-to-end testing of tRPC procedures
10. **Recipe Like Count Tracking** - Automatic increment/decrement of recipe likes

## API Endpoints

### Remove from Favorites

```typescript
// tRPC Procedure
user.removeFromFavorites

// Input
{
  recipeId: string; // MongoDB ObjectId
}

// Response
{
  success: boolean;
  message: string;
  recipeId: string;
  remainingFavoritesCount: number;
}
```

**Example Usage:**
```typescript
const result = await trpc.user.removeFromFavorites.mutate({
  recipeId: "507f1f77bcf86cd799439011"
});
```

**Error Cases:**
- `BAD_REQUEST`: Invalid recipe ID format
- `NOT_FOUND`: User profile not found
- `NOT_FOUND`: Recipe not found in favorites
- `NOT_FOUND`: Recipe doesn't exist
- `INTERNAL_SERVER_ERROR`: Database operation failed

### Add to Favorites

```typescript
// tRPC Procedure
user.addToFavorites

// Input
{
  recipeId: string; // MongoDB ObjectId
}

// Response
{
  success: boolean;
  message: string;
  recipeId: string;
  totalFavoritesCount: number;
}
```

**Example Usage:**
```typescript
const result = await trpc.user.addToFavorites.mutate({
  recipeId: "507f1f77bcf86cd799439011"
});
```

**Error Cases:**
- `BAD_REQUEST`: Invalid recipe ID format
- `BAD_REQUEST`: Recipe already in favorites
- `NOT_FOUND`: User profile not found
- `NOT_FOUND`: Recipe doesn't exist
- `INTERNAL_SERVER_ERROR`: Database operation failed

### Check Favorite Status

```typescript
// tRPC Procedure
user.isFavorite

// Input
{
  recipeId: string; // MongoDB ObjectId
}

// Response
{
  isFavorite: boolean;
  recipeId: string;
}
```

**Example Usage:**
```typescript
const result = await trpc.user.isFavorite.query({
  recipeId: "507f1f77bcf86cd799439011"
});
```

### Get Liked Recipes (Enhanced)

Existing endpoint that works with the new favorites system:

```typescript
// tRPC Procedure
user.getLikedRecipes

// Input
{
  limit?: number; // default: 20, max: 100
  offset?: number; // default: 0
}

// Response
{
  recipes: Recipe[];
  total: number;
}
```

## Database Schema

### User Model Updates

The favorites system uses the existing `likedRecipes` field in the `DindinUser` model:

```typescript
likedRecipes: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Recipe',
}]
```

### Recipe Model Integration

The system automatically updates the `likes` field in recipes:

```typescript
likes: {
  type: Number,
  default: 0,
  min: 0,
}
```

## Service Architecture

### FavoritesService

The `FavoritesServiceImpl` class encapsulates all business logic:

```typescript
class FavoritesServiceImpl implements FavoritesService {
  // Core operations
  addToFavorites(context, recipeId): Promise<AddToFavoritesResponse>
  removeFromFavorites(context, recipeId): Promise<RemoveFromFavoritesResponse>
  isFavorite(context, recipeId): Promise<IsFavoriteResponse>
  
  // Helper methods
  validateFavoritesOperation(context, recipeId): Promise<FavoriteValidationResult>
  getFavoritesCount(authUserId): Promise<number>
  areFavorites(authUserId, recipeIds): Promise<Record<string, boolean>>
}
```

### Atomic Operations

All favorites operations use MongoDB transactions to ensure data consistency:

```typescript
// Example: Remove from favorites with atomic updates
const session = await mongoose.startSession();
await session.withTransaction(async () => {
  // Remove from user's favorites
  await DindinUser.findByIdAndUpdate(userId, {
    $pull: { likedRecipes: recipeId }
  }, { session });
  
  // Decrement recipe like count
  await Recipe.findByIdAndUpdate(recipeId, {
    $inc: { likes: -1 }
  }, { session });
});
```

## Error Handling

### Validation Rules

1. **Recipe ID Validation**: Must be valid MongoDB ObjectId
2. **User Existence**: User profile must exist
3. **Recipe Existence**: Recipe must exist in database
4. **Duplicate Prevention**: Can't add recipe already in favorites
5. **Removal Validation**: Can only remove recipes that are in favorites

### Error Response Format

All errors follow tRPC error format:

```typescript
{
  code: "BAD_REQUEST" | "NOT_FOUND" | "INTERNAL_SERVER_ERROR";
  message: string;
}
```

## Testing

### Unit Tests

Location: `test/unit/favorites.service.test.ts`

Coverage:
- ✅ Add to favorites - success cases
- ✅ Add to favorites - error cases (duplicate, invalid ID, non-existent recipe)
- ✅ Remove from favorites - success cases
- ✅ Remove from favorites - error cases (not in favorites, invalid ID)
- ✅ Check favorite status
- ✅ Validation methods
- ✅ Helper methods (count, batch check)
- ✅ Atomic operations
- ✅ Error handling
- ✅ Concurrent operation safety

### Integration Tests

Location: `test/integration/favorites.router.test.ts`

Coverage:
- ✅ Full tRPC procedure testing
- ✅ Database state verification
- ✅ Context-based authentication
- ✅ Pagination with favorites
- ✅ Concurrent operations
- ✅ Data consistency validation

### Running Tests

```bash
# All favorites tests
npm run test:favorites

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Security Considerations

### Authentication

All endpoints require authenticated user context:

```typescript
// Context validation
const user = await DindinUser.findOne({ authUserId: ctx.session.user.id });
if (!user) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "User profile not found",
  });
}
```

### Input Validation

- Recipe IDs validated as MongoDB ObjectIds
- User permissions checked for all operations
- Database constraints prevent invalid states

### Data Integrity

- Atomic operations prevent race conditions
- Transaction rollback on failures
- Like count consistency maintained

## Performance Considerations

### Database Queries

- Efficient indexing on `likedRecipes` field
- Lean queries for read operations
- Batch operations for multiple checks

### Caching Strategy

The implementation supports caching at multiple levels:

1. **Service Level**: Method-level caching for repeated operations
2. **Database Level**: MongoDB query caching
3. **Application Level**: tRPC response caching

### Scalability

- Atomic operations handle concurrent users
- Efficient MongoDB operators ($pull, $addToSet, $inc)
- Minimal data transfer with lean queries

## Usage Examples

### Frontend Integration

```typescript
// React component example
function RecipeCard({ recipe }) {
  const utils = trpc.useContext();
  
  // Check if recipe is favorite
  const { data: favoriteStatus } = trpc.user.isFavorite.useQuery({
    recipeId: recipe.id
  });
  
  // Remove from favorites mutation
  const removeFromFavorites = trpc.user.removeFromFavorites.useMutation({
    onSuccess: () => {
      // Invalidate queries to refresh UI
      utils.user.getLikedRecipes.invalidate();
      utils.user.isFavorite.invalidate({ recipeId: recipe.id });
    }
  });
  
  // Add to favorites mutation
  const addToFavorites = trpc.user.addToFavorites.useMutation({
    onSuccess: () => {
      utils.user.getLikedRecipes.invalidate();
      utils.user.isFavorite.invalidate({ recipeId: recipe.id });
    }
  });
  
  const toggleFavorite = () => {
    if (favoriteStatus?.isFavorite) {
      removeFromFavorites.mutate({ recipeId: recipe.id });
    } else {
      addToFavorites.mutate({ recipeId: recipe.id });
    }
  };
  
  return (
    <div>
      <h3>{recipe.title}</h3>
      <button onClick={toggleFavorite}>
        {favoriteStatus?.isFavorite ? '❤️ Favorited' : '🤍 Add to Favorites'}
      </button>
    </div>
  );
}
```

### Mobile App Integration

```typescript
// React Native example
import { trpc } from '../utils/trpc';

export function useRecipeFavorites(recipeId: string) {
  const utils = trpc.useContext();
  
  const favoriteQuery = trpc.user.isFavorite.useQuery({ recipeId });
  
  const addMutation = trpc.user.addToFavorites.useMutation({
    onSuccess: (data) => {
      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Added to Favorites',
        text2: `You now have ${data.totalFavoritesCount} favorites`
      });
      
      // Update cache
      utils.user.isFavorite.setData({ recipeId }, { 
        isFavorite: true, 
        recipeId 
      });
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to add favorite',
        text2: error.message
      });
    }
  });
  
  const removeMutation = trpc.user.removeFromFavorites.useMutation({
    onSuccess: (data) => {
      Toast.show({
        type: 'success',
        text1: 'Removed from Favorites',
        text2: `${data.remainingFavoritesCount} favorites remaining`
      });
      
      utils.user.isFavorite.setData({ recipeId }, { 
        isFavorite: false, 
        recipeId 
      });
    }
  });
  
  return {
    isFavorite: favoriteQuery.data?.isFavorite ?? false,
    isLoading: favoriteQuery.isLoading,
    addToFavorites: () => addMutation.mutate({ recipeId }),
    removeFromFavorites: () => removeMutation.mutate({ recipeId }),
    isUpdating: addMutation.isLoading || removeMutation.isLoading
  };
}
```

## File Structure

```
src/
├── routers/
│   └── user.ts                 # tRPC procedures (removeFromFavorites, addToFavorites, isFavorite)
├── services/
│   └── favorites-service.ts    # Business logic service
├── types/
│   └── favorites.types.ts      # TypeScript type definitions
└── scripts/
    ├── test-favorites-functionality.ts  # Demo script
    └── validate-favorites-types.ts      # Type validation

test/
├── unit/
│   └── favorites.service.test.ts       # Service unit tests
├── integration/
│   └── favorites.router.test.ts        # tRPC integration tests
└── setup/
    └── favorites-test-setup.ts          # Test configuration

docs/
└── favorites-api-documentation.md      # This documentation
```

## Future Enhancements

### Potential Features

1. **Favorites Collections** - Organize favorites into custom collections
2. **Sharing** - Share favorite recipes with other users
3. **Recommendations** - Suggest recipes based on favorites
4. **Export** - Export favorites to external services
5. **Import** - Import recipes from bookmarks or other apps
6. **Tags** - Tag favorites for better organization
7. **Notes** - Add personal notes to favorite recipes
8. **Search** - Search within favorites
9. **Analytics** - Track favorite recipe trends

### Performance Optimizations

1. **Pagination** - Implement cursor-based pagination for large favorite lists
2. **Caching** - Redis caching for frequently accessed favorites
3. **Batch Operations** - Bulk add/remove operations
4. **Background Processing** - Async processing for like count updates

## Troubleshooting

### Common Issues

1. **Invalid ObjectId Error**
   - Ensure recipe IDs are valid MongoDB ObjectIds
   - Use `mongoose.isValidObjectId()` for validation

2. **User Not Found**
   - Verify authentication context is properly set
   - Check that user profile exists in database

3. **Recipe Not Found**
   - Ensure recipe exists in database before adding to favorites
   - Handle soft-deleted or inactive recipes

4. **Transaction Failures**
   - Check MongoDB replica set configuration
   - Ensure proper error handling and retry logic

### Debug Scripts

```bash
# Type validation
npx tsx src/scripts/validate-favorites-types.ts

# Functionality demo
npm run demo:favorites

# Database consistency check
npx tsx src/scripts/check-favorites-consistency.ts
```

## Conclusion

The Favorites API provides a robust, scalable, and well-tested solution for managing user recipe favorites in the DinDin app. The implementation follows best practices for:

- ✅ **Data Integrity**: Atomic operations and transaction safety
- ✅ **Type Safety**: Comprehensive TypeScript definitions
- ✅ **Error Handling**: Detailed validation and meaningful errors
- ✅ **Testing**: Unit and integration test coverage
- ✅ **Performance**: Efficient database operations
- ✅ **Security**: Authentication and authorization
- ✅ **Maintainability**: Clean architecture and documentation

The API is ready for production use and can be extended with additional features as needed.