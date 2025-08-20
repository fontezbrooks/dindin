import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const matchSchema = new Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  // The two users who matched on this recipe
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DindinUser',
    required: true,
  }],
  // The recipe they both liked
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true,
  },
  // Match metadata
  matchedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'matched', 'scheduled', 'cooked', 'archived', 'expired'],
    default: 'matched',
  },
  // Cooking plan
  cookDate: {
    type: Date,
    default: null,
  },
  scheduledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DindinUser',
    default: null,
  },
  // Post-cooking feedback
  cookedDate: {
    type: Date,
    default: null,
  },
  ratings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DindinUser',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    ratedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  notes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DindinUser',
    },
    note: {
      type: String,
      maxlength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  photos: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DindinUser',
    },
    photoUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  // Interaction tracking
  interactions: {
    viewedByUsers: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DindinUser',
      },
      viewedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  // Match preferences (could be used for customization)
  preferences: {
    servingSize: {
      type: Number,
      default: 2,
    },
    modifications: [{
      type: String,
    }],
  },
  // Analytics
  analytics: {
    swipeToMatchTime: {
      type: Number, // Time in seconds from first swipe to match
    },
    matchToCookTime: {
      type: Number, // Time in seconds from match to cooking
    },
  },
}, {
  collection: 'matches',
  timestamps: true,
});

// Indexes for efficient querying
matchSchema.index({ users: 1, recipeId: 1 }, { unique: true }); // Prevent duplicate matches
matchSchema.index({ users: 1, status: 1 });
matchSchema.index({ recipeId: 1 });
matchSchema.index({ matchedAt: -1 });
matchSchema.index({ cookDate: 1 });
matchSchema.index({ status: 1 });

// Virtual to check if match is active
matchSchema.virtual('isActive').get(function() {
  return ['matched', 'scheduled'].includes(this.status);
});

// Virtual to check if both users have rated
matchSchema.virtual('isFullyRated').get(function() {
  return this.ratings && this.ratings.length === 2;
});

// Method to check if a user is part of this match
matchSchema.methods.includesUser = function(userId: any) {
  return this.users.some((id: any) => id.toString() === userId.toString());
};

// Method to get the partner's ID for a given user
matchSchema.methods.getPartnerId = function(userId: any) {
  const partner = this.users.find((id: any) => id.toString() !== userId.toString());
  return partner ? partner.toString() : null;
};

// Method to update match status
matchSchema.methods.updateStatus = function(newStatus: string) {
  const validTransitions: Record<string, string[]> = {
    'matched': ['scheduled', 'archived', 'expired'],
    'scheduled': ['cooked', 'matched', 'archived'],
    'cooked': ['archived'],
    'pending': ['matched', 'expired'],
  };

  const currentStatus = this.status;
  if (validTransitions[currentStatus]?.includes(newStatus)) {
    this.status = newStatus;
    this.interactions.lastActivityAt = new Date();
    return true;
  }
  return false;
};

// Method to add rating
matchSchema.methods.addRating = function(userId: string, rating: number) {
  // Check if user already rated
  const existingRating = this.ratings.find((r: any) => r.userId.toString() === userId);
  
  if (existingRating) {
    existingRating.rating = rating;
    existingRating.ratedAt = new Date();
  } else {
    this.ratings.push({
      userId,
      rating,
      ratedAt: new Date(),
    });
  }
  
  // Update status if both users have rated
  if (this.ratings.length === 2 && this.status === 'cooked') {
    this.status = 'archived';
  }
  
  this.interactions.lastActivityAt = new Date();
};

// Static method to find matches for a user
matchSchema.statics.findUserMatches = function(userId: string, status?: string) {
  const query: any = { users: userId };
  if (status) {
    query.status = status;
  }
  return this.find(query)
    .populate('recipeId')
    .populate('users', 'name profileImage')
    .sort({ matchedAt: -1 });
};

// Static method to check if users have already matched on a recipe
matchSchema.statics.hasExistingMatch = async function(userIds: string[], recipeId: string) {
  const match = await this.findOne({
    users: { $all: userIds },
    recipeId: recipeId,
  });
  return !!match;
};

const Match = model('Match', matchSchema);

export { Match };