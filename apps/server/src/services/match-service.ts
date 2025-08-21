import { Match, DindinUser, Recipe } from '../db';
import { getWebSocketServer } from '../websocket-enhanced';
import { matchEventEmitter } from '../routers/match';
import { Types } from 'mongoose';

interface MatchData {
  id: string;
  recipe: {
    id: string;
    title: string;
    imageUrl: string;
    cookTime: number;
    difficulty: string;
    cuisine: string;
  };
  matchedAt: Date;
  users: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export class MatchService {
  /**
   * Creates a match between two users for a recipe
   * Handles all side effects including notifications and stats updates
   */
  static async createMatch(
    userId1: Types.ObjectId,
    userId2: Types.ObjectId,
    recipeId: Types.ObjectId | string
  ): Promise<any> {
    try {
      console.log(`Creating match between users ${userId1} and ${userId2} for recipe ${recipeId}`);
      
      // Check if match already exists
      const existingMatch = await Match.findOne({
        users: { $all: [userId1, userId2] },
        recipeId: recipeId
      });

      if (existingMatch) {
        console.log('Match already exists');
        return existingMatch;
      }

      // Create the match
      const match = await Match.create({
        users: [userId1, userId2],
        recipeId,
        status: 'matched',
        matchedAt: new Date(),
        interactions: {
          viewCount: 0,
          lastActivityAt: new Date()
        }
      });

      // Populate recipe data
      await match.populate('recipeId');

      // Update both users' stats
      const users = await DindinUser.find({
        _id: { $in: [userId1, userId2] }
      });

      for (const user of users) {
        if (!user.stats) {
          user.stats = {
            totalMatches: 0,
            recipesCooked: 0,
            averageRating: 0,
            successfulConnections: 0
          };
        }
        user.stats.totalMatches = (user.stats.totalMatches || 0) + 1;
        await user.save();
      }

      // Prepare notification payload
      const recipeData = match.recipeId as any;
      const matchData: MatchData = {
        id: match._id.toString(),
        recipe: {
          id: recipeData._id.toString(),
          title: recipeData.title,
          imageUrl: recipeData.imageUrl,
          cookTime: recipeData.cookTime,
          difficulty: recipeData.difficulty,
          cuisine: recipeData.cuisine
        },
        matchedAt: match.matchedAt,
        users: users.map(u => ({
          id: u._id.toString(),
          name: u.name || 'Unknown User',
          avatar: u.avatar
        }))
      };

      // Send real-time notifications via WebSocket
      const wsServer = getWebSocketServer();
      if (wsServer) {
        const notificationsSent = wsServer.sendToPartners(
          userId1.toString(),
          userId2.toString(),
          {
            type: 'newMatch',
            payload: matchData
          }
        );
        
        if (notificationsSent) {
          console.log(`✅ Match notifications sent to both partners`);
        } else {
          console.log('⚠️ One or both partners not connected for real-time notification');
        }
      } else {
        console.log('⚠️ WebSocket server not available');
      }

      // Emit event for subscriptions
      matchEventEmitter.emit('newMatch', { match: matchData });

      // Send push notifications (if enabled)
      await this.sendPushNotifications(users, match);

      console.log(`✅ Match created successfully: ${match._id}`);
      return match;
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  }

  /**
   * Sends push notifications to users about new match
   */
  static async sendPushNotifications(users: any[], match: any) {
    // TODO: Integrate with push notification service
    // This would use Expo Push Notifications or Firebase
    console.log('Push notifications would be sent here to:', users.map(u => u.name).join(', '));
  }

  /**
   * Checks if both users have liked a recipe
   */
  static async checkForMatch(
    userId: Types.ObjectId,
    partnerId: Types.ObjectId,
    recipeId: Types.ObjectId | string
  ): Promise<boolean> {
    try {
      const partner = await DindinUser.findById(partnerId);
      
      if (!partner) {
        console.log('Partner not found');
        return false;
      }
      
      // Check if partner has liked this recipe
      const hasLiked = partner.likedRecipes?.some(
        id => id.toString() === recipeId.toString()
      ) || false;
      
      console.log(`Partner ${partner.name} has ${hasLiked ? '' : 'NOT '}liked recipe ${recipeId}`);
      return hasLiked;
    } catch (error) {
      console.error('Error checking for match:', error);
      return false;
    }
  }

  /**
   * Notifies partner about swiping activity
   */
  static async notifyPartnerActivity(
    userId: Types.ObjectId | string,
    partnerId: Types.ObjectId | string,
    activity: string,
    data?: any
  ) {
    const wsServer = getWebSocketServer();
    if (!wsServer) {
      console.log('WebSocket server not available for partner activity notification');
      return false;
    }

    return wsServer.sendToUser(partnerId.toString(), {
      type: 'partnerActivity',
      payload: {
        userId: userId.toString(),
        activity,
        data,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Gets recent matches for a user
   */
  static async getUserMatches(
    userId: Types.ObjectId | string,
    limit: number = 20
  ): Promise<any[]> {
    try {
      const matches = await Match.find({
        users: userId
      })
        .populate('recipeId')
        .populate('users', 'name avatar')
        .sort('-matchedAt')
        .limit(limit)
        .lean();

      return matches;
    } catch (error) {
      console.error('Error getting user matches:', error);
      throw error;
    }
  }

  /**
   * Updates match interaction count
   */
  static async recordMatchInteraction(matchId: Types.ObjectId | string) {
    try {
      const match = await Match.findById(matchId);
      if (match) {
        if (!match.interactions) {
          match.interactions = {
            viewCount: 0,
            lastActivityAt: new Date()
          };
        }
        match.interactions.viewCount += 1;
        match.interactions.lastActivityAt = new Date();
        await match.save();
      }
    } catch (error) {
      console.error('Error recording match interaction:', error);
    }
  }
}