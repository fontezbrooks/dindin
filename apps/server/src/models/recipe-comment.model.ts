import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Model for recipe comments and tips
const recipeCommentSchema = new Schema({
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true,
  },
  sharedRecipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SharedRecipe',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DindinUser',
    required: true,
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecipeComment',
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  commentType: {
    type: String,
    enum: ['comment', 'tip', 'modification', 'question', 'review'],
    default: 'comment',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  isHelpful: {
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    notHelpfulVotes: {
      type: Number,
      default: 0,
    },
    votedBy: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DindinUser',
      },
      vote: {
        type: String,
        enum: ['helpful', 'not_helpful'],
      },
      votedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  isFlagged: {
    type: Boolean,
    default: false,
  },
  flagReasons: [{
    type: String,
    enum: ['spam', 'inappropriate', 'offensive', 'misinformation', 'other'],
  }],
  replies: {
    type: Number,
    default: 0,
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
  }],
}, {
  collection: 'recipe_comments',
  timestamps: true,
});

// Indexes for efficient querying
recipeCommentSchema.index({ recipeId: 1, createdAt: -1 });
recipeCommentSchema.index({ sharedRecipeId: 1, createdAt: -1 });
recipeCommentSchema.index({ userId: 1, createdAt: -1 });
recipeCommentSchema.index({ parentCommentId: 1, createdAt: -1 });
recipeCommentSchema.index({ commentType: 1, isVisible: 1 });
recipeCommentSchema.index({ 'isHelpful.helpfulVotes': -1 });

// Virtual for net helpful votes
recipeCommentSchema.virtual('netHelpfulVotes').get(function() {
  return this.isHelpful.helpfulVotes - this.isHelpful.notHelpfulVotes;
});

// Method to vote on comment helpfulness
recipeCommentSchema.methods.voteHelpful = async function(userId: string, vote: 'helpful' | 'not_helpful') {
  // Check if user already voted
  const existingVoteIndex = this.isHelpful.votedBy.findIndex(
    v => v.userId.toString() === userId
  );
  
  if (existingVoteIndex !== -1) {
    // Update existing vote
    const oldVote = this.isHelpful.votedBy[existingVoteIndex].vote;
    if (oldVote !== vote) {
      // Remove old vote count
      if (oldVote === 'helpful') {
        this.isHelpful.helpfulVotes -= 1;
      } else {
        this.isHelpful.notHelpfulVotes -= 1;
      }
      
      // Add new vote count
      if (vote === 'helpful') {
        this.isHelpful.helpfulVotes += 1;
      } else {
        this.isHelpful.notHelpfulVotes += 1;
      }
      
      // Update vote record
      this.isHelpful.votedBy[existingVoteIndex].vote = vote;
      this.isHelpful.votedBy[existingVoteIndex].votedAt = new Date();
    }
  } else {
    // Add new vote
    if (vote === 'helpful') {
      this.isHelpful.helpfulVotes += 1;
    } else {
      this.isHelpful.notHelpfulVotes += 1;
    }
    
    this.isHelpful.votedBy.push({
      userId: new mongoose.Types.ObjectId(userId),
      vote,
      votedAt: new Date(),
    });
  }
  
  return this.save();
};

// Static method to get comments for a recipe with pagination
recipeCommentSchema.statics.getRecipeComments = async function(
  recipeId: string, 
  options: {
    page?: number;
    limit?: number;
    sortBy?: 'newest' | 'oldest' | 'helpful';
    type?: string;
  } = {}
) {
  const { page = 1, limit = 20, sortBy = 'newest', type } = options;
  const skip = (page - 1) * limit;
  
  const match: any = {
    recipeId: new mongoose.Types.ObjectId(recipeId),
    isVisible: true,
    parentCommentId: { $exists: false }, // Only top-level comments
  };
  
  if (type) {
    match.commentType = type;
  }
  
  let sort: any = {};
  switch (sortBy) {
    case 'oldest':
      sort = { createdAt: 1 };
      break;
    case 'helpful':
      sort = { 'isHelpful.helpfulVotes': -1, createdAt: -1 };
      break;
    default:
      sort = { createdAt: -1 };
  }
  
  return this.aggregate([
    { $match: match },
    { $sort: sort },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'dindin_users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
        pipeline: [{ $project: { name: 1, avatar: 1, username: 1 } }]
      }
    },
    { $unwind: '$user' },
    {
      $lookup: {
        from: 'recipe_comments',
        localField: '_id',
        foreignField: 'parentCommentId',
        as: 'replies',
        pipeline: [
          { $match: { isVisible: true } },
          { $sort: { createdAt: 1 } },
          { $limit: 3 }, // Show only first 3 replies
          {
            $lookup: {
              from: 'dindin_users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user',
              pipeline: [{ $project: { name: 1, avatar: 1, username: 1 } }]
            }
          },
          { $unwind: '$user' }
        ]
      }
    },
    {
      $addFields: {
        netHelpfulVotes: {
          $subtract: ['$isHelpful.helpfulVotes', '$isHelpful.notHelpfulVotes']
        }
      }
    },
    {
      $project: {
        content: 1,
        commentType: 1,
        rating: 1,
        netHelpfulVotes: 1,
        replies: 1,
        tags: 1,
        createdAt: 1,
        user: 1,
        'isHelpful.helpfulVotes': 1,
        'isHelpful.notHelpfulVotes': 1,
      }
    }
  ]);
};

const RecipeComment = model('RecipeComment', recipeCommentSchema);

export { RecipeComment };