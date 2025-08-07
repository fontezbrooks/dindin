# DinDin Backend API

A RESTful API server for the DinDin recipe matching application built with Node.js, Express, and MongoDB.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy the `.env` file from the project root or create one with:
   ```bash
   MONGODB_URI=mongodb://localhost:27017/
   DATABASE_NAME=dindin
   NODE_ENV=development
   PORT=3001
   CORS_ORIGIN=http://localhost:8081
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   ```

3. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Verify the server is running:**
   Visit `http://localhost:3001/api` to see API documentation.

## API Endpoints

### Recipes
- `GET /api/recipes` - Get all recipes with filtering
- `GET /api/recipes/personalized` - Get personalized recipes
- `GET /api/recipes/search` - Search recipes by text
- `GET /api/recipes/:id` - Get single recipe by ID
- `POST /api/recipes` - Create new recipe (admin)
- `PUT /api/recipes/:id` - Update recipe (admin)
- `DELETE /api/recipes/:id` - Delete recipe (admin)
- `POST /api/recipes/:id/like` - Like a recipe

### Swipes
- `POST /api/swipes` - Record a swipe action
- `GET /api/swipes/history/:userId` - Get user's swipe history
- `GET /api/swipes/stats/:recipeId` - Get recipe swipe statistics
- `GET /api/swipes/matches/:userId` - Get user's matches
- `DELETE /api/swipes/:userId/:recipeId` - Undo a swipe

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token

### System
- `GET /health` - Health check endpoint
- `GET /api` - API documentation

## Request/Response Format

### Standard Response Format
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional message",
  "pagination": { /* for paginated responses */ }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors if applicable */ ]
}
```

## Recipe API Examples

### Get Recipes with Filtering
```http
GET /api/recipes?difficulty=easy&cuisine_type=italian&limit=20&sort=popular
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Creamy Mushroom Pasta",
      "description": "Rich and creamy pasta with wild mushrooms",
      "difficulty": "easy",
      "ingredients": [
        {
          "name": "pasta",
          "amount": "400",
          "unit": "g"
        }
      ],
      "instructions": [
        {
          "step": 1,
          "description": "Cook pasta according to package directions"
        }
      ],
      "cookTime": 25,
      "image_url": "https://example.com/image.jpg",
      "tags": ["italian", "vegetarian"],
      "likes": 150,
      "rating": 4.8,
      "createdAt": "2023-07-21T10:30:00.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "skip": 0,
    "total": 45
  }
}
```

### Search Recipes
```http
GET /api/recipes/search?search=pasta mushroom&limit=10
```

### Get Personalized Recipes
```http
GET /api/recipes/personalized?limit=30
```

## Swipe API Examples

### Record a Swipe
```http
POST /api/swipes
Content-Type: application/json

{
  "userId": "user123",
  "recipeId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "direction": "right",
  "sessionId": "session123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "swipeId": "60f7b3b3b3b3b3b3b3b3b3b4",
    "recipeId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "direction": "right",
    "timestamp": "2023-07-21T10:30:00.000Z",
    "isMatch": true,
    "match": {
      "matchId": "match_60f7b3b3b3b3b3b3b3b3b3b4",
      "partnerName": "Alex",
      "confidence": 0.87,
      "matchedAt": "2023-07-21T10:30:00.000Z"
    }
  }
}
```

### Get Swipe History
```http
GET /api/swipes/history/user123?limit=50&direction=right
```

## Authentication Examples

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "John Doe",
      "email": "john@example.com",
      "preferences": { /* user preferences */ }
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

## Database Schema

### Recipe Document
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  difficulty: String (required, enum: ['easy', 'medium', 'hard']),
  ingredients: [
    {
      name: String (required),
      amount: String (required),
      unit: String
    }
  ],
  instructions: [
    {
      step: Number (required),
      description: String (required),
      duration: Number
    }
  ],
  cookTime: Number,
  prepTime: Number,
  image_url: String,
  cuisine_type: String,
  dietary_tags: [String],
  tags: [String],
  likes: Number (default: 0),
  dislikes: Number (default: 0),
  servings: Number,
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number
  },
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Swipe Document
```javascript
{
  _id: ObjectId,
  userId: String (required),
  recipeId: ObjectId (required, ref: 'Recipe'),
  direction: String (required, enum: ['left', 'right']),
  timestamp: Date (default: now),
  sessionId: String,
  deviceInfo: {
    platform: String,
    userAgent: String,
    ipAddress: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Default**: 100 requests per 15 minutes per IP
- **Configurable** via environment variables

## Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing configuration
- **Rate Limiting** - Request rate limiting
- **Input Validation** - Request validation using express-validator
- **Password Hashing** - bcrypt for secure password storage
- **JWT Authentication** - JSON Web Tokens for stateless auth

## Development

### Project Structure
```
app/backend/
├── models/          # MongoDB models
├── routes/          # API route handlers
├── middleware/      # Custom middleware
├── scripts/         # Utility scripts
├── server.js        # Main server file
└── README.md        # This file
```

### Scripts
- `npm run dev` - Development mode with nodemon
- `npm start` - Production mode
- `npm run seed` - Seed database with sample data
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Deployment

### Environment Variables
Ensure these environment variables are set in production:

```bash
NODE_ENV=production
MONGODB_URI=mongodb://your-mongo-host:27017/
DATABASE_NAME=dindin
PORT=3001
CORS_ORIGIN=https://your-frontend-domain.com
JWT_SECRET=your-super-secure-secret-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### MongoDB Indexes
The application automatically creates these indexes for performance:
- Recipe title and description text search
- Recipe filtering by difficulty, cuisine, tags
- Swipe history by user and timestamp
- User lookup by email

### Health Check
Monitor application health via:
```http
GET /health
```

Returns server status, database connectivity, and uptime information.