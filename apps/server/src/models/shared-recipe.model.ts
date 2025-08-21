import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Model for shared recipes with privacy controls
const sharedRecipeSchema = new Schema({
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true,
  },
  sharedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DindinUser',
    required: true,
  },
  shareToken: {
    type: String,
    unique: true,
    required: true,
  },
  shareType: {
    type: String,
    enum: ['public', 'friends_only', 'private', 'specific_users'],
    default: 'public',
  },
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DindinUser',
    },
    sharedAt: {
      type: Date,
      default: Date.now,
    },
    viewedAt: Date,
  }],
  shareUrl: {
    type: String,
    required: true,
  },
  metadata: {
    title: String,
    description: String,
    imageUrl: String,
    ogTags: {
      type: Map,
      of: String,
    },
  },
  analytics: {
    totalViews: {
      type: Number,
      default: 0,
    },
    uniqueViews: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    platforms: {
      whatsapp: { type: Number, default: 0 },
      facebook: { type: Number, default: 0 },
      twitter: { type: Number, default: 0 },
      email: { type: Number, default: 0 },
      direct: { type: Number, default: 0 },
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiresAt: Date,
}, {
  collection: 'shared_recipes',
  timestamps: true,
});

// Indexes for efficient querying
sharedRecipeSchema.index({ shareToken: 1 });
sharedRecipeSchema.index({ sharedBy: 1, createdAt: -1 });
sharedRecipeSchema.index({ recipeId: 1 });
sharedRecipeSchema.index({ 'sharedWith.userId': 1 });
sharedRecipeSchema.index({ shareType: 1, isActive: 1 });
sharedRecipeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if share is expired
sharedRecipeSchema.virtual('isExpired').get(function() {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Method to increment view count
sharedRecipeSchema.methods.incrementView = async function(userId?: string) {
  this.analytics.totalViews += 1;
  
  // Track unique views (simple implementation)
  if (userId && !this.sharedWith.some(sw => sw.userId?.toString() === userId)) {
    this.analytics.uniqueViews += 1;
    this.sharedWith.push({
      userId: new mongoose.Types.ObjectId(userId),
      viewedAt: new Date(),
    });
  }
  
  return this.save();
};

// Method to increment share count by platform
sharedRecipeSchema.methods.incrementShare = async function(platform: string) {
  this.analytics.shares += 1;
  if (this.analytics.platforms[platform] !== undefined) {
    this.analytics.platforms[platform] += 1;
  }
  return this.save();
};

// Static method to get sharing stats for a user
sharedRecipeSchema.statics.getUserSharingStats = async function(userId: string) {
  return this.aggregate([
    { $match: { sharedBy: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalShares: { $sum: 1 },
        totalViews: { $sum: '$analytics.totalViews' },
        totalUniqueViews: { $sum: '$analytics.uniqueViews' },
        totalShareActions: { $sum: '$analytics.shares' },
        avgViewsPerShare: { $avg: '$analytics.totalViews' },
        platformBreakdown: {
          $push: '$analytics.platforms'
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalShares: 1,
        totalViews: 1,
        totalUniqueViews: 1,
        totalShareActions: 1,
        avgViewsPerShare: { $round: ['$avgViewsPerShare', 1] },
      }
    }
  ]);
};

const SharedRecipe = model('SharedRecipe', sharedRecipeSchema);

export { SharedRecipe };