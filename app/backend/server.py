from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, validator, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pathlib import Path
from passlib.context import CryptContext
import os
import uuid
import jwt
import httpx
import logging

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configuration
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-super-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Google OAuth configuration
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'dindin_db')]

# FastAPI app setup
app = FastAPI(title="DinDin API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ================== PASSWORD UTILITIES ==================

def verify_password(plain_password, hashed_password):
    """Verify a plain password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Hash a password for storing in database"""
    return pwd_context.hash(password)

# ================== DATA MODELS ==================

class IngredientModel(BaseModel):
    name: str = Field(..., max_length=100, description="Ingredient name")
    amount: Optional[str] = Field(None, max_length=50, description="Amount/quantity")
    unit: Optional[str] = Field(None, max_length=20, description="Unit of measurement")

class InstructionModel(BaseModel):
    step: int = Field(..., ge=1, description="Step number (starting from 1)")
    description: str = Field(..., max_length=500, description="Step description")
    duration: Optional[int] = Field(None, ge=0, le=480, description="Duration in minutes")

class NutritionModel(BaseModel):
    calories: Optional[int] = Field(None, ge=0, le=10000)
    protein: Optional[int] = Field(None, ge=0, le=1000)
    carbs: Optional[int] = Field(None, ge=0, le=1000)
    fat: Optional[int] = Field(None, ge=0, le=1000)
    fiber: Optional[int] = Field(None, ge=0, le=200)
    sugar: Optional[int] = Field(None, ge=0, le=500)

class RecipeModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., max_length=200, description="Recipe title")
    description: Optional[str] = Field(None, max_length=1000, description="Recipe description")
    image_url: Optional[str] = Field(None, description="Recipe image URL")
    prep_time: Optional[int] = Field(None, ge=0, le=1440, description="Prep time in minutes")
    cook_time: Optional[int] = Field(None, ge=0, le=1440, description="Cook time in minutes")
    difficulty: str = Field(..., description="Recipe difficulty level")
    cuisine_type: Optional[str] = Field(None, max_length=50, description="Cuisine type")
    dietary_tags: List[str] = Field(default_factory=list, description="Dietary tags")
    ingredients: List[IngredientModel] = Field(..., min_items=1, description="Recipe ingredients")
    instructions: List[InstructionModel] = Field(..., min_items=1, description="Cooking instructions")
    nutrition: Optional[NutritionModel] = Field(None, description="Nutritional information")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @validator('difficulty')
    def validate_difficulty(cls, v):
        allowed = ['easy', 'medium', 'hard']
        if v not in allowed:
            raise ValueError(f'Difficulty must be one of {allowed}')
        return v

class UserModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr = Field(..., description="User email")
    name: str = Field(..., description="User full name")
    avatar: Optional[str] = Field(None, description="User avatar URL")
    
    # Auth fields - either Google OAuth or email/password
    google_id: Optional[str] = Field(None, description="Google OAuth ID")
    hashed_password: Optional[str] = Field(None, description="Hashed password for email auth")
    
    # Profile fields
    dietary_restrictions: List[str] = Field(default_factory=list)
    cuisine_preferences: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SwipeHistoryModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(..., description="User ID")
    recipe_id: str = Field(..., description="Recipe ID")
    swipe_direction: str = Field(..., description="Swipe direction: 'left' or 'right'")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @validator('swipe_direction')
    def validate_swipe_direction(cls, v):
        if v not in ['left', 'right']:
            raise ValueError('Swipe direction must be "left" or "right"')
        return v

class MatchModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user1_id: str = Field(..., description="First user ID")
    user2_id: str = Field(..., description="Second user ID")
    recipe_id: str = Field(..., description="Matched recipe ID")
    status: str = Field(default="new", description="Match status")
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Request/Response models
class EmailSignupRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password")
    name: str = Field(..., min_length=2, max_length=100, description="User full name")

class EmailLoginRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")

class GoogleAuthRequest(BaseModel):
    token: str = Field(..., description="Google OAuth token")

class SwipeRequest(BaseModel):
    recipe_id: str = Field(..., description="Recipe ID to swipe on")
    direction: str = Field(..., description="Swipe direction: 'left' or 'right'")

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    avatar: Optional[str]
    dietary_restrictions: List[str]
    cuisine_preferences: List[str]
    auth_method: str  # 'google' or 'email'

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# ================== AUTH UTILITIES ==================

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def verify_google_token(token: str) -> dict:
    """Verify Google OAuth token and return user info"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://www.googleapis.com/oauth2/v1/userinfo?access_token={token}"
            )
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Invalid Google token")
            
            user_info = response.json()
            return {
                "google_id": user_info["id"],
                "email": user_info["email"],
                "name": user_info["name"],
                "avatar": user_info.get("picture")
            }
    except Exception as e:
        logger.error(f"Google token verification failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid Google token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extract current user from JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get user from database
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return UserModel(**user)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ================== API ROUTES ==================

@api_router.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "DinDin API is running!", "version": "1.0.0", "auth_methods": ["email", "google"]}

@api_router.post("/auth/signup", response_model=AuthResponse)
async def email_signup(request: EmailSignupRequest):
    """Sign up new user with email and password"""
    try:
        # Check if user with this email already exists
        existing_user = await db.users.find_one({"email": request.email})
        if existing_user:
            raise HTTPException(
                status_code=400, 
                detail="User with this email already exists"
            )
        
        # Hash password
        hashed_password = get_password_hash(request.password)
        
        # Create new user
        user_data = {
            "email": request.email,
            "name": request.name,
            "hashed_password": hashed_password,
            "dietary_restrictions": [],
            "cuisine_preferences": []
        }
        # Don't set google_id at all for email users to avoid null conflicts
        
        user = UserModel(**user_data)
        
        # Save to database
        await db.users.insert_one(user.dict())
        
        # Create JWT token
        access_token = create_access_token(data={"sub": user.id})
        
        # Return user response (excluding password hash)
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            avatar=user.avatar,
            dietary_restrictions=user.dietary_restrictions,
            cuisine_preferences=user.cuisine_preferences,
            auth_method="email"
        )
        
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email signup error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create account")

@api_router.post("/auth/login", response_model=AuthResponse)
async def email_login(request: EmailLoginRequest):
    """Login user with email and password"""
    try:
        # Find user by email
        user_data = await db.users.find_one({"email": request.email})
        if not user_data:
            raise HTTPException(
                status_code=401, 
                detail="Invalid email or password"
            )
        
        user = UserModel(**user_data)
        
        # Check if this is an email/password user (not Google OAuth)
        if not user.hashed_password:
            raise HTTPException(
                status_code=401, 
                detail="This account uses Google authentication. Please sign in with Google."
            )
        
        # Verify password
        if not verify_password(request.password, user.hashed_password):
            raise HTTPException(
                status_code=401, 
                detail="Invalid email or password"
            )
        
        # Create JWT token
        access_token = create_access_token(data={"sub": user.id})
        
        # Return user response
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            avatar=user.avatar,
            dietary_restrictions=user.dietary_restrictions,
            cuisine_preferences=user.cuisine_preferences,
            auth_method="email"
        )
        
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@api_router.post("/auth/google", response_model=AuthResponse)
async def google_auth(request: GoogleAuthRequest):
    """Authenticate user with Google OAuth token"""
    try:
        # Verify Google token and get user info
        google_user_info = await verify_google_token(request.token)
        
        # Check if user exists in database
        existing_user = await db.users.find_one({"email": google_user_info["email"]})
        
        if existing_user:
            user = UserModel(**existing_user)
            
            # If this is an email/password user trying to use Google auth
            if user.google_id is None:
                # Update user to also support Google auth
                await db.users.update_one(
                    {"id": user.id},
                    {"$set": {"google_id": google_user_info["google_id"]}}
                )
                user.google_id = google_user_info["google_id"]
        else:
            # Create new Google OAuth user
            user_data = {
                "email": google_user_info["email"],
                "name": google_user_info["name"],
                "avatar": google_user_info.get("avatar"),
                "google_id": google_user_info["google_id"],
                "dietary_restrictions": [],
                "cuisine_preferences": []
            }
            # Don't set hashed_password for Google users
            
            user = UserModel(**user_data)
            await db.users.insert_one(user.dict())
        
        # Create JWT token
        access_token = create_access_token(data={"sub": user.id})
        
        # Return user response
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            avatar=user.avatar,
            dietary_restrictions=user.dietary_restrictions,
            cuisine_preferences=user.cuisine_preferences,
            auth_method="google"
        )
        
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google auth error: {e}")
        raise HTTPException(status_code=400, detail="Authentication failed")

@api_router.get("/recipes", response_model=List[RecipeModel])
async def get_recipes(
    limit: int = 10,
    skip: int = 0,
    difficulty: Optional[str] = None,
    cuisine_type: Optional[str] = None,
    dietary_tags: Optional[str] = None,
    current_user: UserModel = Depends(get_current_user)
):
    """Get recipes for discovery"""
    try:
        # Build query filter
        query = {}
        
        if difficulty:
            query["difficulty"] = difficulty
        
        if cuisine_type:
            query["cuisine_type"] = cuisine_type
        
        if dietary_tags:
            tags = [tag.strip() for tag in dietary_tags.split(",")]
            query["dietary_tags"] = {"$in": tags}
        
        # Get user's swipe history to exclude already swiped recipes
        swiped_recipes = await db.swipe_history.find({"user_id": current_user.id}).to_list(1000)
        swiped_recipe_ids = [swipe["recipe_id"] for swipe in swiped_recipes]
        
        if swiped_recipe_ids:
            query["id"] = {"$nin": swiped_recipe_ids}
        
        # Fetch recipes
        cursor = db.recipes.find(query).skip(skip).limit(limit)
        recipes = await cursor.to_list(limit)
        
        return [RecipeModel(**recipe) for recipe in recipes]
        
    except Exception as e:
        logger.error(f"Error fetching recipes: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch recipes")

@api_router.post("/swipe")
async def swipe_recipe(
    request: SwipeRequest,
    current_user: UserModel = Depends(get_current_user)
):
    """Record user swipe on a recipe"""
    try:
        # Validate recipe exists
        recipe = await db.recipes.find_one({"id": request.recipe_id})
        if not recipe:
            raise HTTPException(status_code=404, detail="Recipe not found")
        
        # Check if user already swiped on this recipe
        existing_swipe = await db.swipe_history.find_one({
            "user_id": current_user.id,
            "recipe_id": request.recipe_id
        })
        
        if existing_swipe:
            raise HTTPException(status_code=400, detail="Already swiped on this recipe")
        
        # Record swipe
        swipe = SwipeHistoryModel(
            user_id=current_user.id,
            recipe_id=request.recipe_id,
            swipe_direction=request.direction
        )
        
        await db.swipe_history.insert_one(swipe.dict())
        
        # If it's a right swipe, check for potential matches
        matches = []
        if request.direction == "right":
            # Find other users who also swiped right on this recipe
            right_swipes = await db.swipe_history.find({
                "recipe_id": request.recipe_id,
                "swipe_direction": "right",
                "user_id": {"$ne": current_user.id}
            }).to_list(100)
            
            for other_swipe in right_swipes:
                # Create match
                match = MatchModel(
                    user1_id=current_user.id,
                    user2_id=other_swipe["user_id"],
                    recipe_id=request.recipe_id
                )
                
                # Check if match already exists
                existing_match = await db.matches.find_one({
                    "$or": [
                        {"user1_id": current_user.id, "user2_id": other_swipe["user_id"], "recipe_id": request.recipe_id},
                        {"user1_id": other_swipe["user_id"], "user2_id": current_user.id, "recipe_id": request.recipe_id}
                    ]
                })
                
                if not existing_match:
                    await db.matches.insert_one(match.dict())
                    matches.append(match.dict())
        
        return {
            "success": True,
            "swipe_recorded": True,
            "matches": matches,
            "message": f"Successfully swiped {request.direction} on recipe"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recording swipe: {e}")
        raise HTTPException(status_code=500, detail="Failed to record swipe")

@api_router.get("/matches")
async def get_user_matches(current_user: UserModel = Depends(get_current_user)):
    """Get user's recipe matches"""
    try:
        # Find all matches involving this user
        matches = await db.matches.find({
            "$or": [
                {"user1_id": current_user.id},
                {"user2_id": current_user.id}
            ]
        }).to_list(100)
        
        # Enrich matches with recipe and partner info
        enriched_matches = []
        for match in matches:
            # Get recipe info
            recipe = await db.recipes.find_one({"id": match["recipe_id"]})
            if not recipe:
                continue
            
            # Get partner info
            partner_id = match["user2_id"] if match["user1_id"] == current_user.id else match["user1_id"]
            partner = await db.users.find_one({"id": partner_id})
            if not partner:
                continue
            
            enriched_matches.append({
                "id": match["id"],
                "recipe": RecipeModel(**recipe).dict(),
                "matched_with": {
                    "id": partner["id"],
                    "name": partner["name"],
                    "avatar": partner.get("avatar")
                },
                "status": match["status"],
                "matched_at": match["created_at"]
            })
        
        return enriched_matches
        
    except Exception as e:
        logger.error(f"Error fetching matches: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch matches")

@api_router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: UserModel = Depends(get_current_user)):
    """Get current user's profile"""
    auth_method = "google" if current_user.google_id else "email"
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        avatar=current_user.avatar,
        dietary_restrictions=current_user.dietary_restrictions,
        cuisine_preferences=current_user.cuisine_preferences,
        auth_method=auth_method
    )

@api_router.put("/profile", response_model=UserResponse)
async def update_profile(
    updates: Dict[str, Any],
    current_user: UserModel = Depends(get_current_user)
):
    """Update user profile"""
    try:
        # Allowed fields to update
        allowed_fields = {"name", "dietary_restrictions", "cuisine_preferences"}
        update_data = {k: v for k, v in updates.items() if k in allowed_fields}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields to update")
        
        # Update user in database
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": update_data}
        )
        
        # Get updated user
        updated_user_data = await db.users.find_one({"id": current_user.id})
        updated_user = UserModel(**updated_user_data)
        
        auth_method = "google" if updated_user.google_id else "email"
        return UserResponse(
            id=updated_user.id,
            email=updated_user.email,
            name=updated_user.name,
            avatar=updated_user.avatar,
            dietary_restrictions=updated_user.dietary_restrictions,
            cuisine_preferences=updated_user.cuisine_preferences,
            auth_method=auth_method
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to update profile")

# Include router
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)