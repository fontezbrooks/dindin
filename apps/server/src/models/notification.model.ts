import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Model for notifications related to recipe sharing and interactions
const notificationSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DindinUser',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'recipe_shared',
      'recipe_comment',
      'comment_reply',
      'comment_helpful_vote',
      'recipe_rated',
      'shared_recipe_viewed',
      'collaboration_invite',
      'collaboration_accepted',
      'recipe_tips_added',
      'recipe_liked',
      'follower_shared_recipe'
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  message: {
    type: String,
    required: true,
    maxlength: 500,
  },
  data: {
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
    },
    sharedRecipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SharedRecipe',
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecipeComment',
    },
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DindinUser',
    },
    // Additional context data as needed
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  actionUrl: String,
  expiresAt: Date,
}, {
  collection: 'notifications',
  timestamps: true,
});

// Indexes for efficient querying
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ 'data.fromUserId': 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(notificationData: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  priority?: string;
  actionUrl?: string;
  expiresAt?: Date;
}) {
  const notification = new this({
    ...notificationData,
    userId: new mongoose.Types.ObjectId(notificationData.userId),
  });
  
  return notification.save();
};

// Static method to get user notifications with pagination
notificationSchema.statics.getUserNotifications = async function(
  userId: string,
  options: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    types?: string[];
  } = {}
) {
  const { page = 1, limit = 20, unreadOnly = false, types } = options;
  const skip = (page - 1) * limit;
  
  const match: any = {
    userId: new mongoose.Types.ObjectId(userId),
  };
  
  if (unreadOnly) {
    match.isRead = false;
  }
  
  if (types && types.length > 0) {
    match.type = { $in: types };
  }
  
  const notifications = await this.aggregate([
    { $match: match },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'dindin_users',
        localField: 'data.fromUserId',
        foreignField: '_id',
        as: 'fromUser',
        pipeline: [{ $project: { name: 1, avatar: 1, username: 1 } }]
      }
    },
    {
      $lookup: {
        from: 'recipes',
        localField: 'data.recipeId',
        foreignField: '_id',
        as: 'recipe',
        pipeline: [{ $project: { title: 1, image_url: 1 } }]
      }
    },
    {
      $addFields: {
        fromUser: { $arrayElemAt: ['$fromUser', 0] },
        recipe: { $arrayElemAt: ['$recipe', 0] }
      }
    }
  ]);
  
  return notifications;
};

// Static method to mark multiple notifications as read
notificationSchema.statics.markMultipleAsRead = async function(
  userId: string,
  notificationIds: string[]
) {
  return this.updateMany(
    {
      _id: { $in: notificationIds.map(id => new mongoose.Types.ObjectId(id)) },
      userId: new mongoose.Types.ObjectId(userId),
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      }
    }
  );
};

// Static method to get notification count
notificationSchema.statics.getUnreadCount = async function(userId: string) {
  return this.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    isRead: false,
  });
};

const Notification = model('Notification', notificationSchema);

export { Notification };