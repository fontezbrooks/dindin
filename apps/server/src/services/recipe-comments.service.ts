import { RecipeComment } from '../models/recipe-comment.model';
import { Notification } from '../models/notification.model';
import mongoose from 'mongoose';

export class RecipeCommentsService {
  /**
   * Add a comment to a recipe
   */
  static async addComment(
    recipeId: string,
    userId: string,
    data: {
      content: string;
      commentType?: 'comment' | 'tip' | 'modification' | 'question' | 'review';
      rating?: number;
      parentCommentId?: string;
      sharedRecipeId?: string;
      tags?: string[];
    }
  ): Promise<any> {
    const {
      content,
      commentType = 'comment',
      rating,
      parentCommentId,
      sharedRecipeId,
      tags = []
    } = data;
    
    const comment = new RecipeComment({
      recipeId: new mongoose.Types.ObjectId(recipeId),
      userId: new mongoose.Types.ObjectId(userId),
      content: content.trim(),
      commentType,
      rating,
      parentCommentId: parentCommentId ? new mongoose.Types.ObjectId(parentCommentId) : undefined,
      sharedRecipeId: sharedRecipeId ? new mongoose.Types.ObjectId(sharedRecipeId) : undefined,
      tags: tags.map(tag => tag.toLowerCase().trim()),
    });
    
    await comment.save();
    
    // Update parent comment reply count if this is a reply
    if (parentCommentId) {
      await RecipeComment.findByIdAndUpdate(
        parentCommentId,
        { $inc: { replies: 1 } }
      );
      
      // Notify parent comment author
      const parentComment = await RecipeComment.findById(parentCommentId).populate('userId', 'name');
      if (parentComment && parentComment.userId._id.toString() !== userId) {
        await Notification.createNotification({
          userId: parentComment.userId._id.toString(),
          type: 'comment_reply',
          title: 'Reply to Your Comment',
          message: `Someone replied to your comment on a recipe`,
          data: {
            recipeId: new mongoose.Types.ObjectId(recipeId),
            commentId: comment._id,
            fromUserId: new mongoose.Types.ObjectId(userId),
          },
          actionUrl: `/recipe/${recipeId}#comment-${comment._id}`,
          priority: 'medium',
        });
      }
    } else {
      // Notify recipe owner for top-level comments
      // Note: This would require recipe ownership info
      // TODO: Implement recipe owner notification
    }
    
    // Populate user data before returning
    return RecipeComment.findById(comment._id).populate('userId', 'name username avatar');
  }
  
  /**
   * Get comments for a recipe with pagination and filtering
   */
  static async getRecipeComments(
    recipeId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: 'newest' | 'oldest' | 'helpful';
      type?: 'comment' | 'tip' | 'modification' | 'question' | 'review';
      userId?: string; // For checking user votes
    } = {}
  ): Promise<{
    comments: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const { page = 1, limit = 20, sortBy = 'newest', type, userId } = options;
    
    // Get total count for pagination
    const match: any = {
      recipeId: new mongoose.Types.ObjectId(recipeId),
      isVisible: true,
      parentCommentId: { $exists: false }, // Only top-level comments
    };
    
    if (type) {
      match.commentType = type;
    }
    
    const total = await RecipeComment.countDocuments(match);
    const pages = Math.ceil(total / limit);
    
    // Get comments using the model's static method
    let comments = await RecipeComment.getRecipeComments(recipeId, {
      page,
      limit,
      sortBy,
      type,
    });
    
    // Add user vote information if userId provided
    if (userId) {
      comments = comments.map(comment => {
        const userVote = comment.isHelpful?.votedBy?.find(
          (vote: any) => vote.userId.toString() === userId
        );
        
        return {
          ...comment,
          userVote: userVote?.vote || null,
        };
      });
    }
    
    return {
      comments,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }
  
  /**
   * Get replies for a specific comment
   */
  static async getCommentReplies(
    commentId: string,
    options: {
      page?: number;
      limit?: number;
      userId?: string;
    } = {}
  ): Promise<any[]> {
    const { page = 1, limit = 10, userId } = options;
    const skip = (page - 1) * limit;
    
    let replies = await RecipeComment.find({
      parentCommentId: new mongoose.Types.ObjectId(commentId),
      isVisible: true,
    })
      .populate('userId', 'name username avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);
    
    // Add user vote information if userId provided
    if (userId) {
      replies = replies.map(reply => {
        const userVote = reply.isHelpful?.votedBy?.find(
          (vote: any) => vote.userId.toString() === userId
        );
        
        return {
          ...reply.toObject(),
          userVote: userVote?.vote || null,
          netHelpfulVotes: reply.isHelpful.helpfulVotes - reply.isHelpful.notHelpfulVotes,
        };
      });
    }
    
    return replies;
  }
  
  /**
   * Vote on comment helpfulness
   */
  static async voteOnComment(
    commentId: string,
    userId: string,
    vote: 'helpful' | 'not_helpful'
  ): Promise<any> {
    const comment = await RecipeComment.findById(commentId);
    
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    if (comment.userId.toString() === userId) {
      throw new Error('Cannot vote on your own comment');
    }
    
    await comment.voteHelpful(userId, vote);
    
    // Notify comment author if vote is helpful
    if (vote === 'helpful') {
      await Notification.createNotification({
        userId: comment.userId.toString(),
        type: 'comment_helpful_vote',
        title: 'Your Comment Was Helpful',
        message: 'Someone found your comment helpful!',
        data: {
          commentId: comment._id,
          recipeId: comment.recipeId,
          fromUserId: new mongoose.Types.ObjectId(userId),
        },
        priority: 'low',
      });
    }
    
    return RecipeComment.findById(commentId).populate('userId', 'name username avatar');
  }
  
  /**
   * Edit a comment
   */
  static async editComment(
    commentId: string,
    userId: string,
    updates: {
      content?: string;
      tags?: string[];
    }
  ): Promise<any> {
    const comment = await RecipeComment.findById(commentId);
    
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    if (comment.userId.toString() !== userId) {
      throw new Error('You can only edit your own comments');
    }
    
    // Only allow editing within 24 hours of posting
    const hoursSincePosted = (Date.now() - comment.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSincePosted > 24) {
      throw new Error('Comments can only be edited within 24 hours of posting');
    }
    
    if (updates.content) {
      comment.content = updates.content.trim();
    }
    
    if (updates.tags) {
      comment.tags = updates.tags.map(tag => tag.toLowerCase().trim());
    }
    
    await comment.save();
    
    return RecipeComment.findById(commentId).populate('userId', 'name username avatar');
  }
  
  /**
   * Delete a comment
   */
  static async deleteComment(
    commentId: string,
    userId: string,
    isAdmin: boolean = false
  ): Promise<void> {
    const comment = await RecipeComment.findById(commentId);
    
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    if (!isAdmin && comment.userId.toString() !== userId) {
      throw new Error('You can only delete your own comments');
    }
    
    // Soft delete by making invisible
    comment.isVisible = false;
    await comment.save();
    
    // Update parent comment reply count if this is a reply
    if (comment.parentCommentId) {
      await RecipeComment.findByIdAndUpdate(
        comment.parentCommentId,
        { $inc: { replies: -1 } }
      );
    }
  }
  
  /**
   * Flag a comment as inappropriate
   */
  static async flagComment(
    commentId: string,
    userId: string,
    reason: 'spam' | 'inappropriate' | 'offensive' | 'misinformation' | 'other',
    details?: string
  ): Promise<void> {
    const comment = await RecipeComment.findById(commentId);
    
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    if (comment.userId.toString() === userId) {
      throw new Error('Cannot flag your own comment');
    }
    
    // Add flag reason if not already flagged by this user
    if (!comment.flagReasons.includes(reason)) {
      comment.flagReasons.push(reason);
    }
    
    comment.isFlagged = true;
    await comment.save();
    
    // TODO: Implement admin notification for flagged comments
  }
  
  /**
   * Get comment statistics for a recipe
   */
  static async getCommentStats(recipeId: string): Promise<{
    totalComments: number;
    commentsByType: { [key: string]: number };
    avgRating: number;
    topTags: string[];
  }> {
    const stats = await RecipeComment.aggregate([
      {
        $match: {
          recipeId: new mongoose.Types.ObjectId(recipeId),
          isVisible: true,
        }
      },
      {
        $group: {
          _id: null,
          totalComments: { $sum: 1 },
          commentsByType: {
            $push: '$commentType'
          },
          ratings: {
            $push: {
              $cond: [{ $ne: ['$rating', null] }, '$rating', '$$REMOVE']
            }
          },
          allTags: {
            $push: '$tags'
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalComments: 1,
          commentsByType: 1,
          avgRating: { $avg: '$ratings' },
          allTags: {
            $reduce: {
              input: '$allTags',
              initialValue: [],
              in: { $concatArrays: ['$$value', '$$this'] }
            }
          }
        }
      }
    ]);
    
    if (!stats.length) {
      return {
        totalComments: 0,
        commentsByType: {},
        avgRating: 0,
        topTags: [],
      };
    }
    
    const result = stats[0];
    
    // Process comment types
    const commentsByType = result.commentsByType.reduce((acc: any, type: string) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    // Get top tags (most frequent)
    const tagCounts = result.allTags.reduce((acc: any, tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});
    
    const topTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([tag]) => tag);
    
    return {
      totalComments: result.totalComments,
      commentsByType,
      avgRating: Math.round((result.avgRating || 0) * 10) / 10,
      topTags,
    };
  }
  
  /**
   * Get user's comment activity
   */
  static async getUserCommentActivity(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      type?: string;
    } = {}
  ): Promise<any[]> {
    const { page = 1, limit = 20, type } = options;
    const skip = (page - 1) * limit;
    
    const match: any = {
      userId: new mongoose.Types.ObjectId(userId),
      isVisible: true,
    };
    
    if (type) {
      match.commentType = type;
    }
    
    return RecipeComment.find(match)
      .populate('recipeId', 'title image_url')
      .select('content commentType rating createdAt netHelpfulVotes replies')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }
}